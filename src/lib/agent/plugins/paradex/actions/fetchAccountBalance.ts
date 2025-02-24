import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { Account, SystemConfig } from '../interfaces/config';
import { authenticate } from '../utils/paradex-ts/api';
import {
  getAccount,
  getParadexConfig,
  ParadexAuthenticationError,
} from '../utils/utils';
import { ParadexBalanceError } from '../interfaces/errors';
import { BalanceResult, BalanceResponse } from '../interfaces/results';

export class BalanceService {
  private formatBalance(balance: BalanceResult): string {
    try {
      const size = parseFloat(balance.size).toFixed(2);
      return `${size} USDC`;
    } catch (error) {
      console.error(
        'Error formatting balance:',
        error,
        'Balance data:',
        balance
      );
      return 'Error formatting USDC balance';
    }
  }

  async fetchAccountBalance(
    config: SystemConfig,
    account: Account
  ): Promise<BalanceResponse> {
    try {
      if (!account.jwtToken) {
        throw new ParadexBalanceError('JWT token is missing');
      }

      const url = `${config.apiBaseUrl}/balance`;
      console.info('Fetching account balance from URL:', url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${account.jwtToken}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ParadexBalanceError(
          `Failed to fetch balance: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in fetchAccountBalance:', error);
      throw error instanceof ParadexBalanceError
        ? error
        : new ParadexBalanceError('Failed to fetch account balance', error);
    }
  }

  formatBalanceResponse(balances: BalanceResult[]): {
    text: string;
    balance: BalanceResult | null;
  } {
    if (!balances || balances.length === 0) {
      return {
        text: 'No balance information available.',
        balance: null,
      };
    }

    // We only expect USDC balance
    const usdcBalance = balances[0];
    return {
      text: `Account Balance: ${this.formatBalance(usdcBalance)}`,
      balance: usdcBalance,
    };
  }
}

// Main function to get account balance
export const paradexGetBalance = async (agent: StarknetAgentInterface) => {
  const service = new BalanceService();
  try {
    const config = await getParadexConfig();

    // Initialize account
    const account = await getAccount();

    try {
      account.jwtToken = await authenticate(config, account);
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new ParadexAuthenticationError(
        'Failed to authenticate with Paradex',
        error
      );
    }
    console.info('Authentication successful');

    // Fetch balance
    const balanceData = await service.fetchAccountBalance(config, account);

    // Format the response
    const formattedResponse = service.formatBalanceResponse(
      balanceData.results
    );
    console.log(formattedResponse.text);

    return {
      success: true,
      data: formattedResponse.balance,
      text: formattedResponse.text,
    };
  } catch (error) {
    if (error instanceof ParadexBalanceError) {
      console.error('Balance error:', error.details || error.message);
    } else {
      console.error('Unexpected error fetching balance:', error);
    }
    return {
      success: false,
      data: null,
      text: 'Failed to fetch account balance. Please try again later.',
    };
  }
};
