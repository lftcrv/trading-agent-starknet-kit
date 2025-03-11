import { StarknetAgentInterface } from '../../../tools/tools';
import { ExecuteBridgeParams } from '../schema';
import {
  LayerswapConstant,
  SwapStatus,
  SwapInput,
  SwapResponse,
} from '../types';
import { LayerswapManager } from './layerswap-manager';

/**
 * Executes a complete bridge operation
 *
 * @param {StarknetAgentInterface} agent - Starknet agent
 * @param {ExecuteBridgeParams} params - Bridge parameters
 * @returns {Promise<{status: string, result?: any, error?: any}>} Bridge result
 */
export const layerswap_execute_bridge = async (
  agent: StarknetAgentInterface,
  params: ExecuteBridgeParams
) => {
  try {
    // Initialize the LayerswapManager with the agent
    const layerswapManager = new LayerswapManager(agent);

    // Step 1: Check route limits
    const limits = await layerswapManager.getLimits(
      params.source_network,
      params.source_token,
      params.destination_network,
      params.destination_token,
      params.refuel
    );

    // Validate amount
    if (
      params.amount < limits.min_amount ||
      params.amount > limits.max_amount
    ) {
      throw new Error(
        `Amount must be between ${limits.min_amount} and ${limits.max_amount} ${params.source_token}`
      );
    }

    // Step 2: Get quote
    const quote = await layerswapManager.getQuote({
      source_network: params.source_network,
      source_token: params.source_token,
      destination_network: params.destination_network,
      destination_token: params.destination_token,
      amount: params.amount,
      refuel: params.refuel,
      // source_address will be provided by the manager
    });

    // Step 3: Create swap
    const referenceId = params.reference_id || `bridge-${Date.now()}`;
    const starknetAddress = layerswapManager.getStarknetAddress();

    const swapInput: SwapInput = {
      source_network: params.source_network,
      source_token: params.source_token,
      destination_network: params.destination_network,
      destination_token: params.destination_token,
      source_address: starknetAddress,
      destination_address: params.destination_address,
      amount: params.amount,
      refuel: params.refuel || false,
      reference_id: referenceId,
      use_deposit_address: true,
    };

    const swap = await layerswapManager.createSwap(swapInput);

    // Step 4: Get deposit actions
    const depositActions = await layerswapManager.getDepositActions(swap.id);

    if (depositActions.length === 0) {
      throw new Error('No deposit actions received from Layerswap');
    }

    const depositAction = depositActions[0];

    // Step 5: Send transaction on Starknet
    let txHash;

    // For ETH transfers
    if (params.source_token === 'ETH') {
      txHash = await layerswapManager.executeEthTransfer(
        depositAction.token_address,
        depositAction.deposit_address,
        params.amount
      );
    } else {
      // For ERC20 tokens (this would need to be implemented based on specific token requirements)
      throw new Error(`Support for ${params.source_token} not yet implemented`);
    }

    // Step 6: Poll for swap status
    const maxPollAttempts =
      params.max_poll_attempts || LayerswapConstant.DEFAULT_MAX_POLL_ATTEMPTS;
    const pollIntervalMs =
      params.poll_interval_ms || LayerswapConstant.DEFAULT_POLL_INTERVAL_MS;

    let pollAttempt = 0;
    let swapCompleted = false;
    let finalSwap: SwapResponse | null = null;

    while (pollAttempt < maxPollAttempts && !swapCompleted) {
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

      const swapStatus = await layerswapManager.getSwapStatus(swap.id);

      if (swapStatus.status === SwapStatus.COMPLETED) {
        swapCompleted = true;
        finalSwap = swapStatus;
      } else if (swapStatus.status === SwapStatus.FAILED) {
        throw new Error(`Swap failed: ${JSON.stringify(swapStatus)}`);
      } else if (
        swapStatus.status === SwapStatus.CANCELLED ||
        swapStatus.status === SwapStatus.EXPIRED
      ) {
        throw new Error(
          `Swap ${swapStatus.status}: ${JSON.stringify(swapStatus)}`
        );
      }

      pollAttempt++;
    }

    if (!swapCompleted) {
      return {
        status: 'pending',
        result: {
          swapId: swap.id,
          sourceTransaction: txHash.transaction_hash,
          referenceId,
          message: 'Maximum poll attempts reached. Check swap status manually.',
        },
      };
    }

    return {
      status: 'success',
      result: {
        swapId: swap.id,
        sourceTransaction: txHash.transaction_hash,
        destinationTransaction: finalSwap?.output?.transaction_id,
        status: finalSwap?.status,
        referenceId,
        fee: quote.fee,
        amount: params.amount,
        destinationAmount: quote.destination_amount,
      },
    };
  } catch (error) {
    console.error('Error during bridge execution:', error);
    return {
      status: 'error',
      error,
    };
  }
};
