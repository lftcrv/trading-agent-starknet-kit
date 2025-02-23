import { z } from 'zod';
export const Transferschema = z.object({
  recipient_address: z.string().describe('The recipient public address'),
  amount: z.string().describe('The amount'),
  symbol: z.string().describe('The symbol of the erc20 token'),
});

export const transferSignatureschema = z.object({
  payloads: z
    .array(Transferschema)
    .describe('Array of payloads for a tranfer transaction'),
});

export const DeployArgentAccountSignatureSchema = z.object({
  publicKeyAX: z
    .string()
    .describe('The public key to deploy the Argent Account'),
  privateKeyAX: z
    .string()
    .describe('The private key to deploy the Argent Account'),
});

export const getBalanceSignatureSchema = z.object({
  accountAddress: z.string().describe('the account address'),
  assetSymbol: z.string().describe('token Symbol'),
});

export const getBalanceSchema = z.object({});

export const getBBOSchema = z.object({
  markets: z
    .array(z.string())
    .min(1)
    .describe(
      'Array of market symbols to fetch BBO data for, e.g., ["BTC-USD-PERP", "ETH-USD-PERP"]'
    ),
});
