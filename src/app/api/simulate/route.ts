import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import yahooFinance from "yahoo-finance2";
import { getHistoricalData } from "@/lib/yahoo-finance";

const simulationRequestSchema = z.object({
  holdings: z.array(
    z.object({
      symbol: z.string(),
      quantity: z.number(),
      avg_price: z.number(),
    })
  ),
  simulationType: z.enum(["monte-carlo", "interest-rate", "dcf"]),
  years: z.number().optional(),
  numSimulations: z.number().optional(),
  interestRateChange: z.number().optional(),
  annualWithdrawal: z.number().optional(),
  inflationRate: z.number().optional(),
  initialAmount: z.number().optional(),
});

/** Box-Muller transform — returns a standard normal random variate */
function gaussianRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/** Returns the value at a given percentile in a SORTED array */
function percentile(sorted: number[], p: number): number {
  const idx = Math.min(Math.floor(p * sorted.length), sorted.length - 1);
  return sorted[idx];
}

/**
 * Full Monte Carlo simulation based on historical annual returns.
 * Uses Geometric Brownian Motion with proper Gaussian shocks.
 * Tracks full per-year paths and returns 5 percentile bands.
 */
async function runMonteCarloSimulation(
  holdings: z.infer<typeof simulationRequestSchema>["holdings"],
  years: number,
  numSimulations: number,
  annualWithdrawal: number,
  inflationRate: number,
  initialAmount: number
) {
  // Fetch full history for each symbol
  const historicalData = await Promise.all(
    holdings.map((h) => getHistoricalData(h.symbol, "ALL"))
  );

  // Compute each symbol's annual returns weighted by portfolio share
  const currentPrices = holdings.map((h, i) => {
    const data = historicalData[i];
    return data && data.length > 0 ? data[data.length - 1].close : h.avg_price;
  });

  const currentPortfolioValue = holdings.reduce(
    (sum, h, i) => sum + h.quantity * currentPrices[i],
    0
  );

  const startValue = initialAmount > 0 ? initialAmount : currentPortfolioValue;

  // Compute portfolio weights
  const weights = holdings.map((h, i) => (h.quantity * currentPrices[i]) / (currentPortfolioValue || 1));

  // Compute annualised return stats per asset from full history
  // Build per-year returns aligned by calendar year
  const assetAnnualReturns: number[][] = holdings.map((_, i) => {
    const data = historicalData[i];
    if (!data || data.length < 2) return [];
    const byYear: Record<string, number[]> = {};
    for (let j = 1; j < data.length; j++) {
      const year = data[j].date.slice(0, 4);
      if (!byYear[year]) byYear[year] = [];
      byYear[year].push((data[j].close - data[j - 1].close) / data[j - 1].close);
    }
    return Object.values(byYear).map((dailies) => {
      // Compound daily returns into annual return
      return dailies.reduce((prod, r) => prod * (1 + r), 1) - 1;
    });
  });

  // Build portfolio-level annual returns as weighted sum
  const numYearsOfHistory = Math.max(...assetAnnualReturns.map((a) => a.length), 1);
  const portfolioAnnualReturns: number[] = [];
  for (let y = 0; y < numYearsOfHistory; y++) {
    let pr = 0;
    for (let j = 0; j < holdings.length; j++) {
      const ars = assetAnnualReturns[j];
      if (ars.length === 0) continue;
      pr += weights[j] * (ars[y % ars.length] ?? ars[ars.length - 1]);
    }
    portfolioAnnualReturns.push(pr);
  }

  const meanReturn =
    portfolioAnnualReturns.reduce((s, r) => s + r, 0) / (portfolioAnnualReturns.length || 1);
  const variance =
    portfolioAnnualReturns.reduce((s, r) => s + Math.pow(r - meanReturn, 2), 0) /
    (portfolioAnnualReturns.length || 1);
  const stdDev = Math.sqrt(variance);

  // GBM drift: μ - σ²/2  (log-normal)
  const drift = meanReturn - variance / 2;

  // Run simulations — store value at each year for all paths
  const yearlyValuesByPercentile: Array<{
    year: number;
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  }> = [];

  // allPaths[year][sim] = portfolio value
  const allPaths: number[][] = Array.from({ length: years }, () => []);
  let survivedCount = 0;

  for (let sim = 0; sim < numSimulations; sim++) {
    let value = startValue;
    let withdrawal = annualWithdrawal;
    let survived = true;
    for (let y = 0; y < years; y++) {
      // Apply GBM step
      const shock = gaussianRandom();
      value = value * Math.exp(drift + stdDev * shock);
      // Apply annual withdrawal (inflation-adjusted each year)
      value -= withdrawal;
      if (value <= 0) {
        value = 0;
        survived = false;
      }
      withdrawal *= 1 + inflationRate;
      allPaths[y].push(value);
    }
    if (survived) survivedCount++;
  }

  const startYear = new Date().getFullYear() + 1;
  for (let y = 0; y < years; y++) {
    const sorted = [...allPaths[y]].sort((a, b) => a - b);
    yearlyValuesByPercentile.push({
      year: startYear + y,
      p10: percentile(sorted, 0.10),
      p25: percentile(sorted, 0.25),
      p50: percentile(sorted, 0.50),
      p75: percentile(sorted, 0.75),
      p90: percentile(sorted, 0.90),
    });
  }

  const finalValues = allPaths[years - 1];
  const sortedFinal = [...finalValues].sort((a, b) => a - b);

  return {
    type: "monte-carlo",
    meta: {
      initialAmount: startValue,
      annualWithdrawal,
      inflationRate,
      annualMeanReturn: meanReturn,
      annualStdDev: stdDev,
      numSimulations,
      years,
      successRate: (survivedCount / numSimulations) * 100,
    },
    summary: {
      median:  percentile(sortedFinal, 0.50),
      p10:     percentile(sortedFinal, 0.10),
      p25:     percentile(sortedFinal, 0.25),
      p75:     percentile(sortedFinal, 0.75),
      p90:     percentile(sortedFinal, 0.90),
    },
    results: yearlyValuesByPercentile,
  };
}


// Helper for Interest Rate Sensitivity
async function runInterestRateSimulation(
    holdings: z.infer<typeof simulationRequestSchema>["holdings"],
    interestRateChange: number
) {
    let totalValueChange = 0;
    let initialPortfolioValue = 0;

    for (const holding of holdings) {
        const quote = await yahooFinance.quote(holding.symbol);
        const peRatio = quote.trailingPE || 25; // Default P/E if not available
        const currentPrice = quote.regularMarketPrice || holding.avg_price;
        initialPortfolioValue += currentPrice * holding.quantity;

        // Simplified model: Higher P/E stocks are more sensitive to rate changes.
        // This is a highly simplified assumption.
        const sensitivityFactor = Math.log(peRatio) / Math.log(25); // Normalize sensitivity around a P/E of 25
        const priceChangePercentage = -sensitivityFactor * interestRateChange;
        
        totalValueChange += (currentPrice * priceChangePercentage / 100) * holding.quantity;
    }

    const portfolioValueChange = (totalValueChange / initialPortfolioValue) * 100;

    return { type: "interest-rate", results: { portfolioValueChange } };
}

// Helper for DCF
async function runDcfSimulation(holdings: z.infer<typeof simulationRequestSchema>["holdings"]) {
    let totalIntrinsicValue = 0;
    const discountRate = 0.07; // WACC assumption
    const terminalGrowthRate = 0.02; // Perpetual growth rate assumption

    for (const holding of holdings) {
        const summaryDetail = await yahooFinance.quoteSummary(holding.symbol, { modules: ["summaryDetail", "earningsTrend"] });
        
        const earningsTrend = summaryDetail.earningsTrend?.trend.find(t => t.period === "+5y");
        const growthRate = earningsTrend?.growth || 0.05; // Default growth rate if not available

        const quote = await yahooFinance.quote(holding.symbol);
        const currentEPS = quote.epsTrailingTwelveMonths;

        if (currentEPS) {
            let futureCF = [];
            for (let i = 1; i <= 5; i++) {
                futureCF.push(currentEPS * Math.pow(1 + growthRate, i));
            }

            const terminalValue = (futureCF[4] * (1 + terminalGrowthRate)) / (discountRate - terminalGrowthRate);
            
            let presentValue = 0;
            for (let i = 0; i < 5; i++) {
                presentValue += futureCF[i] / Math.pow(1 + discountRate, i + 1);
            }
            presentValue += terminalValue / Math.pow(1 + discountRate, 5);

            totalIntrinsicValue += presentValue * holding.quantity;
        }
    }

    return { type: "dcf", results: { intrinsicValue: totalIntrinsicValue } };
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      holdings,
      simulationType,
      years = 10,
      numSimulations = 1000,
      interestRateChange = 0.5,
      annualWithdrawal = 0,
      inflationRate = 0.025,
      initialAmount = 0,
    } = simulationRequestSchema.parse(body);

    if (holdings.length === 0) {
      return NextResponse.json(
        { error: "Portfolio cannot be empty" },
        { status: 400 }
      );
    }

    let results;
    switch (simulationType) {
      case "monte-carlo":
        results = await runMonteCarloSimulation(holdings, years, numSimulations, annualWithdrawal, inflationRate, initialAmount);
        break;
      case "interest-rate":
        results = await runInterestRateSimulation(holdings, interestRateChange);
        break;
      case "dcf":
        results = await runDcfSimulation(holdings);
        break;
      default:
        return NextResponse.json({ error: "Invalid simulation type" }, { status: 400 });
    }

    return NextResponse.json(results);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Simulation Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during the simulation." },
      { status: 500 }
    );
  }
}
