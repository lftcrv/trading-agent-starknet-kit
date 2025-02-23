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