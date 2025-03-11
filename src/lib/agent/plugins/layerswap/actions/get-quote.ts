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
    // @ts-ignore - For TypeScript, we need to add these methods to the agent interface
    const apiKey = agent.getLayerswapApiKey();
    // @ts-ignore
    const baseUrl = agent.getLayerswapBaseUrl();
    // @ts-ignore
    const starknetAddress = agent.getStarknetAddress();

    if (!apiKey) {
      throw new Error('Layerswap API key not found in agent configuration');
    }

    const layerswapManager = new LayerswapManager(apiKey, baseUrl);

    if (starknetAddress) {
      layerswapManager.setStarknetAccount(
        // @ts-ignore
        agent.getStarknetPrivateKey(),
        starknetAddress
      );
    }

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
