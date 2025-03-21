import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { layerswap_execute_bridge } from '../../../layerswap/actions';
import { ExecuteBridgeParams } from '../../../layerswap/schema';
import { getContainerId } from '../../utils/getContainerId';
import { sendTradingInfo } from '../../utils/sendTradingInfos';

export interface DepositToParadexParams {
  amount: number;
  destination_address: string;
  reference_id?: string;
}

/**
 * Deposits USDC from Starknet to Paradex using Layerswap
 *
 * @param {StarknetAgentInterface} agent - Starknet agent
 * @param {DepositToParadexParams} params - Deposit parameters
 * @returns {Promise<{status: string, result?: any, error?: any}>} Deposit result
 */
export const depositToParadex = async (
  agent: StarknetAgentInterface,
  params: DepositToParadexParams
) => {
  console.log('Executing depositToParadex from Lftcrv');
  try {
    // Get account public key for the source address
    const { accountPublicKey } = agent.getAccountCredentials();

    // Set up parameters for layerswap bridge
    const bridgeParams: ExecuteBridgeParams = {
      source_network: 'STARKNET_MAINNET',
      source_token: 'USDC',
      destination_network: 'PARADEX_MAINNET',
      destination_token: 'USDC',
      source_address: accountPublicKey,
      destination_address: params.destination_address,
      amount: params.amount,
      reference_id: undefined,
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
        tradeId: result.result?.swapId || `deposit-${Date.now()}`,
        tradeType: 'depositToParadex',
        trade: {
          amount: params.amount,
          destinationAddress: params.destination_address,
          sourceTransaction: result.result?.sourceTransaction,
          destinationTransaction: result.result?.destinationTransaction,
          referenceId: bridgeParams.reference_id,
        },
      };
      console.log('depositObject:', tradeObject);

      // const tradingInfoDto = {
      //   runtimeAgentId: getContainerId(),
      //   information: tradeObject,
      // };

      // await sendTradingInfo(tradingInfoDto);
      console.log('Deposit to Paradex completed successfully:', result.result);
    }

    return result;
  } catch (error) {
    console.error('Error during deposit to Paradex:', error);
    return {
      status: 'error',
      error: error.message || 'Unknown error during deposit to Paradex',
    };
  }
};
