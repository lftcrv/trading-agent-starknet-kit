import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { Account, SystemConfig } from '../interfaces/config';
import { authenticate } from '../utils/paradex-ts/api';
import {
  getAccount,
  getParadexConfig,
  ParadexAuthenticationError,
} from '../utils/utils';
import { GetOpenOrdersParams } from '../interfaces/params';
import { ParadexOpenOrdersError } from '../interfaces/errors';
import { OrderResult, OrderResponse } from '../interfaces/results';

// Service class for open orders operations
export class OpenOrdersService {
  private formatOrder(order: OrderResult): string {
    try {
      const price = parseFloat(order.price).toFixed(2);
      const size = parseFloat(order.size).toFixed(4);
      const remainingSize = parseFloat(order.remaining_size).toFixed(4);
      const created = new Date(order.created_at).toLocaleString();

      return `ID: ${order.id} | ${order.market} | ${order.side} ${size} @ ${price} | Type: ${order.type} | Remaining: ${remainingSize} | Created: ${created}`;
    } catch (error) {
      console.error('Error formatting order:', error, 'Order data:', order);
      return `Error formatting order ${order.id}`;
    }
  }

  async fetchOpenOrders(
    config: SystemConfig,
    account: Account,
    market?: string
  ): Promise<OrderResponse> {
    try {
      if (!account.jwtToken) {
        throw new ParadexOpenOrdersError('JWT token is missing');
      }

      // Construct URL
      const url = market
        ? `${config.apiBaseUrl}/orders?market=${market}`
        : `${config.apiBaseUrl}/orders`;

      console.info('Fetching open orders from URL:', url);

      // Fetch orders
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${account.jwtToken}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ParadexOpenOrdersError(
          `Failed to fetch orders: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in fetchOpenOrders:', error);
      throw error instanceof ParadexOpenOrdersError
        ? error
        : new ParadexOpenOrdersError('Failed to fetch open orders', error);
    }
  }

  formatOrdersResponse(orders: OrderResult[]): {
    text: string;
    orders: OrderResult[];
  } {
    if (!orders || orders.length === 0) {
      return {
        text: 'No open orders found.',
        orders: [],
      };
    }

    const formattedOrders = orders.map((order) => this.formatOrder(order));
    return {
      text: `Current Open Orders:\n${formattedOrders.join('\n')}`,
      orders: orders,
    };
  }
}

// Main function to get open orders
export const paradexGetOpenOrders = async (
  agent: StarknetAgentInterface,
  params?: GetOpenOrdersParams
) => {
  const service = new OpenOrdersService();
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

    // Fetch open orders
    const ordersData = await service.fetchOpenOrders(
      config,
      account,
      params?.market
    );

    // Format the response
    const formattedResponse = service.formatOrdersResponse(ordersData.results);
    console.log(formattedResponse.text);

    return {
      success: true,
      data: formattedResponse.orders,
      text: formattedResponse.text,
    };
  } catch (error) {
    if (error instanceof ParadexOpenOrdersError) {
      console.error('Open orders error:', error.details || error.message);
    } else {
      console.error('Unexpected error fetching open orders:', error);
    }
    return {
      success: false,
      data: [],
      text: 'Failed to fetch open orders. Please try again later.',
    };
  }
};
