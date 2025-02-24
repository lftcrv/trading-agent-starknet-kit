declare namespace NodeJS {
  export interface ProcessEnv {
    STARKNET_PRIVATE_KEY: string;
    STARKNET_PUBLIC_ADDRESS: string;
    STARKNET_RPC_URL: string;
    AI_PROVIDER_API_KEY: string;
    AI_MODEL: string;
    AI_PROVIDER: string;
    AGENT_SERVER_API_KEY: string;
  }
}
