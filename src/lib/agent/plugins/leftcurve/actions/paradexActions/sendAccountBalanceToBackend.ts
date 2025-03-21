import { StarknetAgentInterface } from "src/lib/agent/tools/tools";
import { BalanceService } from "../../../paradex/actions/fetchAccountBalance";
import { getParadexConfig } from "../../utils/getParadexConfig";
import { getAccount, ParadexAuthenticationError } from "../../../paradex/utils/utils";
import { authenticate } from "../../../paradex/utils/paradex-ts/api";
import { ParadexBalanceError } from "../../../paradex/interfaces/errors";
import { sendAccountBalanceData } from "../../utils/sendAccountBalanceData";
import { getContainerId } from "../../utils/getContainerId";

export const sendParadexBalance = async (agent: StarknetAgentInterface) => {
  console.info('Calling sendParadexBalance');
  console.log('Calling sendParadexBalance');
  const service = new BalanceService();
  try {
    const config = await getParadexConfig();

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

    const balanceData = await service.fetchAccountBalance(config, account);

    const formattedResponse = service.formatBalanceResponse(
      balanceData.results
    );
    console.log(formattedResponse.text);

    const accountBalanceDto = {
      runtimeAgentId: getContainerId(),
      balanceInUSD: formattedResponse.balance?.size,
    };
    console.info('accountBalanceDto', accountBalanceDto);
    console.log('accountBalanceDto', accountBalanceDto);
    await sendAccountBalanceData(accountBalanceDto);
    return true;

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
