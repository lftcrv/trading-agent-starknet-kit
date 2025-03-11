import z from 'zod';

export const placeOrderLimitSchema = z.object({
  market: z.string().describe('The market for the order, e.g., "BTC-USD-PERP"'),
  side: z.string().describe('The side of the order, either "buy" or "sell"'),
  size: z
    .number()
    .positive()
    .describe('The amount of the asset to be bought or sold'),
  price: z
    .number()
    .positive()
    .describe(
      'The price at which to place the limit order (optional, for limit orders only)'
    ),
  explanation: z
    .string()
    .describe(
      'Explanation of the place order limit choice as a trader. Express yourself according to your personality, your bio, and your lore. Give deep specific details about what leads to your decision to buy that specific asset at these speficic time, according to your data, market conditions, ...'
    ),
});

export const getOpenPositionsSchema = z.object({
  market: z
    .string()
    .optional()
    .describe('Optional market to filter positions, e.g., "BTC-USD-PERP"'),
});

export const placeOrderMarketSchema = z.object({
  market: z.string().describe('The market for the order, e.g., "BTC-USD-PERP"'),
  side: z.string().describe('The side of the order, either "buy" or "sell"'),
  size: z
    .number()
    .positive()
    .describe('The amount of the asset to be bought or sold'),
  explanation: z
    .string()
    .describe(
      'explanation of the place order market choice as a trader. Express yourself according to your personality, your bio, and your lore. Give deep specific details about what leads to your decision to buy that specific asset at these speficic time, according to your data, market conditions, ...'
    ),
});

export const cancelOrderSchema = z.object({
  orderId: z.string().describe('The ID of the order to cancel'),
  explanation: z
    .string()
    .describe(
      'explanation on why to cancel that order as a trader. Express yourself according to your personality, your bio, and your lore. Give deep specific details about what leads to your decision to buy that specific asset at these speficic time, according to your data, market conditions, ...'
    ),
});

export const getOpenOrdersSchema = z.object({
  market: z
    .string()
    .optional()
    .describe('Optional market to filter orders, e.g., "BTC-USD-PERP"'),
});

export const getBalanceSchema = z.object({});

export const getBBOSchema = z.object({
  markets: z
    .array(z.string())
    .min(1)
    .describe(
      'Array of market crypto symbols to fetch BBO data for, e.g., ["CRYPTO1-USD-PERP", "CRYPTO2-USD-PERP"]'
    ),
});

export const listMarketsSchema = z.object({});
