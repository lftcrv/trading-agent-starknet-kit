import { StarknetToolRegistry } from 'src/lib/agent/tools/tools';
import {
  avnuAnalysisSchema,
  cancelOrderSchema,
  depositToParadexSchema,
  getMarketDetailsSchema,
  getMarketTradingInfoSchema,
  placeOrderLimitSchema,
  placeOrderMarketSchema,
  walletSchema,
  withdrawFromParadexSchema,
} from '../schema';
import { swapSchema } from '../../avnu/schema';
import { swapTokens } from '../actions/avnuActions/swap';
import { getAvnuLatestAnalysis } from '../actions/avnuActions/fetchAvnuLatestAnalysis';
import { getWalletBalances } from '../actions/avnuActions/fetchAvnuBalances';
import { paradexGetMarketDetails } from '../actions/paradexActions/fetchDetailedParadexMarkets';
import { paradexGetMarketTradingInfo } from '../actions/paradexActions/fetchBasicParadexMarkets';
import { paradexCancelOrder } from '../actions/paradexActions/cancelOrder';
import { paradexPlaceOrderMarket } from '../actions/paradexActions/placeOrderMarket';
import { paradexPlaceOrderLimit } from '../actions/paradexActions/placeOrderLimit';
import {
  getBalanceSchema,
  getBBOSchema,
  getOpenOrdersSchema,
  getOpenPositionsSchema,
  listMarketsSchema,
} from '../../paradex/schema';
import { paradexGetOpenOrders } from '../../paradex/actions/fetchOpenOrders';
import { paradexGetOpenPositions } from '../../paradex/actions/fetchOpenPositions';
import { paradexGetBalance } from '../../paradex/actions/fetchAccountBalance';
import { paradexGetBBO } from '../../paradex/actions/getBBO';
import { paradexListMarkets } from '../../paradex/actions/listMarketsOnParadex';
import { getAnalysisParadex } from '../actions/paradexActions/fetchBackendAnalysis';
import { depositToParadex } from '../actions/layerswapActions/depositToParadex';
import { withdrawFromParadex } from '../actions/layerswapActions/withdrawFromParadex';
import { sendParadexBalance } from '../actions/paradexActions/sendAccountBalanceToBackend';

export const registerLeftcurveTools = () => {
  console.log("registering leftcurve")
  StarknetToolRegistry.registerTool({
    name: 'get_avnu_latest_analysis',
    plugins: 'leftcurve',
    description:
      'Get the latest market analysis. Use it to deicde what is the best swap to do.',
    schema: avnuAnalysisSchema,
    execute: getAvnuLatestAnalysis,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_wallet_balances',
    plugins: 'leftcurve',
    description: 'Get all balances from starket wallet',
    schema: walletSchema,
    execute: getWalletBalances,
  });

  StarknetToolRegistry.registerTool({
    name: 'swap_tokens',
    plugins: 'leftcurve',
    description:
      'Swap a specified amount of one token for another token, on AVNU',
    schema: swapSchema,
    execute: swapTokens,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_paradex_market_details',
    plugins: 'leftcurve',
    description:
      'Get maximum detailed information about a specific market on Paradex',
    schema: getMarketDetailsSchema,
    execute: paradexGetMarketDetails,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_paradex_market_trading_info',
    plugins: 'leftcurve',
    description:
      'Get essential trading information for one or multiple markets on Paradex',
    schema: getMarketTradingInfoSchema,
    execute: paradexGetMarketTradingInfo,
  });

  StarknetToolRegistry.registerTool({
    name: 'place_order_limit_paradex',
    plugins: 'leftcurve',
    description:
      'Place an order limit on Paradex exchange. Base you on paradex analysis and your paradex positions to decide if you should use this action',
    schema: placeOrderLimitSchema,
    execute: paradexPlaceOrderLimit,
  });

  StarknetToolRegistry.registerTool({
    name: 'place_order_market_paradex',
    plugins: 'leftcurve',
    description:
      'Place an order market on Paradex exchange. Base you on paradex analysis to decide if you should use this action',
    schema: placeOrderMarketSchema,
    execute: paradexPlaceOrderMarket,
  });

  StarknetToolRegistry.registerTool({
    name: 'cancel_order_paradex',
    plugins: 'leftcurve',
    description:
      'Cancel an unexecuted order (not yet filled) on Paradex exchange without affecting the position or the asset balance',
    schema: cancelOrderSchema,
    execute: paradexCancelOrder,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_open_orders',
    plugins: 'leftcurve',
    description:
      'Get all open orders on Paradex exchange, optionally filtered by market',
    schema: getOpenOrdersSchema,
    execute: paradexGetOpenOrders,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_open_positions',
    plugins: 'leftcurve',
    description:
      'Get all open positions on Paradex exchange, optionally filtered by market',
    schema: getOpenPositionsSchema,
    execute: paradexGetOpenPositions,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_balance_on_paradex',
    plugins: 'leftcurve',
    description: 'Get account balance on Paradex exchange (USDC)',
    schema: getBalanceSchema,
    execute: paradexGetBalance,
  });

  StarknetToolRegistry.registerTool({
    name: 'send_balance_paradex',
    plugins: 'leftcurve',
    description: 'Always sends your Paradex balance to the backend with this function after any action on Paradex.',
    schema: getBalanceSchema,
    execute: sendParadexBalance,
  });

  StarknetToolRegistry.registerTool({
    name: 'send_balance_paradex',
    plugins: 'leftcurve',
    description: 'Always sends your Paradex balance to the backend with this function after any action on Paradex.',
    schema: getBalanceSchema,
    execute: sendParadexBalance,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_bbo',
    plugins: 'leftcurve',
    description: 'Get Best Bid/Offer data for a specified Paradex market',
    schema: getBBOSchema,
    execute: paradexGetBBO,
  });

  StarknetToolRegistry.registerTool({
    name: 'list_markets',
    plugins: 'leftcurve',
    description: 'Get a list of all available market symbols on Paradex',
    schema: listMarketsSchema,
    execute: paradexListMarkets,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_analysis_paradex',
    plugins: 'leftcurve',
    description: 'Get the latest analysis of Paradex.',
    schema: listMarketsSchema,
    execute: getAnalysisParadex,
  });

  StarknetToolRegistry.registerTool({
    name: 'deposit_to_paradex',
    plugins: 'leftcurve',
    description: 'Deposit USDC from Starknet to Paradex using Layerswap bridge',
    schema: depositToParadexSchema,
    execute: depositToParadex,
  });

  StarknetToolRegistry.registerTool({
    name: 'withdraw_from_paradex',
    plugins: 'leftcurve',
    description:
      'Withdraw USDC from Paradex to Starknet using Layerswap bridge',
    schema: withdrawFromParadexSchema,
    execute: withdrawFromParadex,
  });
};
