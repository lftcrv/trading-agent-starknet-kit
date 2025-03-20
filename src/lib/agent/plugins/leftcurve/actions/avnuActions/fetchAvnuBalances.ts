import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { RpcProvider, Contract } from 'starknet';
import * as dotenv from 'dotenv';
import { STARKNET_TOKENS } from '../../constants';
import { WalletParams } from '../../types';

dotenv.config();

/**
 * Service handling wallet operations on Starknet
 * @class WalletService
 */
export class WalletService {
  private RpcProvider;
  private ERC20_ABI;

  /**
   * Creates an instance of WalletService
   * Initializes RPC provider and sets up ERC20 ABI for token interactions
   */
  constructor() {
    this.RpcProvider = new RpcProvider({
      nodeUrl: process.env.STARKNET_RPC_URL,
    });

    this.ERC20_ABI = [
      {
        inputs: [{ name: 'account', type: 'felt' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'felt' }],
        stateMutability: 'view',
        type: 'function',
      },
    ];
  }

  /**
   * Fetches the balance of a specific token for a wallet address
   * @private
   * @param {string} tokenName - The name of the token
   * @param {string} tokenAddress - The contract address of the token
   * @param {string} wallet_address - The wallet address to check balance for
   * @returns {Promise<string>} Formatted string with token balance
   */
  private async getTokenBalance(
    tokenName: string,
    tokenAddress: string,
    wallet_address: string
  ): Promise<string> {
    try {
      const tokenInfo = STARKNET_TOKENS.find(
        (token) => token.name === tokenName
      );
      if (!tokenInfo) {
        throw new Error(`Token ${tokenName} not found in STARKNET_TOKENS`);
      }

      const contract = new Contract(
        this.ERC20_ABI,
        tokenAddress,
        this.RpcProvider
      );
      const balanceCall = await contract.call('balanceOf', [wallet_address]);

      const balanceInWei = BigInt((balanceCall as { balance: string }).balance);
      const balanceInToken =
        Number(balanceInWei) / Math.pow(10, tokenInfo.decimals);

      return `${tokenName}: ${balanceInToken} ${tokenName}`;
    } catch (error) {
      console.error(`Error fetching balance for ${tokenName}:`, error);
      return `Error for ${tokenName}`;
    }
  }

  /**
   * Retrieves balances for all configured tokens in STARKNET_TOKENS
   * @public
   * @param {string} wallet_address - The wallet address to check balances for
   * @returns {Promise<string>} Newline-separated string of all token balances
   */
  public async getAllBalances(wallet_address: string): Promise<string> {
    const balances = await Promise.all(
      STARKNET_TOKENS.map((token) =>
        this.getTokenBalance(token.name, token.address, wallet_address)
      )
    );
    return balances.join('\n');
  }
}

/**
 * Retrieves all token balances for a wallet using the agent
 * @param {StarknetAgentInterface} agent - The Starknet agent for blockchain interactions
 * @param {WalletParams} params - Parameters for the wallet operation
 * @returns {Promise<string>} Formatted string containing all wallet balances
 * @throws {Error} If there's an error fetching the balances
 */
export const getWalletBalances = async (
  agent: StarknetAgentInterface,
  params: WalletParams
): Promise<string> => {
  try {
    const accountAddress = agent.getAccountCredentials()?.accountPublicKey;
    const walletService = new WalletService();
    const balances = await walletService.getAllBalances(accountAddress);
    return 'Here are your wallet balances :\n' + balances;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
