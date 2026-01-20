# StockSim - Learn Investing Through Practice

A hypothetical stock portfolio simulator built with Next.js to help people learn about investing through interactive practice without any real financial risk.

## Features

### 📊 Portfolio Dashboard
- Real-time portfolio value tracking
- Performance charts with customizable time ranges
- Market overview with indices and top movers
- Cash balance and position tracking

### 💼 Portfolio Management
- View detailed holdings with gain/loss tracking
- Sort positions by various metrics
- Asset allocation visualization
- Trade history with complete transaction log

### 🔍 Stock Search
- Search 50+ popular stocks and ETFs across all major sectors
- Quick keyboard navigation (⌘K to open search)
- Real-time price quotes and changes
- Support for Technology, Finance, Healthcare, Consumer, Energy, and more

### 📈 Buy & Sell Trading
- Market order simulation
- Share quantity selection with quick buttons
- Real-time order total calculation
- Validation for available cash and shares

### ⚡ Strategy Builder
- Create automated trading strategies with conditions
- Multiple technical indicators: Price, Volume, SMA, RSI, and more
- Configurable actions: Buy/Sell with shares, percentage, or dollar amount
- Enable/disable strategies for simulations

### 🎮 Portfolio Simulation
- Backtest strategies with historical data
- Compare performance against benchmarks (S&P 500, NASDAQ, Dow)
- Key metrics: Total Return, Sharpe Ratio, Max Drawdown, Win Rate
- Visual performance comparison charts

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: React Context + useReducer
- **Data Persistence**: Local Storage

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/slightlyartisticguy/VibeCodeDRG.git
cd VibeCodeDRG
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard
│   ├── portfolio/         # Portfolio management
│   ├── strategy/          # Strategy builder
│   └── simulation/        # Backtesting simulation
├── components/            # React components
│   ├── Header.tsx         # Navigation header
│   ├── Charts.tsx         # Portfolio & stock charts
│   ├── PortfolioTable.tsx # Holdings table
│   ├── SearchModal.tsx    # Stock search
│   ├── TradeModal.tsx     # Buy/sell interface
│   ├── StrategyBuilder.tsx # Strategy creation
│   └── ...
├── context/               # React Context
│   └── AppContext.tsx     # Global state management
├── lib/                   # Utilities
│   ├── stockData.ts       # Stock database & API
│   └── utils.ts           # Helper functions
└── types/                 # TypeScript types
    └── index.ts           # All type definitions
```

## Available Stocks

The simulator includes 50+ popular investments across sectors:
- **Technology**: AAPL, MSFT, GOOGL, AMZN, META, NVDA, TSLA, AMD, etc.
- **Financial**: JPM, BAC, V, MA, GS, MS, etc.
- **Healthcare**: JNJ, UNH, PFE, ABBV, MRK, LLY, etc.
- **Consumer**: WMT, PG, KO, PEP, COST, MCD, NKE, SBUX, etc.
- **Energy**: XOM, CVX, COP
- **Industrial**: CAT, BA, GE, UPS, HON
- **ETFs**: SPY, QQQ, IWM, DIA, VTI, VOO
- **Communication**: DIS, NFLX, T, VZ, CMCSA

## Disclaimer

⚠️ **Educational Purpose Only**

This application is designed for educational purposes to help users learn about investing concepts. It uses simulated data and does not connect to real financial markets. The strategies and simulations shown do not constitute financial advice. Always consult with a qualified financial advisor before making real investment decisions.

## License

MIT License - feel free to use this project for learning and educational purposes.
