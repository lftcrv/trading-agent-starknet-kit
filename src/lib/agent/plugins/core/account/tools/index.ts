import { StarknetToolRegistry } from 'src/lib/agent/tools/tools';
import { wrapAccountCreationResponse } from '../utils/accountTools';

import { CreateBraavosAccount } from '../../../braavos/actions/createAccount';
import { CreateOZAccount } from '../../../openzeppelin/actions/createAccount';
import { CreateArgentAccount } from '../../../argent/actions/createAccount';
import { CreateOKXAccount } from '../../../okx/actions/createAccount';
import { DeployBraavosAccount } from '../../../braavos/actions/deployAccount';
import { DeployArgentAccount } from '../../../argent/actions/deployAccount';
import { DeployOKXAccount } from '../../../okx/actions/deployAccount';
import { DeployOZAccount } from '../../../openzeppelin/actions/deployAccount';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { accountDetailsSchema } from '../schema/index';

export const registerAccountTools = () => {
  StarknetToolRegistry.registerTool({
    name: 'create_new_braavos_account',
    description:
      'Create a new Braavos account and return the privateKey/publicKey/contractAddress',
    plugins: 'account',
    execute: async (agent: StarknetAgentInterface) => {
      const response = await CreateBraavosAccount();
      return wrapAccountCreationResponse(response);
    },
  });

  StarknetToolRegistry.registerTool({
    name: 'create_new_openzeppelin_account',
    description:
      'Create a new Open Zeppelin account and return the privateKey/publicKey/contractAddress',
    plugins: 'account',
    execute: async (agent: StarknetAgentInterface) => {
      const response = await CreateOZAccount();
      return wrapAccountCreationResponse(response);
    },
  });

  StarknetToolRegistry.registerTool({
    name: 'create_new_argent_account',
    description:
      'Creates a new Argent account and return the privateKey/publicKey/contractAddress',
    plugins: 'account',
    execute: async (agent: StarknetAgentInterface) => {
      const response = await CreateArgentAccount();
      return wrapAccountCreationResponse(response);
    },
  });

  StarknetToolRegistry.registerTool({
    name: 'create_new_okx_account',
    description:
      'Create a new OKX account and return the privateKey/publicKey/contractAddress',
    plugins: 'account',
    execute: async (agent: StarknetAgentInterface) => {
      const response = await CreateOKXAccount();
      return wrapAccountCreationResponse(response);
    },
  });

  StarknetToolRegistry.registerTool({
    name: 'deploy_existing_openzeppelin_account',
    description:
      'Deploy an existing Open Zeppelin Account return the privateKey/publicKey/contractAddress',
    plugins: 'account',
    schema: accountDetailsSchema,
    execute: DeployOZAccount,
  });

  StarknetToolRegistry.registerTool({
    name: 'deploy_existing_argent_account',
    description:
      'Deploy an existing Argent Account return the privateKey/publicKey/contractAddress',
    plugins: 'account',
    schema: accountDetailsSchema,
    execute: DeployArgentAccount,
  });

  StarknetToolRegistry.registerTool({
    name: 'deploy_existing_okx_account',
    description:
      'Deploy an existing OKX Account return the privateKey/publicKey/contractAddress',
    plugins: 'account',
    schema: accountDetailsSchema,
    execute: DeployOKXAccount,
  });

  StarknetToolRegistry.registerTool({
    name: 'deploy_existing_braavos_account',
    description:
      'Deploy an existing Braavos Account return the privateKey/publicKey/contractAddress',
    plugins: 'account',
    schema: accountDetailsSchema,
    execute: DeployBraavosAccount,
  });
};
