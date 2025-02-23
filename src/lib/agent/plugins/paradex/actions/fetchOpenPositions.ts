import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { Account, SystemConfig } from '../interfaces/config';
import { authenticate } from '../utils/paradex-ts/api';
import {
  getAccount,
  getParadexConfig,
  ParadexAuthenticationError,
} from '../utils/utils';
import { PositionResponse, PositionResult } from '../interfaces/results';
import { GetOpenPositionsParams } from '../interfaces/params';

// Custom error for open positions operations
export class ParadexOpenPositionsError extends Error {
  constructor(
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ParadexOpenPositionsError';
  }
}

export class OpenPositionsService {
  private formatPosition(position: PositionResult): string {
    try {
      const entryPrice = parseFloat(position.average_entry_price).toFixed(2);
      const size = parseFloat(position.size);
      const absSize = Math.abs(size).toFixed(4);
      const unrealizedPnl = parseFloat(position.unrealized_pnl).toFixed(2);
      const liquidationPrice = parseFloat(position.liquidation_price).toFixed(
        2
      );

      return `Market: ${position.market} | ${position.side} ${absSize} @ ${entryPrice} | PnL: ${unrealizedPnl} USD | Liq. Price: ${liquidationPrice}`;
    } catch (error) {
      console.error(
        'Error formatting position:',
        error,
        'Position data:',
        position
      );
      return `Error formatting position for ${position.market}`;
    }
  }

  async fetchOpenPositions(
    config: SystemConfig,
    account: Account,
    market?: string
  ): Promise<PositionResponse> {
    try {
      if (!account.jwtToken) {
        throw new ParadexOpenPositionsError('JWT token is missing');
      }

      // Construct URL
      const url = market
        ? `${config.apiBaseUrl}/positions?market=${market}`
        : `${config.apiBaseUrl}/positions`;

      console.info('Fetching open positions from URL:', url);

      // Fetch positions
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${account.jwtToken}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ParadexOpenPositionsError(
          `Failed to fetch positions: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in fetchOpenPositions:', error);
      throw error instanceof ParadexOpenPositionsError
        ? error
        : new ParadexOpenPositionsError(
            'Failed to fetch open positions',
            error
          );
    }
  }

  formatPositionsResponse(positions: PositionResult[]): {
    text: string;
    positions: PositionResult[];
  } {
    // Filter out closed positions and positions with zero size
    const activePositions = positions.filter((position) => {
      const size = parseFloat(position.size);
      return position.status === 'OPEN' && size !== 0;
    });

    if (!activePositions || activePositions.length === 0) {
      return {
        text: 'No open positions found.',
        positions: [],
      };
    }

    const formattedPositions = activePositions.map((position) =>
      this.formatPosition(position)
    );
    return {
      text: `Current Open Positions:\n${formattedPositions.join('\n')}`,
      positions: activePositions,
    };
  }
}

// Main function to get open positions
export const paradexGetOpenPositions = async (
  agent: StarknetAgentInterface,
  params?: GetOpenPositionsParams
) => {
  const service = new OpenPositionsService();
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

    // Fetch open positions
    const positionsData = await service.fetchOpenPositions(
      config,
      account,
      params?.market
    );

    // Format the response
    const formattedResponse = service.formatPositionsResponse(
      positionsData.results
    );
    console.log(formattedResponse.text);

    return {
      success: true,
      data: formattedResponse.positions,
      text: formattedResponse.text,
    };
  } catch (error) {
    if (error instanceof ParadexOpenPositionsError) {
      console.error('Open positions error:', error.details || error.message);
    } else {
      console.error('Unexpected error fetching open positions:', error);
    }
    return {
      success: false,
      data: [],
      text: 'Failed to fetch open positions. Please try again later.',
    };
  }
};
