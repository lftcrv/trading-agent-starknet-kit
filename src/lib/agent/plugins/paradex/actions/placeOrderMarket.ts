import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { PlaceOrderMarketParams, PlaceOrderParams } from '../interfaces/params';

import { Account, SystemConfig } from '../interfaces/config';
import { signOrder } from '../utils/paradex-ts/signature';
import { authenticate } from '../utils/paradex-ts/api';
import { getAccount, getParadexConfig, ParadexAuthenticationError } from '../utils/utils';
import { ParadexOrderError } from '../interfaces/errors';
import { time } from 'console';

export class POService {
  public formatSize(size: number): string {
    // Convert to string with maximum 8 decimal places
    return Number(size).toFixed(8);
  }

  public formatPrice(price: number): string {
    // Round to nearest 0.1 todo should be adapted for each crypto
    return (Math.round(price * 10) / 10).toFixed(1);
  }

  async placeOrder(
    config: SystemConfig,
    account: Account,
    orderDetails: PlaceOrderParams
  ): Promise<any> {
    try {
      if (!account.jwtToken) {
        throw new ParadexOrderError('JWT token is missing');  // TODO: change the error, it is a auth error
      }

      const timestamp = Date.now();

      // Format the order details with proper price and size formatting, todo should adapt to each crypto for rounding decimals
      const formattedOrderDetails: Record<string, string> = {
        market: orderDetails.market,
        side: orderDetails.side,
        type: orderDetails.type,
        size: this.formatSize(parseFloat(orderDetails.size)),
        ...(orderDetails.price && {
          price: this.formatPrice(parseFloat(orderDetails.price)),
        }),
        ...(orderDetails.instruction && {
          instruction: orderDetails.instruction,
        }),
      };

      const signature = signOrder(
        config,
        account,
        formattedOrderDetails,
        timestamp
      );

      const response = await fetch(`${config.apiBaseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${account.jwtToken}`,
        },
        body: JSON.stringify({
          ...formattedOrderDetails,
          signature,
          signature_timestamp: timestamp,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ParadexOrderError(
          `HTTP Error ${response.status}: ${errorText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error in placeOrderApi:', error);
      throw error instanceof ParadexOrderError
        ? error
        : new ParadexOrderError('Failed to place order', error);
    }
  }
}

export const paradexPlaceOrderMarket = async (
  agent: StarknetAgentInterface,
  params: PlaceOrderMarketParams
) => {
  const service = new POService();
  try {
    const config = await getParadexConfig();

    // Initialize account
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

    // Convert to order parameters
    const orderParams: PlaceOrderParams = {
      market: params.market,
      side:
        params.side.toLowerCase() === 'long' ||
          params.side.toLowerCase() === 'buy'
          ? 'BUY'
          : 'SELL',
      type: 'MARKET',
      size: String(Number(params.size).toFixed(8)),
      instruction: 'GTC',
    };

    console.info('Placing market order with params:', orderParams);

    // Place the order
    const result = await service.placeOrder(config, account, orderParams);
    console.log('Market order placed successfully:', result);

    return true;
  } catch (error) {
    if (error instanceof ParadexOrderError) {
      console.error(
        'Market order placement error:',
        error.details || error.message
      );
    } else {
      console.error('Unexpected error during market order placement:', error);
    }
    return false;
  }
};
