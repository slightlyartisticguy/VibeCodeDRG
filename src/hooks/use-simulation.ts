import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

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

type SimulationRequest = z.infer<typeof simulationRequestSchema>;

async function runSimulation(request: SimulationRequest) {
  const response = await fetch("/api/simulate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Simulation failed");
  }

  return response.json();
}

export function useSimulation() {
  return useMutation({
    mutationFn: runSimulation,
  });
}
