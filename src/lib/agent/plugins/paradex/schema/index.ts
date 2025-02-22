import z from 'zod';


export const placeOrderLimitSchema = z.object({
  market: z
    .string()
    .describe('The market for the order, e.g., "BTC-USD-PERP"'),
  side: z
    .string()
    .describe('The side of the order, either "buy" or "sell"'),
  size: z
    .number()
    .positive()
    .describe('The amount of the asset to be bought or sold'),
  price: z
    .number()
    .optional()
    .describe('The price at which to place the limit order (optional, for limit orders only)'),
});

export const cancelOrderSchema = z.object({
  orderId: z
    .string()
    .describe('The ID of the order to cancel'),
});