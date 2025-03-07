import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { SystemConfig } from '../interfaces/config';
import { ParadexBBOError } from '../interfaces/errors';
import { GetBBOParams } from '../interfaces/params';
import { BBOResponse, MarketMetrics } from '../interfaces/results';
import { getParadexConfig } from '../utils/utils';
export class BBOService {
  private formatNumber(value: string, decimals: number = 2): string {
    try {
      const num = parseFloat(value);
      return isNaN(num) ? 'N/A' : num.toFixed(decimals);
    } catch {
      return 'N/A';
    }
  }

  private calculateSpread(
    bid: number,
    ask: number
  ): { spread: number; percentage: number } {
    const spread = ask - bid;
    const percentage = (spread / bid) * 100;
    return { spread, percentage };
  }

  private formatMarketBBO(market: string, data: BBOResponse): string {
    try {
      const bid = parseFloat(data.bid);
      const ask = parseFloat(data.ask);
      const { percentage } = this.calculateSpread(bid, ask);

      return `${market}: ${this.formatNumber(data.bid)}/${this.formatNumber(data.ask)} | Size: ${this.formatNumber(data.bid_size)}/${this.formatNumber(data.ask_size)} | Spread: ${this.formatNumber(percentage.toString())}%`;
    } catch (error) {
      console.error('Error formatting BBO:', error);
      return `${market}: Failed to format data`;
    }
  }

  async fetchMarketBBO(
    config: SystemConfig,
    market: string
  ): Promise<BBOResponse> {
    try {
      const response = await fetch(`${config.apiBaseUrl}/bbo/${market}`, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ParadexBBOError(
          `Failed to fetch BBO for ${market}: ${response.status} - ${errorText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching BBO for ${market}:`, error);
      throw error instanceof ParadexBBOError
        ? error
        : new ParadexBBOError(`Failed to fetch BBO for ${market}`, error);
    }
  }

  formatBBOResponse(bboDataMap: Map<string, BBOResponse>): {
    text: string;
    metrics: Record<string, MarketMetrics>;
  } {
    const marketMetrics: Record<string, MarketMetrics> = {};
    const formattedLines: string[] = [];

    for (const [market, bboData] of bboDataMap.entries()) {
      try {
        const bid = parseFloat(bboData.bid);
        const ask = parseFloat(bboData.ask);
        const { spread, percentage } = this.calculateSpread(bid, ask);

        marketMetrics[market] = {
          spread,
          spreadPercentage: percentage,
          lastBid: bid,
          lastAsk: ask,
          timestamp: bboData.last_updated_at,
        };

        formattedLines.push(this.formatMarketBBO(market, bboData));
      } catch (error) {
        formattedLines.push(`${market}: Failed to process data`);
      }
    }

    return {
      text:
        formattedLines.length > 0
          ? `Latest BBO Metrics:\n${formattedLines.join('\n')}`
          : 'No BBO data available.',
      metrics: marketMetrics,
    };
  }
}

export const paradexGetBBO = async (
  agent: StarknetAgentInterface,
  params: GetBBOParams
) => {
  const service = new BBOService();
  try {
    const config = await getParadexConfig();

    if (!params.markets || params.markets.length === 0) {
      return {
        success: false,
        data: {},
        text: 'No markets specified. Please provide at least one market symbol.',
      };
    }

    const bboDataMap = new Map<string, BBOResponse>();
    for (const market of params.markets) {
      try {
        const bboData = await service.fetchMarketBBO(config, market);
        bboDataMap.set(market, bboData);
      } catch (error) {
        console.error(`Failed to fetch BBO for ${market}:`, error);
      }
    }

    if (bboDataMap.size === 0) {
      return {
        success: false,
        data: {},
        text: 'Failed to fetch BBO data for all requested markets.',
      };
    }

    const formattedResponse = service.formatBBOResponse(bboDataMap);
    console.log(formattedResponse.text);

    return {
      success: true,
      data: formattedResponse.metrics,
      text: formattedResponse.text,
    };
  } catch (error) {
    if (error instanceof ParadexBBOError) {
      console.error('BBO error:', error.details || error.message);
    } else {
      console.error('Unexpected error fetching BBO:', error);
    }
    return {
      success: false,
      data: {},
      text: 'Failed to fetch market BBO data. Please try again later.',
    };
  }
};
