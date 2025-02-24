import { Token as AvnuToken } from '@avnu/avnu-sdk';
/**
 * Parameters for executing a token swap
 * @property {string} sellTokenSymbol - Symbol of the token to sell
 * @property {string} buyTokenSymbol - Symbol of the token to buy
 * @property {number} sellAmount - Amount of tokens to sell
 */
export interface SwapParams {
  sellTokenSymbol: string;
  buyTokenSymbol: string;
  sellAmount: number;
  explanation?: string;
}

export interface WalletParams {}

/**
 * Token information structure
 * @property {string} name - Name of the token
 * @property {string} address - Contract address of the token
 * @property {string} symbol - Token symbol
 * @property {number} decimals - Number of decimal places
 * @property {string | null} logoUri - URL to token logo image
 * @property {number} lastDailyVolumeUsd - Last 24h trading volume in USD
 * @property {Object} extensions - Additional token properties
 * @property {string[]} tags - Token categorization tags
 */
export interface Token {
  name: string;
  address: string;
  symbol: string;
  decimals: number;
  logoUri: string | null;
  lastDailyVolumeUsd: number;
  extensions: {
    [key: string]: string;
  };
  tags: string[];
}

/**
 * Paginated response containing token data
 * @property {AvnuToken[]} content - Array of token objects
 * @property {number} size - Number of items per page
 * @property {number} number - Current page number
 * @property {number} totalElements - Total number of items
 * @property {number} totalPages - Total number of pages
 */
export interface TokenResponse {
  content: AvnuToken[];
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

/**
 * Result of a swap operation
 * @property {('success'|'failure')} status - Status of the swap
 * @property {string} [message] - Optional success message
 * @property {string} [error] - Error message if swap failed
 * @property {string} [transactionHash] - Hash of the swap transaction
 * @property {number} [sellAmount] - Amount of tokens sold
 * @property {string} [sellToken] - Symbol of sold token
 * @property {string} [buyToken] - Symbol of bought token
 * @property {string} [amountReceived] - Amount of tokens received
 * @property {any} [receipt] - Transaction receipt
 * @property {any[]} [events] - Array of transaction events
 */
export interface SwapResult {
  status: 'success' | 'failure';
  message?: string;
  error?: string;
  transactionHash?: string;
  sellAmount?: number;
  sellToken?: string;
  buyToken?: string;
  amountReceived?: string;
  receipt?: any;
  events?: any[];
}

export interface AvnuAnalysisParams {}

export interface AssetAnalysis {
  social: null;
  assetId: string;
  metadata: {
    platform: string;
    dataSource: string;
    generatedAt: string;
    processingTimeMs: number;
  };
  technical: {
    changes: Record<string, string>;
    lastPrice: number;
    keySignals: {
      longTerm: {
        support: number;
        timeframe: string;
        resistance: number;
      };
      shortTerm: {
        momentum: {
          rsi: {
            value: number;
            condition: string;
          };
          macd: {
            signal: string;
            strength: number;
          };
          stochastic: {
            d: number;
            k: number;
            condition: string;
          };
        };
        patterns: {
          recent: Array<{
            type: string;
            strength: number;
          }>;
        };
        timeframe: string;
      };
      mediumTerm: {
        trend: {
          price: {
            action: {
              strength: number;
              direction: string;
              testedLevels: {
                count: number;
                recent: number;
              };
            };
            volatility: {
              state: string;
              bbWidth: number;
            };
          };
          primary: {
            momentum: {
              value: number;
              period: number;
              sustainedPeriods: number;
            };
            strength: number;
            direction: string;
          };
        };
        timeframe: string;
        technicals: {
          levels: {
            pivots: {
              r1: number;
              s1: number;
              pivot: number;
              breakout: string;
              r1Distance: number;
            };
          };
          volume: {
            trend: string;
            profile: {
              activity: number;
              distribution: string;
              sustainedPeriods: number;
            };
            significance: number;
          };
          ichimoku: {
            lines: {
              base: number;
              conversion: number;
              priceDistance: number;
            };
            signal: string;
            cloudState: string;
          };
          momentum: {
            adx: {
              value: number;
              trending: boolean;
              sustainedPeriods: number;
            };
            roc: {
              state: string;
              value: number;
              period: number;
            };
          };
        };
      };
    };
    volatility: number;
  };
  timestamp: number;
}
