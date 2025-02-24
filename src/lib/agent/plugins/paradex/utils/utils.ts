import { shortString } from 'starknet';
import { SystemConfig, Account } from './paradex-ts/types';
import { validateParadexConfig } from './environment';
import { ParadexOrderError } from '../interfaces/errors';
import * as fs from 'fs';

// Function to load environment variables from /etc/environment
function loadEnvironmentVariables() {
  try {
    console.log('Loading environment variables from /etc/environment...');
    const envFile = fs.readFileSync('/etc/environment', 'utf8');
    const envVars = envFile.split('\n');

    for (const line of envVars) {
      if (line.trim()) {
        const [key, value] = line
          .split('=')
          .map((part) => part.trim().replace(/^'|'$/g, ''));
        process.env[key] = value;
        console.log(`Loaded: ${key}=${value.substring(0, 10)}...`);
      }
    }
    console.log('Environment variables loaded successfully');
  } catch (error) {
    console.error('Error loading environment variables:', error);
  }
}

// Load environment variables when the module is imported
loadEnvironmentVariables();

export function getParadexConfig(): SystemConfig {
  const network = process.env.PARADEX_NETWORK?.toLowerCase();
  let apiBaseUrl: string;
  let chainId: string;

  if (network === 'prod') {
    apiBaseUrl = 'https://api.prod.paradex.trade/v1';
    chainId = shortString.encodeShortString('PRIVATE_SN_PARACLEAR_MAINNET');
  } else if (network === 'testnet') {
    apiBaseUrl = 'https://api.testnet.paradex.trade/v1';
    chainId = shortString.encodeShortString('PRIVATE_SN_POTC_SEPOLIA');
  } else {
    throw new Error(
      "Invalid PARADEX_NETWORK. Please set it to 'prod' or 'testnet'."
    );
  }

  return { apiBaseUrl, starknet: { chainId } };
}

export async function getAccount(): Promise<Account> {
  try {
    const network = process.env.PARADEX_NETWORK?.toLowerCase();

    if (!network) {
      throw new Error('PARADEX_NETWORK environment variable is not set');
    }

    const prefix = network === 'prod' ? 'PROD' : 'TESTNET';
    const address = process.env[`PARADEX_${prefix}_ADDRESS`];
    const privateKey = process.env[`PARADEX_${prefix}_PRIVATE_KEY`];

    if (!address || !privateKey) {
      throw new Error(
        `Missing Paradex credentials for ${network}. Required variables: PARADEX_${prefix}_ADDRESS and PARADEX_${prefix}_PRIVATE_KEY`
      );
    }

    const config = await validateParadexConfig();

    return {
      address: address,
      publicKey: address,
      privateKey: privateKey,
      ethereumAccount: config.ETHEREUM_ACCOUNT_ADDRESS,
    };
  } catch (error) {
    console.error('Failed to initialize account:', error);
    throw new ParadexOrderError('Failed to initialize account configuration');
  }
}

export class ParadexAuthenticationError extends Error {
  constructor(
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ParadexAuthenticationError';
  }
}

export const sendTradingInfo = async (
  tradingInfoDto: any,
  backendPort: number,
  apiKey: string
) => {
  try {
    const backendPort = process.env.BACKEND_PORT || '8080';
    const isLocal = process.env.LOCAL_DEVELOPMENT === 'TRUE';
    const host = isLocal
      ? process.env.BACKEND_SERVER_PORT
      : 'host.docker.internal';

    console.info(
      'Sending trading info to:',
      `http://${host}:${backendPort}/api/trading-information`
    );

    const response = await fetch(
      `http://${host}:${backendPort}/api/trading-information`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(tradingInfoDto),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to save trading info: ${response.status} ${response.statusText}`
      );
    }

    console.info('Trading information saved successfully');
    const data = await response.json();
    console.info('Response data:', data);
  } catch (error) {
    console.error(
      'Error saving trading information:',
      error.response?.data || error.message
    );
  }
};
