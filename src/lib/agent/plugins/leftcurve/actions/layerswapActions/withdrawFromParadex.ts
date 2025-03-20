import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { layerswap_execute_bridge } from '../../../layerswap/actions';
import { ExecuteBridgeParams } from '../../../layerswap/schema';
import { getContainerId } from '../../utils/getContainerId';
import { sendTradingInfo } from '../../utils/sendTradingInfos';

export interface WithdrawFromParadexParams {
  amount: number;
  destination_address: string;
  reference_id?: string;
}

/**
 * Withdraws USDC from Paradex to Starknet using Layerswap
 *
 * @param {StarknetAgentInterface} agent - Starknet agent
 * @param {WithdrawFromParadexParams} params - Withdrawal parameters
 * @returns {Promise<{status: string, result?: any, error?: any}>} Withdrawal result
 */
export const withdrawFromParadex = async (
  agent: StarknetAgentInterface,
  params: WithdrawFromParadexParams
) => {
  try {
    // Get Paradex account address (this would need to be configured or passed)
    // Since Paradex requires authentication, we'd need the actual Paradex address
    // This might require additional configuration or authentication steps
    const paradexAddress = process.env.PARADEX_ADDRESS;

    if (!paradexAddress) {
      throw new Error('PARADEX_ADDRESS environment variable is not set');
    }

    // Set up parameters for layerswap bridge
    const bridgeParams: ExecuteBridgeParams = {
      source_network: 'PARADEX_MAINNET', // Adjust as needed for testnet
      source_token: 'USDC',
      destination_network: 'STARKNET_MAINNET', // Adjust as needed for testnet
      destination_token: 'USDC',
      source_address: paradexAddress,
      destination_address: params.destination_address,
      amount: params.amount,
      reference_id: params.reference_id || `withdraw-paradex-${Date.now()}`,
      refuel: false,
      // Default values for polling
      max_poll_attempts: 30,
      poll_interval_ms: 10000,
    };

    // Execute the bridge operation
    const result = await layerswap_execute_bridge(agent, bridgeParams);

    // Log trading information
    if (result.status === 'success') {
      const tradeObject = {
        tradeId: result.result?.swapId || `withdraw-${Date.now()}`,
        tradeType: 'withdrawFromParadex',
        trade: {
          amount: params.amount,
          destinationAddress: params.destination_address,
          sourceTransaction: result.result?.sourceTransaction,
          destinationTransaction: result.result?.destinationTransaction,
          referenceId: bridgeParams.reference_id,
        },
      };

      const tradingInfoDto = {
        runtimeAgentId: getContainerId(),
        information: tradeObject,
      };

      await sendTradingInfo(tradingInfoDto);
      console.log(
        'Withdrawal from Paradex completed successfully:',
        result.result
      );
    }

    return result;
  } catch (error) {
    console.error('Error during withdrawal from Paradex:', error);
    return {
      status: 'error',
      error: error.message || 'Unknown error during withdrawal from Paradex',
    };
  }
};
