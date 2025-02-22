import { StarknetToolRegistry } from 'src/lib/agent/tools/tools';
import { cancelOrderSchema, placeOrderLimitSchema } from "../schema";
import { cancelOrder } from "../actions/cancelOrder";
import { paradexPlaceOrderLimit } from '../actions/placeOrder';

export const registerParadexTools = () => {
  StarknetToolRegistry.registerTool({
    name: 'place_order_limit',
    plugins: 'paradex',
    description: 'Place an order limit on Paradex exchange',
    schema: placeOrderLimitSchema,
    execute: paradexPlaceOrderLimit,
  });

  StarknetToolRegistry.registerTool({
    name: 'cancel_order',
    plugins: 'paradex',
    description: 'Cancel an unexecuted order (not yet filled) without affecting the position or the asset balance',
    schema: cancelOrderSchema,
    execute: cancelOrder,
  });
};


