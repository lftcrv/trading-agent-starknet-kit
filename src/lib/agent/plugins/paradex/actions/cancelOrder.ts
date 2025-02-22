import { StarknetAgentInterface } from "src/lib/agent/tools/tools";
import { CancelParams } from "../types";

export const cancelOrder = async (
  agent: StarknetAgentInterface,
  params: CancelParams
): Promise<boolean> => {
  console.log(`Calling cancelOrder with param:\norderId : ${params.orderId}`);
  return true;
};