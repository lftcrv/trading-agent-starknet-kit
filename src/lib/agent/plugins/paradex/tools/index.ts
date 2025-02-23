import { StarknetToolRegistry } from 'src/lib/agent/tools/tools';
import { cancelOrderSchema, placeOrderLimitSchema, placeOrderMarketSchema } from "../schema";
import { cancelOrder } from "../actions/cancelOrder";
import { paradexPlaceOrderLimit } from '../actions/placeOrderLimit';
import { paradexPlaceOrderMarket } from '../actions/placeOrderMarket';

export const registerParadexTools = () => {
  StarknetToolRegistry.registerTool({
    name: 'place_order_limit',
    plugins: 'paradex',
    description: 'Place an order limit on Paradex exchange',
    schema: placeOrderLimitSchema,
    execute: paradexPlaceOrderLimit,
  });

  StarknetToolRegistry.registerTool({
    name: 'place_order_market',
    plugins: 'paradex',
    description: 'Place an order market on Paradex exchange',
    schema: placeOrderMarketSchema,
    execute: paradexPlaceOrderMarket,
  });

  StarknetToolRegistry.registerTool({
    name: 'cancel_order',
    plugins: 'paradex',
    description: 'Cancel an unexecuted order (not yet filled) without affecting the position or the asset balance',
    schema: cancelOrderSchema,
    execute: cancelOrder,
  });
};


