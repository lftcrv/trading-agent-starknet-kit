import axios from 'axios';
import { StarknetAgentInterface } from '../../../tools/tools';
import { GetAvailableRoutesParams } from '../schema';
import { LayerswapManager } from './layerswap-manager';

/**
 * Gets available routes for bridging
 *
 * @param {StarknetAgentInterface} agent - Starknet agent
 * @param {GetAvailableRoutesParams} params - Request parameters
 * @returns {Promise<{status: string, routes?: any[], error?: any}>} Available routes
 */
export const layerswap_get_available_routes = async (
  agent: StarknetAgentInterface,
  params: GetAvailableRoutesParams
) => {
  try {
    // @ts-ignore - For TypeScript, we need to add these methods to the agent interface
    const apiKey = agent.getLayerswapApiKey();
    // @ts-ignore
    const baseUrl = agent.getLayerswapBaseUrl();

    if (!apiKey) {
      throw new Error('Layerswap API key not found in agent configuration');
    }

    // Just need the API key and base URL for this operation
    const layerswapBaseUrl = baseUrl || 'https://api.layerswap.io/api/v2';

    const response = await axios.get(`${layerswapBaseUrl}/available_networks`, {
      headers: {
        'X-LS-APIKEY': apiKey,
      },
    });

    // Filter by source network
    let routes = response.data.filter(
      (route: any) => route.internal_name === params.source_network
    );

    // Apply destination filter if provided
    if (params.destination_network) {
      routes = routes.filter((route: any) =>
        route.supported_destinations.some(
          (dest: any) => dest.internal_name === params.destination_network
        )
      );
    }

    // Apply asset filter if provided
    if (params.asset) {
      routes = routes.filter((route: any) =>
        route.assets.includes(params.asset)
      );
    }

    return {
      status: 'success',
      routes,
    };
  } catch (error) {
    console.error('Error getting available routes:', error);
    return {
      status: 'error',
      error,
    };
  }
};
