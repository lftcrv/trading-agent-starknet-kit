import axios from 'axios';
import { Account, Provider, CallData, uint256 } from 'starknet';
import { ethers } from 'ethers';
import {
  LayerswapConstant,
  SwapInput,
  SwapResponse,
  DepositAction,
} from '../types';
import { GetSwapQuoteParams } from '../schema';

/**
 * Manages Layerswap API interactions for bridging assets
 */
export class LayerswapManager {
  private baseUrl: string;
  private apiKey: string;
  private starknetPrivateKey: string | null = null;
  private starknetAddress: string | null = null;
  private provider: Provider | null = null;

  /**
   * Creates a new Layerswap Manager
   *
   * @param {string} apiKey - Layerswap API key
   * @param {string} baseUrl - API base URL
   */
  constructor(
    apiKey: string,
    baseUrl: string = LayerswapConstant.DEFAULT_BASE_URL
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Sets the Starknet account details for transactions
   *
   * @param {string} privateKey - Starknet private key
   * @param {string} address - Starknet address
   * @returns {LayerswapManager} - Returns this instance for method chaining
   */
  setStarknetAccount(privateKey: string, address: string): LayerswapManager {
    this.starknetPrivateKey = privateKey;
    this.starknetAddress = address;
    return this;
  }

  /**
   * Gets the Starknet address
   *
   * @returns {string} - The Starknet address
   * @throws {Error} - If Starknet address is not set
   */
  getStarknetAddress(): string {
    if (!this.starknetAddress) {
      throw new Error(
        'Starknet address not set. Call setStarknetAccount first.'
      );
    }
    return this.starknetAddress;
  }

  /**
   * Gets the Starknet private key
   *
   * @returns {string} - The Starknet private key
   * @throws {Error} - If Starknet private key is not set
   */
  getStarknetPrivateKey(): string {
    if (!this.starknetPrivateKey) {
      throw new Error(
        'Starknet private key not set. Call setStarknetAccount first.'
      );
    }
    return this.starknetPrivateKey;
  }

  /**
   * Gets the Starknet Provider
   *
   * @returns {Provider} - Starknet Provider instance
   */
  getProvider(): Provider {
    if (!this.provider) {
      this.provider = new Provider({
        nodeUrl: 'https://alpha-mainnet.starknet.io',
      });
    }
    return this.provider;
  }

  /**
   * Creates a Starknet Account instance for transaction execution
   *
   * @returns {Account} - Starknet Account instance
   * @throws {Error} - If Starknet account details are not set
   */
  createAccount(): Account {
    const privateKey = this.getStarknetPrivateKey();
    const address = this.getStarknetAddress();
    const provider = this.getProvider();

    return new Account(provider, address, privateKey);
  }

  /**
   * Executes a transaction on the Starknet network
   *
   * @param {string} contractAddress - Contract address to interact with
   * @param {string} entrypoint - Contract function to call
   * @param {any} calldata - Arguments for the function call
   * @returns {Promise<any>} - Transaction result
   */
  async executeTransaction(
    contractAddress: string,
    entrypoint: string,
    calldata: any
  ): Promise<any> {
    const account = this.createAccount();

    return account.execute({
      contractAddress,
      entrypoint,
      calldata,
    });
  }

  /**
   * Checks if the bridge route is supported and gets limits
   *
   * @param {string} sourceNetwork - Source network identifier
   * @param {string} sourceToken - Token to bridge
   * @param {string} destinationNetwork - Destination network identifier
   * @param {string} destinationToken - Destination token
   * @param {boolean} refuel - Whether to add gas on destination
   * @returns {Promise<{min_amount: number, max_amount: number}>} Min and max limits
   */
  async getLimits(
    sourceNetwork: string,
    sourceToken: string,
    destinationNetwork: string,
    destinationToken: string,
    refuel: boolean = false
  ): Promise<{ min_amount: number; max_amount: number }> {
    try {
      const response = await axios.get(`${this.baseUrl}/limits`, {
        params: {
          source_network: sourceNetwork,
          source_token: sourceToken,
          destination_network: destinationNetwork,
          destination_token: destinationToken,
          use_deposit_address: true,
          refuel,
        },
        headers: {
          'X-LS-APIKEY': this.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting limits:', error);
      throw error;
    }
  }

  /**
   * Gets a quote for a swap
   *
   * @param {GetSwapQuoteParams} params - Quote parameters
   * @returns {Promise<{fee: number, destination_amount: number}>} Quote details
   */
  async getQuote(
    params: GetSwapQuoteParams & { source_address?: string }
  ): Promise<{ fee: number; destination_amount: number }> {
    try {
      const sourceAddress = params.source_address || this.getStarknetAddress();

      const response = await axios.get(`${this.baseUrl}/quote`, {
        params: {
          source_network: params.source_network,
          source_token: params.source_token,
          destination_network: params.destination_network,
          destination_token: params.destination_token,
          source_address: sourceAddress,
          amount: params.amount,
          refuel: params.refuel,
          use_deposit_address: true,
        },
        headers: {
          'X-LS-APIKEY': this.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting quote:', error);
      throw error;
    }
  }

  /**
   * Creates a new swap
   *
   * @param {SwapInput} swapInput - Swap creation parameters
   * @returns {Promise<SwapResponse>} Created swap details
   */
  async createSwap(swapInput: SwapInput): Promise<SwapResponse> {
    try {
      // Use the stored Starknet address if source_address isn't provided
      if (!swapInput.source_address && this.starknetAddress) {
        swapInput.source_address = this.starknetAddress;
      }

      const payload = {
        ...swapInput,
        use_deposit_address: swapInput.use_deposit_address !== false,
      };

      const response = await axios.post(`${this.baseUrl}/swaps`, payload, {
        headers: {
          'X-LS-APIKEY': this.apiKey,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating swap:', error);
      throw error;
    }
  }

  /**
   * Gets deposit actions for a swap
   *
   * @param {string} swapId - Swap identifier
   * @param {string} sourceAddress - Source address
   * @returns {Promise<DepositAction[]>} Deposit instructions
   */
  async getDepositActions(
    swapId: string,
    sourceAddress?: string
  ): Promise<DepositAction[]> {
    try {
      const address = sourceAddress || this.getStarknetAddress();

      const response = await axios.get(
        `${this.baseUrl}/swaps/${swapId}/deposit_actions`,
        {
          params: {
            source_address: address,
          },
          headers: {
            'X-LS-APIKEY': this.apiKey,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting deposit actions:', error);
      throw error;
    }
  }

  /**
   * Gets the status of a swap
   *
   * @param {string} swapId - Swap identifier
   * @returns {Promise<SwapResponse>} Current swap status
   */
  async getSwapStatus(swapId: string): Promise<SwapResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/swaps/${swapId}`, {
        headers: {
          'X-LS-APIKEY': this.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting swap status:', error);
      throw error;
    }
  }

  /**
   * Gets swaps by reference ID
   *
   * @param {string} referenceId - Reference identifier
   * @returns {Promise<SwapResponse[]>} Matching swaps
   */
  async getSwapsByReferenceId(referenceId: string): Promise<SwapResponse[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/swaps`, {
        params: {
          reference_id: referenceId,
        },
        headers: {
          'X-LS-APIKEY': this.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting swaps by reference ID:', error);
      throw error;
    }
  }

  /**
   * Executes an ETH transfer on Starknet
   *
   * @param {string} tokenAddress - ETH token contract address
   * @param {string} recipientAddress - Recipient address
   * @param {number} amount - Amount to transfer in ETH
   * @returns {Promise<any>} - Transaction result
   */
  async executeEthTransfer(
    tokenAddress: string,
    recipientAddress: string,
    amount: number
  ): Promise<any> {
    // Convert to wei (multiply by 10^18)
    const amountInWei = ethers.parseEther(amount.toString());
    const { low, high } = uint256.bnToUint256(amountInWei.toString());

    // Compile calldata using CallData.compile()
    const calldata = CallData.compile({
      recipient: recipientAddress,
      amount: [low, high],
    });

    // Execute the transaction
    return this.executeTransaction(tokenAddress, 'transfer', calldata);
  }
}
