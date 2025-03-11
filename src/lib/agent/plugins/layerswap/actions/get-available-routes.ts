import axios from 'axios';
import { StarknetAgentInterface } from '../../../tools/tools';
import { GetAvailableRoutesParams } from '../schema';
import { getLayerswapApiKey, getLayerswapBaseUrl } from '../utils/config';

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
    const apiKey = getLayerswapApiKey();
    const baseUrl = getLayerswapBaseUrl();

    const response = await axios.get(`${baseUrl}/networks`, {
      headers: {
        'X-LS-APIKEY': apiKey,
      },
    });
    console.log("response:", response)
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
