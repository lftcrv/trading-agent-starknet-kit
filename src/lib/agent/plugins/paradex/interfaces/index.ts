export interface PlaceOrderParams {
  market: string,
  side: string,
  type: string,
  size: string,
  price?: string,
  instruction: string,
}

export interface PlaceOrderLimitParams {
  market: string,
  side: string,
  size: string,
  price?: string,
}
export interface OrderRequest {
  action: string;
  market: string;
  size: number;
  price?: number; // Optional - if present, becomes a limit order
}