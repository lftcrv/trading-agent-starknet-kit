import { StarknetAgentInterface } from '../../../tools/tools';
import { GetSwapQuoteParams } from '../schema';
import { LayerswapManager } from './layerswap-manager';

/**
 * Gets a quote for a swap
 *
 * @param {StarknetAgentInterface} agent - Starknet agent
 * @param {GetSwapQuoteParams} params - Quote parameters
 * @returns {Promise<{status: string, quote?: any, error?: any}>} Quote details
 */
export const layerswap_get_quote = async (
  agent: StarknetAgentInterface,
  params: GetSwapQuoteParams
) => {
  try {
    // Initialize the LayerswapManager with the agent
    const layerswapManager = new LayerswapManager(agent);
    const quote = await layerswapManager.getQuote(params);
    return {
      status: 'success',
      quote,
    };
  } catch (error) {
    console.error('Error getting quote:', error);
    return {
      status: 'error',
      error,
    };
  }
};
