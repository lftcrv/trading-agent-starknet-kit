import { StarknetToolRegistry } from 'src/lib/agent/tools/tools';
import { routeSchema, swapSchema, walletSchema } from '../schema';
import { swapTokens } from '../actions/swap';
import { getRoute } from '../actions/fetchRoute';
import { getWalletBalances } from '../actions/fetchBalances';

export const registerAvnuTools = () => {
  StarknetToolRegistry.registerTool({
    name: 'swap_tokens',
    plugins: 'avnu',
    description: 'Swap a specified amount of one token for another token',
    schema: swapSchema,
    execute: swapTokens,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_route',
    plugins: 'avnu',
    description: 'Get a specific route for swapping tokens',
    schema: routeSchema,
    execute: getRoute,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_wallet_balances',
    plugins: 'avnu',
    description: 'Get all balances from starket wallet',
    schema: walletSchema,
    execute: getWalletBalances,
  });
};
