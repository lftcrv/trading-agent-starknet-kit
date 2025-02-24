import { shortString } from "starknet";
import { SystemConfig, Account } from "./paradex-ts/types";
import { validateParadexConfig } from "./environment";
import { ParadexOrderError } from "../interfaces/errors";

export function getParadexConfig(): SystemConfig {
    const network = process.env.PARADEX_NETWORK?.toLowerCase();

    let apiBaseUrl: string;
    let chainId: string;

    if (network === "prod") {
        apiBaseUrl = "https://api.prod.paradex.trade/v1";
        chainId = shortString.encodeShortString("PRIVATE_SN_PARACLEAR_MAINNET");
    } else if (network === "testnet") {
        apiBaseUrl = "https://api.testnet.paradex.trade/v1";
        chainId = shortString.encodeShortString("PRIVATE_SN_POTC_SEPOLIA");
    } else {
        throw new Error(
            "Invalid PARADEX_NETWORK. Please set it to 'prod' or 'testnet'.",
        );
    }

    return { apiBaseUrl, starknet: { chainId } };
}

export async function getAccount(): Promise<Account> {
    try {
        const config = await validateParadexConfig();
        return {
            address: config.PARADEX_ACCOUNT_ADDRESS,
            publicKey: config.PARADEX_ACCOUNT_ADDRESS,
            privateKey: config.PARADEX_PRIVATE_KEY,
            ethereumAccount: config.ETHEREUM_ACCOUNT_ADDRESS,
        };
    } catch (error) {
        console.error("Failed to initialize account:", error);
        throw new ParadexOrderError(
            "Failed to initialize account configuration",
        );
    }
}

export class ParadexAuthenticationError extends Error {
    constructor(
        message: string,
        public details?: any,
    ) {
        super(message);
        this.name = "ParadexAuthenticationError";
    }
}

export const sendTradingInfo = async (tradingInfoDto: any): Promise<void> => {
    try {
      const backendPort = process.env.BACKEND_PORT || "8080";
      const isLocal = process.env.LOCAL_DEVELOPMENT === "TRUE";
      const host = isLocal ? process.env.HOST : "host.docker.internal";
      const apiKey = process.env.BACKEND_API_KEY;

      console.log(
        "Sending trading info to:",
        `http://${host}:${backendPort}/api/trading-information`
      );

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (apiKey) {
        headers["x-api-key"] = apiKey;
      }

      const response = await fetch(
        `http://${host}:${backendPort}/api/trading-information`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(tradingInfoDto),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to save trading info: ${response.status} ${response.statusText}`
        );
      }

      console.log("Trading information saved successfully");
      const data = await response.json();
      console.log("Response data:", data);
    } catch (error) {
      console.error(
        "Error saving trading information:",
        error.response?.data || error.message
      );
    }

  }
