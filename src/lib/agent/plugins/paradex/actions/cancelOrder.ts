import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { Account, SystemConfig } from '../interfaces/config';
import { authenticate } from '../utils/paradex-ts/api';
import {
  getAccount,
  getParadexConfig,
  ParadexAuthenticationError,
} from '../utils/utils';
import { ParadexCancelError } from '../interfaces/errors';
import { CancelOrderParams } from '../interfaces/params';

export class CancelOrderService {
  async cancelOrder(
    config: SystemConfig,
    account: Account,
    orderId: string
  ): Promise<boolean> {
    try {
      if (!account.jwtToken) {
        throw new ParadexCancelError('JWT token is missing');
      }

      const response = await fetch(`${config.apiBaseUrl}/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${account.jwtToken}`,
          Accept: 'application/json',
        },
      });

      if (response.status === 204) {
        console.log(`Successfully cancelled order ${orderId}`);
        return true;
      }

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = 'Could not parse error response';
        }
        throw new ParadexCancelError(
          `Failed to cancel order: ${response.status} ${response.statusText}`,
          errorData
        );
      }

      return false;
    } catch (error) {
      console.error(`Error cancelling order ${orderId}:`, error);
      throw error instanceof ParadexCancelError
        ? error
        : new ParadexCancelError(
            'Failed to cancel order',
            error instanceof Error ? error.message : error
          );
    }
  }
}

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

    // Cancel the order
    const result = await service.cancelOrder(config, account, params.orderId);
    if (result) {
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
