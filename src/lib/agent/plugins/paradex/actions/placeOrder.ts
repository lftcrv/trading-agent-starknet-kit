import { StarknetAgentInterface } from "src/lib/agent/tools/tools";
import { PlaceOrderLimitParams, PlaceOrderParams } from "../interfaces";

import { ParadexOrderError } from "../utils/ParadexOrderError";
import { Account, SystemConfig } from "../types";
import { shortString } from "starknet";
import { validateParadexConfig } from "../utils/environment";
import { signOrder } from "../utils/paradex-ts/signature";
import { authenticate } from "../utils/paradex-ts/api";
import { ParadexAuthenticationError } from "../utils/utils";


export class POService {

  public formatSize(size: number): string {
    // Convert to string with maximum 8 decimal places
    return Number(size).toFixed(8);
  }

  public formatPrice(price: number): string {
    // Round to nearest 0.1
    return (Math.round(price * 10) / 10).toFixed(1);
  }

  async sendTradingInfo(tradingInfoDto: any, backendPort: any, apiKey: any) {
    // TODO: duplicated code from plugin-starknet. Refacto code
    try {
      const isLocal = process.env.LOCAL_DEVELOPMENT === "TRUE";
      const host = isLocal ? process.env.HOST : "host.docker.internal";

      console.log(
        "Sending trading info to:",
        `http://${host}:${backendPort}/api/trading-information`
      );

      const response = await fetch(
        `http://${host}:${backendPort}/api/trading-information`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
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
    } catch (error) {
      console.error(
        "Error saving trading information:",
        error.response?.data || error.message
      );
    }
  };

  async placeOrder(
    config: SystemConfig,
    account: Account,
    orderDetails: PlaceOrderParams,
  ): Promise<any> {
    try {
      if (!account.jwtToken) {
        throw new ParadexOrderError("JWT token is missing");
      }

      const timestamp = Date.now();

      // Format the order details with proper price and size formatting, todo should adapt to each crypto for rounding decimals 
      const formattedOrderDetails: Record<string, string> = {
        market: orderDetails.market,
        side: orderDetails.side,
        type: orderDetails.type,
        size: this.formatSize(parseFloat(orderDetails.size)),
        ...(orderDetails.price && {
          price: this.formatPrice(parseFloat(orderDetails.price)),
        }),
        ...(orderDetails.instruction && {
          instruction: orderDetails.instruction,
        }),
      };

      const signature = signOrder(
        config,
        account,
        formattedOrderDetails,
        timestamp,
      );

      const response = await fetch(`${config.apiBaseUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${account.jwtToken}`,
        },
        body: JSON.stringify({
          ...formattedOrderDetails,
          signature,
          signature_timestamp: timestamp,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ParadexOrderError(
          `HTTP Error ${response.status}: ${errorText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error in placeOrderApi:", error);
      throw error instanceof ParadexOrderError
        ? error
        : new ParadexOrderError("Failed to place order", error);
    }
  }

  async getParadexConfig(): Promise<SystemConfig> {
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

  async getAccount(): Promise<Account> {
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

};

export const paradexPlaceOrderLimit = async (
  agent: StarknetAgentInterface,
  params: PlaceOrderLimitParams
) => {
  const service = new POService();
  try {

    const config = await service.getParadexConfig();

    // Initialize account
    const account = await service.getAccount();
    console.log("Account initialized");

    try {
      account.jwtToken = await authenticate(config, account);
    } catch (error) {
      console.error("Authentication failed:", error);
      throw new ParadexAuthenticationError(
        "Failed to authenticate with Paradex",
        error,
      );
    }
    console.info("Authentication successful");

    // Convert to order parameters with proper formatting
    const orderParams: PlaceOrderParams = {
      market: params.market,
      side:
        params.side.toLowerCase() === "long" || params.side.toLowerCase() === "buy"
          ? "BUY"
          : "SELL",
      type: "LIMIT",
      size: String(Number(params.size).toFixed(8)),
      instruction: "GTC",
      ...(params.price && { price: String(Number(params.size).toFixed(8)) }),
    };

    console.info("Placing order with params:", orderParams);

    // Place the order
    const result = await service.placeOrder(config, account, orderParams);
    console.log("Order placed successfully:", result);

    return true;
  } catch (error) {
    if (error instanceof ParadexOrderError) {
      console.error(
        "Order placement error:",
        error.details || error.message,
      );
    } else {
      console.error(
        "Unexpected error during order placement:",
        error,
      );
    }
    return false;
  }
}