import { StarknetToolRegistry } from 'src/lib/agent/tools/tools';
import {
  cancelOrderSchema,
  getOpenOrdersSchema,
  getOpenPositionsSchema,
  placeOrderLimitSchema,
  placeOrderMarketSchema,
} from '../schema';
import { paradexCancelOrder } from '../actions/cancelOrder';
import { paradexPlaceOrderLimit } from '../actions/placeOrderLimit';
import { paradexPlaceOrderMarket } from '../actions/placeOrderMarket';
import { paradexGetOpenOrders } from '../actions/fetchOpenOrders';
import { paradexGetOpenPositions } from '../actions/fetchOpenPositions';

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
    description:
      'Cancel an unexecuted order (not yet filled) without affecting the position or the asset balance',
    schema: cancelOrderSchema,
    execute: paradexCancelOrder,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_open_orders',
    plugins: 'paradex',
    description: 'Get all open orders, optionally filtered by market',
    schema: getOpenOrdersSchema,
    execute: paradexGetOpenOrders,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_open_positions',
    plugins: 'paradex',
    description: 'Get all open positions, optionally filtered by market',
    schema: getOpenPositionsSchema,
    execute: paradexGetOpenPositions,
  });
};
