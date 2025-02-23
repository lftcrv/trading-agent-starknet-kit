export interface OrderResult {
  account: string;
  avg_fill_price: string;
  cancel_reason?: string;
  client_id: string;
  created_at: number;
  flags: string[];
  id: string;
  instruction: string;
  last_updated_at: number;
  market: string;
  price: string;
  published_at: number;
  received_at: number;
  remaining_size: string;
  seq_no: number;
  side: string;
  size: string;
  status: string;
  stp: string;
  timestamp: number;
  trigger_price: string;
  type: string;
}

export interface OrderResponse {
  results: OrderResult[];
}

export interface PositionResult {
  average_entry_price: string;
  average_entry_price_usd: string;
  average_exit_price: string;
  cached_funding_index: string;
  closed_at: number;
  cost: string;
  cost_usd: string;
  created_at: number;
  id: string;
  last_fill_id: string;
  last_updated_at: number;
  leverage: string;
  liquidation_price: string;
  market: string;
  realized_positional_funding_pnl: string;
  realized_positional_pnl: string;
  seq_no: number;
  side: string;
  size: string;
  status: string;
  unrealized_funding_pnl: string;
  unrealized_pnl: string;
}

export interface PositionResponse {
  results: PositionResult[];
}

export interface BalanceResult {
  token: string;
  size: string;
  last_updated_at: number;
}

export interface BalanceResponse {
  results: BalanceResult[];
}

export interface BBOResponse {
  ask: string;
  ask_size: string;
  bid: string;
  bid_size: string;
  market: string;
  last_updated_at: number;
  seq_no: number;
}

export interface ChainDetails {
  collateral_address: string;
  contract_address: string;
  fee_account_address: string;
  fee_maker: string;
  fee_taker: string;
  insurance_fund_address: string;
  liquidation_fee: string;
  oracle_address: string;
  symbol: string;
}

export interface Delta1CrossMarginParams {
  imf_base: string;
  imf_factor: string;
  imf_shift: string;
  mmf_factor: string;
}

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

export interface MarketResponse {
  results: MarketInfo[];
}

export interface MarketTradingInfoBasic {
  // Essential trading parameters
  symbol: string;
  base_currency: string;
  quote_currency: string;
  price_tick_size: string;
  order_size_increment: string;
  min_notional: string;
  max_order_size: string;
  position_limit: string;

  // Risk and market operation
  max_tob_spread: string;
  delta1_cross_margin_params: {
    imf_base: string;
  };

  // Funding parameters
  funding_period_hours: number;
  max_funding_rate: string;
  max_funding_rate_change: string;
}


export interface ListMarketResponse {
  results: Array<{
    symbol: string;
  }>;
}