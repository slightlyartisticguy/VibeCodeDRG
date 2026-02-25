/**
 * Searchable Securities Database
 *
 * A comprehensive local list of stocks, ETFs, and index funds available
 * on Alpha Vantage. Used for instant client-side search — detailed data
 * (quotes, time series, overview) is only fetched on demand from the API.
 *
 * Categories:
 *   stock  — Individual equities
 *   etf    — Exchange-Traded Funds
 *   index  — Index funds / index-tracking ETFs
 */

export interface SecurityEntry {
  symbol: string;
  name: string;
  type: 'stock' | 'etf' | 'index';
}

/** Major US individual stocks (S&P 500 + popular large/mid-caps) */
const STOCKS: SecurityEntry[] = [
  // Technology
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', type: 'stock' },
  { symbol: 'GOOG', name: 'Alphabet Inc. Class C', type: 'stock' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'stock' },
  { symbol: 'META', name: 'Meta Platforms Inc.', type: 'stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', type: 'stock' },
  { symbol: 'ORCL', name: 'Oracle Corporation', type: 'stock' },
  { symbol: 'CRM', name: 'Salesforce Inc.', type: 'stock' },
  { symbol: 'ADBE', name: 'Adobe Inc.', type: 'stock' },
  { symbol: 'AMD', name: 'Advanced Micro Devices Inc.', type: 'stock' },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.', type: 'stock' },
  { symbol: 'INTC', name: 'Intel Corporation', type: 'stock' },
  { symbol: 'QCOM', name: 'QUALCOMM Inc.', type: 'stock' },
  { symbol: 'IBM', name: 'International Business Machines', type: 'stock' },
  { symbol: 'TXN', name: 'Texas Instruments Inc.', type: 'stock' },
  { symbol: 'NOW', name: 'ServiceNow Inc.', type: 'stock' },
  { symbol: 'INTU', name: 'Intuit Inc.', type: 'stock' },
  { symbol: 'AMAT', name: 'Applied Materials Inc.', type: 'stock' },
  { symbol: 'MU', name: 'Micron Technology Inc.', type: 'stock' },
  { symbol: 'LRCX', name: 'Lam Research Corporation', type: 'stock' },
  { symbol: 'SNPS', name: 'Synopsys Inc.', type: 'stock' },
  { symbol: 'KLAC', name: 'KLA Corporation', type: 'stock' },
  { symbol: 'PANW', name: 'Palo Alto Networks Inc.', type: 'stock' },
  { symbol: 'CRWD', name: 'CrowdStrike Holdings Inc.', type: 'stock' },
  { symbol: 'SNOW', name: 'Snowflake Inc.', type: 'stock' },
  { symbol: 'NET', name: 'Cloudflare Inc.', type: 'stock' },
  { symbol: 'PLTR', name: 'Palantir Technologies Inc.', type: 'stock' },
  { symbol: 'UBER', name: 'Uber Technologies Inc.', type: 'stock' },
  { symbol: 'SQ', name: 'Block Inc.', type: 'stock' },
  { symbol: 'SHOP', name: 'Shopify Inc.', type: 'stock' },
  { symbol: 'SPOT', name: 'Spotify Technology S.A.', type: 'stock' },
  { symbol: 'SNAP', name: 'Snap Inc.', type: 'stock' },
  { symbol: 'PINS', name: 'Pinterest Inc.', type: 'stock' },
  { symbol: 'ROKU', name: 'Roku Inc.', type: 'stock' },
  { symbol: 'ZM', name: 'Zoom Video Communications', type: 'stock' },
  { symbol: 'DDOG', name: 'Datadog Inc.', type: 'stock' },
  { symbol: 'MDB', name: 'MongoDB Inc.', type: 'stock' },
  { symbol: 'TEAM', name: 'Atlassian Corporation', type: 'stock' },
  { symbol: 'ZS', name: 'Zscaler Inc.', type: 'stock' },
  { symbol: 'OKTA', name: 'Okta Inc.', type: 'stock' },
  { symbol: 'WDAY', name: 'Workday Inc.', type: 'stock' },
  { symbol: 'VEEV', name: 'Veeva Systems Inc.', type: 'stock' },
  { symbol: 'SPLK', name: 'Splunk Inc.', type: 'stock' },
  { symbol: 'TWLO', name: 'Twilio Inc.', type: 'stock' },
  { symbol: 'U', name: 'Unity Software Inc.', type: 'stock' },
  { symbol: 'RBLX', name: 'Roblox Corporation', type: 'stock' },
  { symbol: 'COIN', name: 'Coinbase Global Inc.', type: 'stock' },
  { symbol: 'HOOD', name: 'Robinhood Markets Inc.', type: 'stock' },
  { symbol: 'PATH', name: 'UiPath Inc.', type: 'stock' },

  // Communication / Media
  { symbol: 'NFLX', name: 'Netflix Inc.', type: 'stock' },
  { symbol: 'DIS', name: 'The Walt Disney Company', type: 'stock' },
  { symbol: 'CMCSA', name: 'Comcast Corporation', type: 'stock' },
  { symbol: 'T', name: 'AT&T Inc.', type: 'stock' },
  { symbol: 'VZ', name: 'Verizon Communications Inc.', type: 'stock' },
  { symbol: 'TMUS', name: 'T-Mobile US Inc.', type: 'stock' },
  { symbol: 'CHTR', name: 'Charter Communications Inc.', type: 'stock' },
  { symbol: 'WBD', name: 'Warner Bros. Discovery Inc.', type: 'stock' },
  { symbol: 'EA', name: 'Electronic Arts Inc.', type: 'stock' },
  { symbol: 'TTWO', name: 'Take-Two Interactive Software', type: 'stock' },
  { symbol: 'ATVI', name: 'Activision Blizzard Inc.', type: 'stock' },

  // Finance
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'stock' },
  { symbol: 'V', name: 'Visa Inc.', type: 'stock' },
  { symbol: 'MA', name: 'Mastercard Inc.', type: 'stock' },
  { symbol: 'BAC', name: 'Bank of America Corporation', type: 'stock' },
  { symbol: 'WFC', name: 'Wells Fargo & Company', type: 'stock' },
  { symbol: 'GS', name: 'The Goldman Sachs Group Inc.', type: 'stock' },
  { symbol: 'MS', name: 'Morgan Stanley', type: 'stock' },
  { symbol: 'C', name: 'Citigroup Inc.', type: 'stock' },
  { symbol: 'BLK', name: 'BlackRock Inc.', type: 'stock' },
  { symbol: 'SCHW', name: 'Charles Schwab Corporation', type: 'stock' },
  { symbol: 'AXP', name: 'American Express Company', type: 'stock' },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.', type: 'stock' },
  { symbol: 'COF', name: 'Capital One Financial', type: 'stock' },
  { symbol: 'USB', name: 'U.S. Bancorp', type: 'stock' },
  { symbol: 'PNC', name: 'PNC Financial Services', type: 'stock' },
  { symbol: 'TFC', name: 'Truist Financial Corporation', type: 'stock' },
  { symbol: 'BK', name: 'The Bank of New York Mellon', type: 'stock' },
  { symbol: 'CME', name: 'CME Group Inc.', type: 'stock' },
  { symbol: 'ICE', name: 'Intercontinental Exchange', type: 'stock' },
  { symbol: 'SPGI', name: 'S&P Global Inc.', type: 'stock' },
  { symbol: 'MCO', name: 'Moody\'s Corporation', type: 'stock' },
  { symbol: 'MMC', name: 'Marsh & McLennan Companies', type: 'stock' },
  { symbol: 'AON', name: 'Aon plc', type: 'stock' },
  { symbol: 'MET', name: 'MetLife Inc.', type: 'stock' },
  { symbol: 'PRU', name: 'Prudential Financial Inc.', type: 'stock' },
  { symbol: 'AIG', name: 'American International Group', type: 'stock' },
  { symbol: 'ALL', name: 'The Allstate Corporation', type: 'stock' },
  { symbol: 'TRV', name: 'The Travelers Companies', type: 'stock' },

  // Healthcare
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', type: 'stock' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', type: 'stock' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', type: 'stock' },
  { symbol: 'PFE', name: 'Pfizer Inc.', type: 'stock' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', type: 'stock' },
  { symbol: 'MRK', name: 'Merck & Co. Inc.', type: 'stock' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific', type: 'stock' },
  { symbol: 'ABT', name: 'Abbott Laboratories', type: 'stock' },
  { symbol: 'DHR', name: 'Danaher Corporation', type: 'stock' },
  { symbol: 'BMY', name: 'Bristol-Myers Squibb Company', type: 'stock' },
  { symbol: 'AMGN', name: 'Amgen Inc.', type: 'stock' },
  { symbol: 'GILD', name: 'Gilead Sciences Inc.', type: 'stock' },
  { symbol: 'VRTX', name: 'Vertex Pharmaceuticals', type: 'stock' },
  { symbol: 'REGN', name: 'Regeneron Pharmaceuticals', type: 'stock' },
  { symbol: 'ISRG', name: 'Intuitive Surgical Inc.', type: 'stock' },
  { symbol: 'MDT', name: 'Medtronic plc', type: 'stock' },
  { symbol: 'SYK', name: 'Stryker Corporation', type: 'stock' },
  { symbol: 'BSX', name: 'Boston Scientific Corporation', type: 'stock' },
  { symbol: 'EW', name: 'Edwards Lifesciences', type: 'stock' },
  { symbol: 'ZTS', name: 'Zoetis Inc.', type: 'stock' },
  { symbol: 'CI', name: 'The Cigna Group', type: 'stock' },
  { symbol: 'ELV', name: 'Elevance Health Inc.', type: 'stock' },
  { symbol: 'HCA', name: 'HCA Healthcare Inc.', type: 'stock' },
  { symbol: 'CVS', name: 'CVS Health Corporation', type: 'stock' },
  { symbol: 'MRNA', name: 'Moderna Inc.', type: 'stock' },
  { symbol: 'BIIB', name: 'Biogen Inc.', type: 'stock' },

  // Consumer
  { symbol: 'WMT', name: 'Walmart Inc.', type: 'stock' },
  { symbol: 'PG', name: 'Procter & Gamble Company', type: 'stock' },
  { symbol: 'KO', name: 'The Coca-Cola Company', type: 'stock' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', type: 'stock' },
  { symbol: 'COST', name: 'Costco Wholesale Corporation', type: 'stock' },
  { symbol: 'HD', name: 'The Home Depot Inc.', type: 'stock' },
  { symbol: 'LOW', name: 'Lowe\'s Companies Inc.', type: 'stock' },
  { symbol: 'MCD', name: 'McDonald\'s Corporation', type: 'stock' },
  { symbol: 'SBUX', name: 'Starbucks Corporation', type: 'stock' },
  { symbol: 'NKE', name: 'NIKE Inc.', type: 'stock' },
  { symbol: 'TGT', name: 'Target Corporation', type: 'stock' },
  { symbol: 'TJX', name: 'The TJX Companies Inc.', type: 'stock' },
  { symbol: 'ROST', name: 'Ross Stores Inc.', type: 'stock' },
  { symbol: 'EL', name: 'The Estée Lauder Companies', type: 'stock' },
  { symbol: 'CL', name: 'Colgate-Palmolive Company', type: 'stock' },
  { symbol: 'KMB', name: 'Kimberly-Clark Corporation', type: 'stock' },
  { symbol: 'MDLZ', name: 'Mondelez International', type: 'stock' },
  { symbol: 'GIS', name: 'General Mills Inc.', type: 'stock' },
  { symbol: 'K', name: 'Kellanova', type: 'stock' },
  { symbol: 'KHC', name: 'The Kraft Heinz Company', type: 'stock' },
  { symbol: 'HSY', name: 'The Hershey Company', type: 'stock' },
  { symbol: 'STZ', name: 'Constellation Brands Inc.', type: 'stock' },
  { symbol: 'PM', name: 'Philip Morris International', type: 'stock' },
  { symbol: 'MO', name: 'Altria Group Inc.', type: 'stock' },
  { symbol: 'YUM', name: 'Yum! Brands Inc.', type: 'stock' },
  { symbol: 'CMG', name: 'Chipotle Mexican Grill', type: 'stock' },
  { symbol: 'DPZ', name: 'Domino\'s Pizza Inc.', type: 'stock' },
  { symbol: 'ABNB', name: 'Airbnb Inc.', type: 'stock' },
  { symbol: 'BKNG', name: 'Booking Holdings Inc.', type: 'stock' },
  { symbol: 'MAR', name: 'Marriott International', type: 'stock' },
  { symbol: 'HLT', name: 'Hilton Worldwide Holdings', type: 'stock' },
  { symbol: 'LULU', name: 'Lululemon Athletica', type: 'stock' },

  // Industrials
  { symbol: 'CAT', name: 'Caterpillar Inc.', type: 'stock' },
  { symbol: 'DE', name: 'Deere & Company', type: 'stock' },
  { symbol: 'HON', name: 'Honeywell International', type: 'stock' },
  { symbol: 'UNP', name: 'Union Pacific Corporation', type: 'stock' },
  { symbol: 'RTX', name: 'RTX Corporation', type: 'stock' },
  { symbol: 'BA', name: 'The Boeing Company', type: 'stock' },
  { symbol: 'LMT', name: 'Lockheed Martin Corporation', type: 'stock' },
  { symbol: 'GD', name: 'General Dynamics Corporation', type: 'stock' },
  { symbol: 'NOC', name: 'Northrop Grumman Corporation', type: 'stock' },
  { symbol: 'GE', name: 'GE Aerospace', type: 'stock' },
  { symbol: 'MMM', name: '3M Company', type: 'stock' },
  { symbol: 'EMR', name: 'Emerson Electric Co.', type: 'stock' },
  { symbol: 'ETN', name: 'Eaton Corporation', type: 'stock' },
  { symbol: 'ITW', name: 'Illinois Tool Works', type: 'stock' },
  { symbol: 'WM', name: 'Waste Management Inc.', type: 'stock' },
  { symbol: 'RSG', name: 'Republic Services Inc.', type: 'stock' },
  { symbol: 'FDX', name: 'FedEx Corporation', type: 'stock' },
  { symbol: 'UPS', name: 'United Parcel Service', type: 'stock' },
  { symbol: 'DAL', name: 'Delta Air Lines Inc.', type: 'stock' },
  { symbol: 'UAL', name: 'United Airlines Holdings', type: 'stock' },
  { symbol: 'LUV', name: 'Southwest Airlines Co.', type: 'stock' },

  // Energy
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', type: 'stock' },
  { symbol: 'CVX', name: 'Chevron Corporation', type: 'stock' },
  { symbol: 'COP', name: 'ConocoPhillips', type: 'stock' },
  { symbol: 'EOG', name: 'EOG Resources Inc.', type: 'stock' },
  { symbol: 'SLB', name: 'Schlumberger Limited', type: 'stock' },
  { symbol: 'MPC', name: 'Marathon Petroleum Corporation', type: 'stock' },
  { symbol: 'PSX', name: 'Phillips 66', type: 'stock' },
  { symbol: 'VLO', name: 'Valero Energy Corporation', type: 'stock' },
  { symbol: 'OXY', name: 'Occidental Petroleum', type: 'stock' },
  { symbol: 'HAL', name: 'Halliburton Company', type: 'stock' },
  { symbol: 'DVN', name: 'Devon Energy Corporation', type: 'stock' },
  { symbol: 'BKR', name: 'Baker Hughes Company', type: 'stock' },

  // Real Estate
  { symbol: 'PLD', name: 'Prologis Inc.', type: 'stock' },
  { symbol: 'AMT', name: 'American Tower Corporation', type: 'stock' },
  { symbol: 'CCI', name: 'Crown Castle Inc.', type: 'stock' },
  { symbol: 'EQIX', name: 'Equinix Inc.', type: 'stock' },
  { symbol: 'SPG', name: 'Simon Property Group', type: 'stock' },
  { symbol: 'PSA', name: 'Public Storage', type: 'stock' },
  { symbol: 'O', name: 'Realty Income Corporation', type: 'stock' },
  { symbol: 'DLR', name: 'Digital Realty Trust', type: 'stock' },
  { symbol: 'WELL', name: 'Welltower Inc.', type: 'stock' },
  { symbol: 'AVB', name: 'AvalonBay Communities Inc.', type: 'stock' },

  // Materials
  { symbol: 'LIN', name: 'Linde plc', type: 'stock' },
  { symbol: 'APD', name: 'Air Products and Chemicals', type: 'stock' },
  { symbol: 'SHW', name: 'The Sherwin-Williams Company', type: 'stock' },
  { symbol: 'ECL', name: 'Ecolab Inc.', type: 'stock' },
  { symbol: 'FCX', name: 'Freeport-McMoRan Inc.', type: 'stock' },
  { symbol: 'NEM', name: 'Newmont Corporation', type: 'stock' },
  { symbol: 'DOW', name: 'Dow Inc.', type: 'stock' },
  { symbol: 'DD', name: 'DuPont de Nemours Inc.', type: 'stock' },
  { symbol: 'NUE', name: 'Nucor Corporation', type: 'stock' },

  // Utilities
  { symbol: 'NEE', name: 'NextEra Energy Inc.', type: 'stock' },
  { symbol: 'DUK', name: 'Duke Energy Corporation', type: 'stock' },
  { symbol: 'SO', name: 'The Southern Company', type: 'stock' },
  { symbol: 'D', name: 'Dominion Energy Inc.', type: 'stock' },
  { symbol: 'AEP', name: 'American Electric Power', type: 'stock' },
  { symbol: 'EXC', name: 'Exelon Corporation', type: 'stock' },
  { symbol: 'SRE', name: 'Sempra', type: 'stock' },
  { symbol: 'XEL', name: 'Xcel Energy Inc.', type: 'stock' },
  { symbol: 'ED', name: 'Consolidated Edison Inc.', type: 'stock' },
  { symbol: 'WEC', name: 'WEC Energy Group Inc.', type: 'stock' },

  // Automotive
  { symbol: 'GM', name: 'General Motors Company', type: 'stock' },
  { symbol: 'F', name: 'Ford Motor Company', type: 'stock' },
  { symbol: 'RIVN', name: 'Rivian Automotive Inc.', type: 'stock' },
  { symbol: 'LCID', name: 'Lucid Group Inc.', type: 'stock' },
  { symbol: 'TM', name: 'Toyota Motor Corporation', type: 'stock' },

  // Other notable
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc. Class B', type: 'stock' },
  { symbol: 'LI', name: 'Li Auto Inc.', type: 'stock' },
  { symbol: 'NIO', name: 'NIO Inc.', type: 'stock' },
  { symbol: 'BABA', name: 'Alibaba Group Holding', type: 'stock' },
  { symbol: 'JD', name: 'JD.com Inc.', type: 'stock' },
  { symbol: 'PDD', name: 'PDD Holdings Inc.', type: 'stock' },
  { symbol: 'BIDU', name: 'Baidu Inc.', type: 'stock' },
  { symbol: 'TSM', name: 'Taiwan Semiconductor Manufacturing', type: 'stock' },
  { symbol: 'ASML', name: 'ASML Holding N.V.', type: 'stock' },
  { symbol: 'SAP', name: 'SAP SE', type: 'stock' },
  { symbol: 'SONY', name: 'Sony Group Corporation', type: 'stock' },
  { symbol: 'TM', name: 'Toyota Motor Corporation', type: 'stock' },
  { symbol: 'UL', name: 'Unilever PLC', type: 'stock' },
  { symbol: 'SHEL', name: 'Shell plc', type: 'stock' },
  { symbol: 'BP', name: 'BP p.l.c.', type: 'stock' },
  { symbol: 'RIO', name: 'Rio Tinto Group', type: 'stock' },
  { symbol: 'BHP', name: 'BHP Group Limited', type: 'stock' },
  { symbol: 'VALE', name: 'Vale S.A.', type: 'stock' },
  { symbol: 'GRAB', name: 'Grab Holdings Limited', type: 'stock' },
  { symbol: 'SE', name: 'Sea Limited', type: 'stock' },
  { symbol: 'MELI', name: 'MercadoLibre Inc.', type: 'stock' },
  { symbol: 'NU', name: 'Nu Holdings Ltd.', type: 'stock' },
  { symbol: 'SOFI', name: 'SoFi Technologies Inc.', type: 'stock' },
  { symbol: 'AFRM', name: 'Affirm Holdings Inc.', type: 'stock' },
  { symbol: 'DASH', name: 'DoorDash Inc.', type: 'stock' },
  { symbol: 'LYFT', name: 'Lyft Inc.', type: 'stock' },
  { symbol: 'AI', name: 'C3.ai Inc.', type: 'stock' },
  { symbol: 'SMCI', name: 'Super Micro Computer Inc.', type: 'stock' },
  { symbol: 'ARM', name: 'Arm Holdings plc', type: 'stock' },
  { symbol: 'DELL', name: 'Dell Technologies Inc.', type: 'stock' },
  { symbol: 'HPE', name: 'Hewlett Packard Enterprise', type: 'stock' },
  { symbol: 'HPQ', name: 'HP Inc.', type: 'stock' },
  { symbol: 'WDC', name: 'Western Digital Corporation', type: 'stock' },
  { symbol: 'STX', name: 'Seagate Technology Holdings', type: 'stock' },
];

/** Popular ETFs — broad market, sector, thematic, and fixed income */
const ETFS: SecurityEntry[] = [
  // Broad Market
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', type: 'etf' },
  { symbol: 'IVV', name: 'iShares Core S&P 500 ETF', type: 'etf' },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'etf' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', type: 'etf' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust (Nasdaq 100)', type: 'etf' },
  { symbol: 'QQQM', name: 'Invesco Nasdaq 100 ETF', type: 'etf' },
  { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF', type: 'etf' },
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF', type: 'etf' },
  { symbol: 'IWF', name: 'iShares Russell 1000 Growth ETF', type: 'etf' },
  { symbol: 'IWD', name: 'iShares Russell 1000 Value ETF', type: 'etf' },
  { symbol: 'VUG', name: 'Vanguard Growth ETF', type: 'etf' },
  { symbol: 'VTV', name: 'Vanguard Value ETF', type: 'etf' },
  { symbol: 'RSP', name: 'Invesco S&P 500 Equal Weight ETF', type: 'etf' },
  { symbol: 'MDY', name: 'SPDR S&P Midcap 400 ETF', type: 'etf' },
  { symbol: 'IJR', name: 'iShares Core S&P Small-Cap ETF', type: 'etf' },

  // Sector ETFs
  { symbol: 'XLK', name: 'Technology Select Sector SPDR', type: 'etf' },
  { symbol: 'XLF', name: 'Financial Select Sector SPDR', type: 'etf' },
  { symbol: 'XLE', name: 'Energy Select Sector SPDR', type: 'etf' },
  { symbol: 'XLV', name: 'Health Care Select Sector SPDR', type: 'etf' },
  { symbol: 'XLY', name: 'Consumer Discretionary Select Sector SPDR', type: 'etf' },
  { symbol: 'XLP', name: 'Consumer Staples Select Sector SPDR', type: 'etf' },
  { symbol: 'XLI', name: 'Industrial Select Sector SPDR', type: 'etf' },
  { symbol: 'XLB', name: 'Materials Select Sector SPDR', type: 'etf' },
  { symbol: 'XLU', name: 'Utilities Select Sector SPDR', type: 'etf' },
  { symbol: 'XLRE', name: 'Real Estate Select Sector SPDR', type: 'etf' },
  { symbol: 'XLC', name: 'Communication Services Select Sector SPDR', type: 'etf' },

  // Thematic / Industry
  { symbol: 'ARKK', name: 'ARK Innovation ETF', type: 'etf' },
  { symbol: 'ARKG', name: 'ARK Genomic Revolution ETF', type: 'etf' },
  { symbol: 'ARKW', name: 'ARK Next Generation Internet ETF', type: 'etf' },
  { symbol: 'ARKF', name: 'ARK Fintech Innovation ETF', type: 'etf' },
  { symbol: 'ARKQ', name: 'ARK Autonomous Tech & Robotics ETF', type: 'etf' },
  { symbol: 'SMH', name: 'VanEck Semiconductor ETF', type: 'etf' },
  { symbol: 'SOXX', name: 'iShares Semiconductor ETF', type: 'etf' },
  { symbol: 'HACK', name: 'ETFMG Prime Cyber Security ETF', type: 'etf' },
  { symbol: 'BOTZ', name: 'Global X Robotics & AI ETF', type: 'etf' },
  { symbol: 'ICLN', name: 'iShares Global Clean Energy ETF', type: 'etf' },
  { symbol: 'TAN', name: 'Invesco Solar ETF', type: 'etf' },
  { symbol: 'LIT', name: 'Global X Lithium & Battery Tech ETF', type: 'etf' },
  { symbol: 'KWEB', name: 'KraneShares CSI China Internet ETF', type: 'etf' },
  { symbol: 'XBI', name: 'SPDR S&P Biotech ETF', type: 'etf' },
  { symbol: 'IBB', name: 'iShares Biotechnology ETF', type: 'etf' },
  { symbol: 'XHB', name: 'SPDR S&P Homebuilders ETF', type: 'etf' },
  { symbol: 'JETS', name: 'US Global Jets ETF', type: 'etf' },
  { symbol: 'XRT', name: 'SPDR S&P Retail ETF', type: 'etf' },
  { symbol: 'KRE', name: 'SPDR S&P Regional Banking ETF', type: 'etf' },

  // International
  { symbol: 'EFA', name: 'iShares MSCI EAFE ETF', type: 'etf' },
  { symbol: 'EEM', name: 'iShares MSCI Emerging Markets ETF', type: 'etf' },
  { symbol: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF', type: 'etf' },
  { symbol: 'VXUS', name: 'Vanguard Total International Stock ETF', type: 'etf' },
  { symbol: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', type: 'etf' },
  { symbol: 'INDA', name: 'iShares MSCI India ETF', type: 'etf' },
  { symbol: 'EWJ', name: 'iShares MSCI Japan ETF', type: 'etf' },
  { symbol: 'FXI', name: 'iShares China Large-Cap ETF', type: 'etf' },
  { symbol: 'EWZ', name: 'iShares MSCI Brazil ETF', type: 'etf' },
  { symbol: 'EWG', name: 'iShares MSCI Germany ETF', type: 'etf' },
  { symbol: 'EWU', name: 'iShares MSCI United Kingdom ETF', type: 'etf' },

  // Fixed Income
  { symbol: 'AGG', name: 'iShares Core US Aggregate Bond ETF', type: 'etf' },
  { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', type: 'etf' },
  { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', type: 'etf' },
  { symbol: 'IEF', name: 'iShares 7-10 Year Treasury Bond ETF', type: 'etf' },
  { symbol: 'SHY', name: 'iShares 1-3 Year Treasury Bond ETF', type: 'etf' },
  { symbol: 'LQD', name: 'iShares Investment Grade Corporate Bond ETF', type: 'etf' },
  { symbol: 'HYG', name: 'iShares iBoxx $ High Yield Corporate Bond ETF', type: 'etf' },
  { symbol: 'JNK', name: 'SPDR Bloomberg High Yield Bond ETF', type: 'etf' },
  { symbol: 'TIP', name: 'iShares TIPS Bond ETF', type: 'etf' },
  { symbol: 'VCIT', name: 'Vanguard Intermediate-Term Corporate Bond ETF', type: 'etf' },
  { symbol: 'VCSH', name: 'Vanguard Short-Term Corporate Bond ETF', type: 'etf' },
  { symbol: 'MUB', name: 'iShares National Muni Bond ETF', type: 'etf' },
  { symbol: 'EMB', name: 'iShares J.P. Morgan USD Emerging Markets Bond ETF', type: 'etf' },
  { symbol: 'BNDX', name: 'Vanguard Total International Bond ETF', type: 'etf' },

  // Commodities & Real Assets
  { symbol: 'GLD', name: 'SPDR Gold Shares', type: 'etf' },
  { symbol: 'IAU', name: 'iShares Gold Trust', type: 'etf' },
  { symbol: 'SLV', name: 'iShares Silver Trust', type: 'etf' },
  { symbol: 'USO', name: 'United States Oil Fund', type: 'etf' },
  { symbol: 'DBA', name: 'Invesco DB Agriculture Fund', type: 'etf' },
  { symbol: 'GSG', name: 'iShares S&P GSCI Commodity ETF', type: 'etf' },
  { symbol: 'PDBC', name: 'Invesco Optimum Yield Diversified Commodity ETF', type: 'etf' },
  { symbol: 'VNQ', name: 'Vanguard Real Estate ETF', type: 'etf' },
  { symbol: 'IYR', name: 'iShares US Real Estate ETF', type: 'etf' },

  // Dividend & Income
  { symbol: 'VIG', name: 'Vanguard Dividend Appreciation ETF', type: 'etf' },
  { symbol: 'VYM', name: 'Vanguard High Dividend Yield ETF', type: 'etf' },
  { symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF', type: 'etf' },
  { symbol: 'DVY', name: 'iShares Select Dividend ETF', type: 'etf' },
  { symbol: 'SDY', name: 'SPDR S&P Dividend ETF', type: 'etf' },
  { symbol: 'HDV', name: 'iShares Core High Dividend ETF', type: 'etf' },
  { symbol: 'DGRO', name: 'iShares Core Dividend Growth ETF', type: 'etf' },
  { symbol: 'NOBL', name: 'ProShares S&P 500 Dividend Aristocrats ETF', type: 'etf' },
  { symbol: 'JEPI', name: 'JPMorgan Equity Premium Income ETF', type: 'etf' },
  { symbol: 'JEPQ', name: 'JPMorgan Nasdaq Equity Premium Income ETF', type: 'etf' },

  // Leveraged & Inverse (popular for trading)
  { symbol: 'TQQQ', name: 'ProShares UltraPro QQQ (3x)', type: 'etf' },
  { symbol: 'SQQQ', name: 'ProShares UltraPro Short QQQ (-3x)', type: 'etf' },
  { symbol: 'SPXL', name: 'Direxion Daily S&P 500 Bull 3X', type: 'etf' },
  { symbol: 'SPXS', name: 'Direxion Daily S&P 500 Bear 3X', type: 'etf' },
  { symbol: 'UVXY', name: 'ProShares Ultra VIX Short-Term Futures', type: 'etf' },
  { symbol: 'SOXL', name: 'Direxion Daily Semiconductor Bull 3X', type: 'etf' },
  { symbol: 'SOXS', name: 'Direxion Daily Semiconductor Bear 3X', type: 'etf' },
];

/** Index funds — mutual fund / ETF equivalents that track major indices */
const INDEX_FUNDS: SecurityEntry[] = [
  // S&P 500 trackers
  { symbol: 'VFIAX', name: 'Vanguard 500 Index Fund Admiral', type: 'index' },
  { symbol: 'FXAIX', name: 'Fidelity 500 Index Fund', type: 'index' },
  { symbol: 'SWPPX', name: 'Schwab S&P 500 Index Fund', type: 'index' },

  // Total Market
  { symbol: 'VTSAX', name: 'Vanguard Total Stock Market Index Admiral', type: 'index' },
  { symbol: 'FSKAX', name: 'Fidelity Total Market Index Fund', type: 'index' },
  { symbol: 'SWTSX', name: 'Schwab Total Stock Market Index Fund', type: 'index' },

  // International
  { symbol: 'VTIAX', name: 'Vanguard Total International Stock Index Admiral', type: 'index' },
  { symbol: 'FTIHX', name: 'Fidelity Total International Index Fund', type: 'index' },

  // Bond
  { symbol: 'VBTLX', name: 'Vanguard Total Bond Market Index Admiral', type: 'index' },
  { symbol: 'FXNAX', name: 'Fidelity US Bond Index Fund', type: 'index' },

  // Small / Mid Cap
  { symbol: 'VSMAX', name: 'Vanguard Small-Cap Index Fund Admiral', type: 'index' },
  { symbol: 'VIMAX', name: 'Vanguard Mid-Cap Index Fund Admiral', type: 'index' },
  { symbol: 'FSSNX', name: 'Fidelity Small Cap Index Fund', type: 'index' },

  // Growth / Value
  { symbol: 'VIGAX', name: 'Vanguard Growth Index Fund Admiral', type: 'index' },
  { symbol: 'VVIAX', name: 'Vanguard Value Index Fund Admiral', type: 'index' },

  // Target Date (Vanguard)
  { symbol: 'VFIFX', name: 'Vanguard Target Retirement 2050 Fund', type: 'index' },
  { symbol: 'VFORX', name: 'Vanguard Target Retirement 2040 Fund', type: 'index' },
  { symbol: 'VTHRX', name: 'Vanguard Target Retirement 2030 Fund', type: 'index' },

  // Balanced
  { symbol: 'VBIAX', name: 'Vanguard Balanced Index Fund Admiral', type: 'index' },

  // REIT
  { symbol: 'VGSLX', name: 'Vanguard Real Estate Index Fund Admiral', type: 'index' },

  // International Bond
  { symbol: 'VTABX', name: 'Vanguard Total International Bond Index Admiral', type: 'index' },
];

/** Combined searchable list */
export const ALL_SECURITIES: SecurityEntry[] = [
  ...STOCKS,
  ...ETFS,
  ...INDEX_FUNDS,
];

/**
 * Search securities locally by symbol or name.
 * Returns top matches (max 15) sorted by relevance.
 */
export function searchSecuritiesLocal(
  query: string,
  typeFilter?: 'stock' | 'etf' | 'index' | 'all'
): SecurityEntry[] {
  if (!query || query.length < 1) return [];

  const normalised = query.toUpperCase().trim();
  const filterType = typeFilter && typeFilter !== 'all' ? typeFilter : undefined;

  const scored = ALL_SECURITIES
    .filter((s) => !filterType || s.type === filterType)
    .map((s) => {
      const symUpper = s.symbol.toUpperCase();
      const nameUpper = s.name.toUpperCase();

      /** Scoring: exact symbol match > symbol starts-with > symbol contains > name match */
      let score = 0;
      if (symUpper === normalised) score = 100;
      else if (symUpper.startsWith(normalised)) score = 80;
      else if (symUpper.includes(normalised)) score = 60;
      else if (nameUpper.includes(normalised)) score = 40;
      else return null; // no match

      return { ...s, _score: score };
    })
    .filter(Boolean) as (SecurityEntry & { _score: number })[];

  scored.sort((a, b) => b._score - a._score);

  return scored.slice(0, 15).map(({ _score, ...entry }) => entry);
}
