import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import {
  GetMarketTradingInfoParams,
  MarketTradingInfoBasic,
  ParadexMarketInfoBasicError,
  SystemConfig,
} from '../../interfaces';
import { getParadexConfig } from '../../utils/getParadexConfig';

export class MarketTradingInfoService {
  private formatMarketInfo(market: MarketTradingInfoBasic): string {
    const formatPercentage = (value: string) =>
      `${(parseFloat(value) * 100).toFixed(3)}%`;

    return `${market.symbol} (${market.base_currency}/${market.quote_currency}):
Trading Limits:
• Min Order Value: ${market.min_notional} USD
• Max Order Size: ${market.max_order_size}
• Position Limit: ${market.position_limit}
• Size Step: ${market.order_size_increment}
• Price Tick: ${market.price_tick_size}

Market Parameters:
• Max Spread: ${formatPercentage(market.max_tob_spread)}
• Initial Margin Factor: ${formatPercentage(market.delta1_cross_margin_params.imf_base)}

Funding:
• Period: ${market.funding_period_hours}h
• Max Rate: ${formatPercentage(market.max_funding_rate)}
• Max Rate Change: ${formatPercentage(market.max_funding_rate_change)}`;
  }

  async fetchMarketInfo(
    config: SystemConfig,
    markets: string[]
  ): Promise<MarketTradingInfoBasic[]> {
    try {
      const results: MarketTradingInfoBasic[] = [];

      for (const market of markets) {
        const url = `${config.apiBaseUrl}/markets?market=${market}`;
        console.info(`Fetching trading info for ${market}`);

        const response = await fetch(url, {
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new ParadexMarketInfoBasicError(
            `Failed to fetch info for ${market}: ${response.status}`
          );
        }

        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const marketInfo = data.results[0];
          results.push({
            symbol: marketInfo.symbol,
            base_currency: marketInfo.base_currency,
            quote_currency: marketInfo.quote_currency,
            price_tick_size: marketInfo.price_tick_size,
            order_size_increment: marketInfo.order_size_increment,
            min_notional: marketInfo.min_notional,
            max_order_size: marketInfo.max_order_size,
            position_limit: marketInfo.position_limit,
            max_tob_spread: marketInfo.max_tob_spread,
            delta1_cross_margin_params: {
              imf_base: marketInfo.delta1_cross_margin_params.imf_base,
            },
            funding_period_hours: marketInfo.funding_period_hours,
            max_funding_rate: marketInfo.max_funding_rate,
            max_funding_rate_change: marketInfo.max_funding_rate_change,
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error fetching market info:', error);
      throw error instanceof ParadexMarketInfoBasicError
        ? error
        : new ParadexMarketInfoBasicError('Failed to fetch market info', error);
    }
  }

  formatResponse(markets: MarketTradingInfoBasic[]): {
    text: string;
    markets: MarketTradingInfoBasic[];
  } {
    if (!markets || markets.length === 0) {
      return {
        text: 'No market information found.',
        markets: [],
      };
    }

    const formattedMarkets = markets.map((market) =>
      this.formatMarketInfo(market)
    );
    return {
      text: formattedMarkets.join('\n\n'),
      markets: markets,
    };
  }
}

export const paradexGetMarketTradingInfo = async (
  agent: StarknetAgentInterface,
  params: GetMarketTradingInfoParams
) => {
  const service = new MarketTradingInfoService();
  try {
    const config = await getParadexConfig();

    // Convert single market to array if needed
    const marketsToFetch = Array.isArray(params.markets)
      ? params.markets
      : [params.markets];

    // Fetch market info
    const marketsData = await service.fetchMarketInfo(config, marketsToFetch);

    // Format the response
    const formattedResponse = service.formatResponse(marketsData);
    console.log('Market trading info retrieved successfully');

    return {
      success: true,
      data: formattedResponse.markets,
      text: formattedResponse.text,
    };
  } catch (error) {
    if (error instanceof ParadexMarketInfoBasicError) {
      console.error('Market info error:', error.details || error.message);
    } else {
      console.error('Unexpected error fetching market info:', error);
    }
    return {
      success: false,
      data: [],
      text: 'Failed to fetch market trading information. Please try again later.',
    };
  }
};
