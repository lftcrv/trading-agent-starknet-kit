export interface MarketInfo {
  symbol: string;
  base_currency: string;
  quote_currency: string;
  settlement_currency: string;
  order_size_increment: string;
  price_tick_size: string;
  min_notional: string;
  open_at: number;
  expiry_at: number;
  asset_kind: string;
  market_kind: string;
  position_limit: string;
  price_bands_width: string;
  max_open_orders: number;
  max_funding_rate: string;
  delta1_cross_margin_params: Delta1CrossMarginParams;
  price_feed_id: string;
  oracle_ewma_factor: string;
  max_order_size: string;
  max_funding_rate_change: string;
  max_tob_spread: string;
  interest_rate: string;
  clamp_rate: string;
  funding_period_hours: number;
  tags: string[];
}

export interface SystemConfig {
  readonly apiBaseUrl: string;
  readonly starknet: {
    readonly chainId: string;
  };
}

export interface MarketResponse {
  results: MarketInfo[];
}

export interface Delta1CrossMarginParams {
  imf_base: string;
  imf_factor: string;
  imf_shift: string;
  mmf_factor: string;
}

export interface GetMarketDetailsParams {
  market: string;
}

export interface GetMarketTradingInfoParams {
  markets: string | string[];
}

export class ParadexMarketError extends Error {
  constructor(
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ParadexMarketError';
  }
}
export class ParadexMarketInfoBasicError extends Error {
  constructor(
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ParadexMarketInfoError';
  }
}

export interface MarketTradingInfoBasic {
  symbol: string;
  base_currency: string;
  quote_currency: string;
  price_tick_size: string;
  order_size_increment: string;
  min_notional: string;
  max_order_size: string;
  position_limit: string;

  max_tob_spread: string;
  delta1_cross_margin_params: {
    imf_base: string;
  };

  funding_period_hours: number;
  max_funding_rate: string;
  max_funding_rate_change: string;
}
