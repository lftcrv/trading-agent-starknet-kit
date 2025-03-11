import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { CancelOrderParams } from '../../../paradex/interfaces/params';
import { CancelOrderService } from '../../../paradex/actions/cancelOrder';
import {
  getAccount,
  getParadexConfig,
  ParadexAuthenticationError,
} from '../../../paradex/utils/utils';
import { authenticate } from '../../../paradex/utils/paradex-ts/api';
import { getContainerId } from '../../utils/getContainerId';
import { sendTradingInfo } from '../../utils/sendTradingInfos';
import { ParadexCancelError } from '../../../paradex/interfaces/errors';

export const paradexCancelOrder = async (
  agent: StarknetAgentInterface,
  params: CancelOrderParams
) => {
  const service = new CancelOrderService();
  try {
    const config = await getParadexConfig();
    const account = await getAccount();

    try {
      account.jwtToken = await authenticate(config, account);
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new ParadexAuthenticationError(
        'Failed to authenticate with Paradex',
        error
      );
    }
    console.info('Authentication successful');

    const result = await service.cancelOrder(config, account, params.orderId);
    if (result) {
      const tradeObject = {
        tradeId: params.orderId,
        tradeType: 'paradexCancelOrder',
        explanation: params.explanation ?? '',
      };
      const tradingInfoDto = {
        runtimeAgentId: getContainerId(),
        information: tradeObject,
      };
      await sendTradingInfo(tradingInfoDto);
      console.log('Order cancelled successfully');
      console.log('explanation :', params.explanation);
      return true;
    } else {
      console.warn('Failed to cancel order');
      return false;
    }
  } catch (error) {
    if (error instanceof ParadexCancelError) {
      console.error('Cancel order error:', error.details || error.message);
    } else {
      console.error('Unexpected error during order cancellation:', error);
    }
    return false;
  }
};
