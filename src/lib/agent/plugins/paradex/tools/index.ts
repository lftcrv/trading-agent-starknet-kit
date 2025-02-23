import { StarknetToolRegistry } from 'src/lib/agent/tools/tools';
import {
  cancelOrderSchema,
  getBBOSchema,
  getMarketDetailsSchema,
  getMarketTradingInfoSchema,
  getOpenOrdersSchema,
  getOpenPositionsSchema,
  listMarketsSchema,
  placeOrderLimitSchema,
  placeOrderMarketSchema,
} from '../schema';
import { paradexCancelOrder } from '../actions/cancelOrder';
import { paradexPlaceOrderLimit } from '../actions/placeOrderLimit';
import { paradexPlaceOrderMarket } from '../actions/placeOrderMarket';
import { paradexGetOpenOrders } from '../actions/fetchOpenOrders';
import { paradexGetOpenPositions } from '../actions/fetchOpenPositions';
import { paradexGetBalance } from '../actions/fetchAccountBalance';
import { paradexGetBBO } from '../actions/getBBO';
import { paradexGetMarketDetails } from '../actions/fetchDetailedParadexMarkets';
import { getBalanceSchema } from '../../core/token/schema';
import { paradexGetMarketTradingInfo } from '../actions/fetchBasicParadexMarkets';
import { paradexListMarkets } from '../actions/listMarketsOnParadex';

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
      'Cancel an unexecuted order (not yet filled) on Paradex exchange without affecting the position or the asset balance',
    schema: cancelOrderSchema,
    execute: paradexCancelOrder,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_open_orders',
    plugins: 'paradex',
    description:
      'Get all open orders on Paradex exchange, optionally filtered by market',
    schema: getOpenOrdersSchema,
    execute: paradexGetOpenOrders,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_open_positions',
    plugins: 'paradex',
    description:
      'Get all open positions on Paradex exchange, optionally filtered by market',
    schema: getOpenPositionsSchema,
    execute: paradexGetOpenPositions,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_balance',
    plugins: 'paradex',
    description: 'Get account balance on Paradex exchange (USDC)',
    schema: getBalanceSchema,
    execute: paradexGetBalance,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_bbo',
    plugins: 'paradex',
    description: 'Get Best Bid/Offer data for a specified Paradex market',
    schema: getBBOSchema,
    execute: paradexGetBBO,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_market_details',
    plugins: 'paradex',
    description:
      'Get maximum detailed information about a specific market on Paradex',
    schema: getMarketDetailsSchema,
    execute: paradexGetMarketDetails,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_market_trading_info',
    plugins: 'paradex',
    description:
      'Get essential trading information for one or multiple markets on Paradex',
    schema: getMarketTradingInfoSchema,
    execute: paradexGetMarketTradingInfo,
  });

  StarknetToolRegistry.registerTool({
    name: 'list_markets',
    plugins: 'paradex',
    description: 'Get a list of all available market symbols on Paradex',
    schema: listMarketsSchema,
    execute: paradexListMarkets,
  });
};
