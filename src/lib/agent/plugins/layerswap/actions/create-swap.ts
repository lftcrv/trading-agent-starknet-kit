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
    // Initialize the LayerswapManager with the agent
    const layerswapManager = new LayerswapManager(agent);

    const swapInput: SwapInput = {
      source_network: params.source_network,
      source_token: params.source_token,
      destination_network: params.destination_network,
      destination_token: params.destination_token,
      source_address: params.source_address, // This will be overridden by LayerswapManager if not provided
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
