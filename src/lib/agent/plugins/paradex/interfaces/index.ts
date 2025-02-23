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

export interface PlaceOrderMarketParams {
  market: string;
  side: string;
  size: string;
}
