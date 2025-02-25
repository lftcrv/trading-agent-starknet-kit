import { StarknetToolRegistry } from 'src/lib/agent/tools/tools';
import {
  avnuAnalysisSchema,
  routeSchema,
  swapSchema,
  walletSchema,
} from '../schema';
import { getAvnuLatestAnalysis } from '../actions/fetchAvnuLatestAnalysis';
import { swapTokens } from '../actions/swap';
import { getRoute } from '../actions/fetchRoute';
import { getWalletBalances } from '../actions/fetchBalances';

export const registerLftcrvTools = () => {
  StarknetToolRegistry.registerTool({
    name: 'get_avnu_latest_analysis',
    plugins: 'lftcrv',
    description:
      'Get the latest market analysis. Use it to deicde what is the best swap to do.',
    schema: avnuAnalysisSchema,
    execute: getAvnuLatestAnalysis,
  });

  StarknetToolRegistry.registerTool({
    name: 'swap_tokens',
    plugins: 'lftcrv',
    description: `Swap a specified amount of one token for another token. Make sure to leave at least 0.00005 ETH for the fees`,
    schema: swapSchema,
    execute: swapTokens,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_route',
    plugins: 'lftcrv',
    description: 'Get a specific route for swapping tokens',
    schema: routeSchema,
    execute: getRoute,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_wallet_balances',
    plugins: 'lftcrv',
    description: 'Get all balances from starket wallet',
    schema: walletSchema,
    execute: getWalletBalances,
  });
};
