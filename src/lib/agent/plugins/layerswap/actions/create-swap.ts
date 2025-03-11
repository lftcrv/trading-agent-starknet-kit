import { StarknetAgentInterface } from '../../../tools/tools';
import { CreateSwapParams } from '../schema';
import { SwapInput, SwapResponse } from '../types';
import { LayerswapManager } from './layerswap-manager';

/**
 * Creates a new swap
 *
 * @param {StarknetAgentInterface} agent - Starknet agent
 * @param {CreateSwapParams} params - Swap parameters
 * @returns {Promise<{status: string, swap?: SwapResponse, error?: any}>} Created swap
 */
export const layerswap_create_swap = async (
  agent: StarknetAgentInterface,
  params: CreateSwapParams
) => {
  try {
    // @ts-ignore - For TypeScript, we need to add these methods to the agent interface
    const apiKey = agent.getLayerswapApiKey();
    // @ts-ignore
    const baseUrl = agent.getLayerswapBaseUrl();

    if (!apiKey) {
      throw new Error('Layerswap API key not found in agent configuration');
    }

    const layerswapManager = new LayerswapManager(apiKey, baseUrl);

    // If we have Starknet details, set them
    try {
      // @ts-ignore
      const starknetPrivateKey = agent.getStarknetPrivateKey();
      // @ts-ignore
      const starknetAddress = agent.getStarknetAddress();

      if (starknetPrivateKey && starknetAddress) {
        layerswapManager.setStarknetAccount(
          starknetPrivateKey,
          starknetAddress
        );
      }
    } catch (e) {
      // Continue even if we can't set Starknet details
      console.warn('Could not set Starknet account details:', e.message);
    }

    const swapInput: SwapInput = {
      source_network: params.source_network,
      source_token: params.source_token,
      destination_network: params.destination_network,
      destination_token: params.destination_token,
      source_address: params.source_address,
      destination_address: params.destination_address,
      amount: params.amount,
      refuel: params.refuel || false,
      reference_id: params.reference_id,
      use_deposit_address: true,
    };

    const swap = await layerswapManager.createSwap(swapInput);

    return {
      status: 'success',
      swap,
    };
  } catch (error) {
    console.error('Error creating swap:', error);
    return {
      status: 'error',
      error,
    };
  }
};
