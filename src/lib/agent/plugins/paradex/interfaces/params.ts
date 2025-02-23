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

export interface CancelOrderParams {
  orderId: string;
}

export interface GetOpenOrdersParams {
  market?: string;
}

export interface GetOpenPositionsParams {
  market?: string;
}

export interface GetBBOParams {
  markets: string[];  // Array of market symbols to fetch BBO data for
}
