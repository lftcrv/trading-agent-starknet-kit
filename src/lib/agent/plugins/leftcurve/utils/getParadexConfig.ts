import { shortString } from 'starknet';
import { SystemConfig } from '../interfaces';

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
