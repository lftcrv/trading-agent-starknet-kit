import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import {
  GetMarketDetailsParams,
  MarketInfo,
  MarketResponse,
  ParadexMarketError,
  SystemConfig,
} from '../../interfaces';
import { getParadexConfig } from '../../utils/getParadexConfig';

export class MarketDetailsService {
  public formatMarketDetails(market: MarketInfo): string {
    const formatPercentage = (value: string) =>
      `${(parseFloat(value) * 100).toFixed(3)}%`;

    return `Market Details for ${market.symbol}:

Basic Information:
• Base/Quote: ${market.base_currency}/${market.quote_currency}
• Settlement: ${market.settlement_currency}
• Type: ${market.asset_kind}
• Market Kind: ${market.market_kind}

Trading Parameters:
• Min Order Value: ${market.min_notional} USD
• Max Order Size: ${market.max_order_size}
• Position Limit: ${market.position_limit}
• Order Size Step: ${market.order_size_increment}
• Price Tick Size: ${market.price_tick_size}
• Max Open Orders: ${market.max_open_orders}
• Max TOB Spread: ${formatPercentage(market.max_tob_spread)}

Risk Parameters:
• IMF Base: ${formatPercentage(market.delta1_cross_margin_params.imf_base)}
• IMF Shift: ${market.delta1_cross_margin_params.imf_shift}
• IMF Factor: ${market.delta1_cross_margin_params.imf_factor}
• MMF Factor: ${formatPercentage(market.delta1_cross_margin_params.mmf_factor)}
• Price Bands Width: ${formatPercentage(market.price_bands_width)}

Funding & Rates:
• Funding Period: ${market.funding_period_hours} hours
• Max Funding Rate: ${formatPercentage(market.max_funding_rate)}
• Max Rate Change: ${formatPercentage(market.max_funding_rate_change)}
• Interest Rate: ${formatPercentage(market.interest_rate)}
• Clamp Rate: ${formatPercentage(market.clamp_rate)}

Oracle:
• Feed ID: ${market.price_feed_id}
• EWMA Factor: ${market.oracle_ewma_factor}

Tags: ${market.tags.length > 0 ? market.tags.join(', ') : 'None'}`;
  }

  async fetchMarketDetails(
    config: SystemConfig,
    market: string
  ): Promise<MarketResponse> {
    try {
      const url = `${config.apiBaseUrl}/markets?market=${market}`;
      console.info('Fetching market details from URL:', url);

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ParadexMarketError(
          `Failed to fetch market details: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in fetchMarketDetails:', error);
      throw error instanceof ParadexMarketError
        ? error
        : new ParadexMarketError('Failed to fetch market details', error);
    }
  }
}

// Main function to get market details
export const paradexGetMarketDetails = async (
  agent: StarknetAgentInterface,
  params: GetMarketDetailsParams
) => {
  const service = new MarketDetailsService();
  try {
    const config = await getParadexConfig();

    // Fetch market details
    const marketData = await service.fetchMarketDetails(config, params.market);

    if (!marketData.results || marketData.results.length === 0) {
      return {
        success: false,
        data: null,
        text: `No market found with symbol: ${params.market}`,
      };
    }

    const market = marketData.results[0];
    const formattedText = service.formatMarketDetails(market);

    return {
      success: true,
      data: market,
      text: formattedText,
    };
  } catch (error) {
    if (error instanceof ParadexMarketError) {
      console.error('Market details error:', error.details || error.message);
    } else {
      console.error('Unexpected error fetching market details:', error);
    }
    return {
      success: false,
      data: null,
      text: 'Failed to fetch market details. Please try again later.',
    };
  }
};
