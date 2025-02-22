import { StarknetToolRegistry } from 'src/lib/agent/tools/tools';
import { avnuAnalysisSchema } from '../schema';
import { getAvnuLatestAnalysis } from '../actions/fetchAvnuLatestAnalysis';

export const registerLftcrvTools = () => {
  StarknetToolRegistry.registerTool({
    name: 'get_avnu_latest_analysis',
    plugins: 'lftcrv',
    description: 'Get the latest market analysis. Use it to deicde what is the best swap to do.',
    schema: avnuAnalysisSchema,
    execute: getAvnuLatestAnalysis,
  });
};