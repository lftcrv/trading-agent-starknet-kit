import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { SystemConfig } from '../interfaces/config';
import { ListMarketResponse } from '../interfaces/results';
import { getParadexConfig } from '../utils/utils';
import { ParadexListMarketsError } from '../interfaces/errors';

export class ListMarketsService {
  async fetchMarkets(config: SystemConfig): Promise<string[]> {
    try {
      const url = `${config.apiBaseUrl}/markets`;
      console.info('Fetching available markets from Paradex');

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new ParadexListMarketsError(
          `Failed to fetch markets: ${response.status}`
        );
      }

      const data = (await response.json()) as ListMarketResponse;
      return data.results.map((market) => market.symbol).sort();
    } catch (error) {
      console.error('Error fetching markets:', error);
      throw error instanceof ParadexListMarketsError
        ? error
        : new ParadexListMarketsError('Failed to fetch markets list', error);
    }
  }

  formatResponse(markets: string[]): {
    text: string;
    markets: string[];
  } {
    if (!markets || markets.length === 0) {
      return {
        text: 'No markets available.',
        markets: [],
      };
    }

    return {
      text: markets.join('\n'),
      markets: markets,
    };
  }
}

export const paradexListMarkets = async (agent: StarknetAgentInterface) => {
  const service = new ListMarketsService();
  try {
    const config = await getParadexConfig();
    const markets = await service.fetchMarkets(config);
    const formattedResponse = service.formatResponse(markets);
    console.log('Markets list retrieved successfully');

    return {
      success: true,
      data: formattedResponse.markets,
      text: formattedResponse.text,
    };
  } catch (error) {
    if (error instanceof ParadexListMarketsError) {
      console.error('List markets error:', error.details || error.message);
    } else {
      console.error('Unexpected error listing markets:', error);
    }
    return {
      success: false,
      data: [],
      text: 'Failed to fetch markets list. Please try again later.',
    };
  }
};
