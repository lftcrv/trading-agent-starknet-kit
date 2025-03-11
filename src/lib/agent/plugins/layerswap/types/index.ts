/**
 * Layerswap Constants
 */
export const LayerswapConstant = {
  DEFAULT_BASE_URL: 'https://api.layerswap.io/api/v2',
  DEFAULT_POLL_INTERVAL_MS: 10000,
  DEFAULT_MAX_POLL_ATTEMPTS: 30,
  HTTP_STATUS_OK: 200,
  HTTP_STATUS_ERROR: 500,
} as const;

/**
 * Swap Status Types
 */
export enum SwapStatus {
  PENDING = 'user_transfer_pending',
  PROCESSING = 'ls_transfer_pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

/**
 * Network Types
 */
export enum NetworkType {
  STARKNET_MAINNET = 'STARKNET_MAINNET',
  PARADEX_MAINNET = 'PARADEX_MAINNET',
  ETHEREUM_MAINNET = 'ETHEREUM_MAINNET',
  ARBITRUM_MAINNET = 'ARBITRUM_MAINNET',
  OPTIMISM_MAINNET = 'OPTIMISM_MAINNET',
  BASE_MAINNET = 'BASE_MAINNET',
  ZKSYNC_MAINNET = 'ZKSYNC_MAINNET',
  // Add other networks as needed
}

/**
 * Swap Input Type
 */
export interface SwapInput {
  source_network: string;
  source_token: string;
  destination_network: string;
  destination_token: string;
  source_address: string;
  destination_address: string;
  amount: number;
  refuel: boolean;
  reference_id?: string;
  use_deposit_address?: boolean;
}

/**
 * Swap Response Type
 */
export interface SwapResponse {
  id: string;
  reference_id?: string;
  created_date: string;
  status: SwapStatus;
  source_network: string;
  source_token: string;
  destination_network: string;
  destination_token: string;
  amount: number;
  fee: number;
  destination_address: string;
  expires_at: string;
  deposit_address?: string;
  input?: {
    transaction_id: string;
    from_address: string;
  };
  output?: {
    transaction_id: string;
    to_address: string;
  };
}

/**
 * Deposit Action Type
 */
export interface DepositAction {
  token_address: string;
  deposit_address: string;
  function_name: string;
  needs_approval: boolean;
}
