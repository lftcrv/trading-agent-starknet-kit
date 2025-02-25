import { ChatAnthropic } from '@langchain/anthropic';
import { createAllowedTools, createTools } from './tools/tools';
import { AiConfig } from './plugins/core/account/types/accounts.js';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOllama } from '@langchain/ollama';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { CheckpointMetadata, MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { createAllowedToollkits } from './tools/external_tools';
import { BaseMessage, SystemMessage } from '@langchain/core/messages';

export const createAutonomousAgent = (
  starknetAgent: StarknetAgentInterface,
  aiConfig: AiConfig
) => {
  const createModel = () => {
    switch (aiConfig.aiProvider) {
      case 'anthropic':
        if (!aiConfig.apiKey) {
          throw new Error(
            'Valid Anthropic api key is required https://docs.anthropic.com/en/api/admin-api/apikeys/get-api-key'
          );
        }
        return new ChatAnthropic({
          modelName: aiConfig.aiModel,
          anthropicApiKey: aiConfig.apiKey,
        });
      case 'openai':
        if (!aiConfig.apiKey) {
          throw new Error(
            'Valid OpenAI api key is required https://platform.openai.com/api-keys'
          );
        }
        return new ChatOpenAI({
          modelName: aiConfig.aiModel,
          openAIApiKey: aiConfig.apiKey,
        });
      case 'gemini':
        if (!aiConfig.apiKey) {
          throw new Error(
            'Valid Gemini api key is required https://ai.google.dev/gemini-api/docs/api-key'
          );
        }
        return new ChatGoogleGenerativeAI({
          modelName: aiConfig.aiModel,
          apiKey: aiConfig.apiKey,
          convertSystemMessageToHumanContent: true,
        });
      case 'ollama':
        return new ChatOllama({
          model: aiConfig.aiModel,
        });
      default:
        throw new Error(`Unsupported AI provider: ${aiConfig.aiProvider}`);
    }
  };

  const model = createModel();

  try {
    const json_config = starknetAgent.getAgentConfig();
    if (json_config) {
      const allowedTools = json_config.internal_plugins
        ? createAllowedTools(starknetAgent, json_config.internal_plugins)
        : createTools(starknetAgent);

      const allowedToolsKits = json_config.external_plugins
        ? createAllowedToollkits(json_config.external_plugins)
        : null;

      const tools = allowedToolsKits
        ? [...allowedTools, ...allowedToolsKits]
        : allowedTools;

      const memory = new MemorySaver();
      const agentConfig = {
        configurable: {
          thread_id: json_config.chat_id,
          checkpoint_ns: 'default',
          max_checkpoints: 6,
          max_tokens_per_request: 12000,
          max_messages: 6,
          recursionLimit: 50,
        },
      };

      const agent = createReactAgent({
        llm: model,
        tools: tools,
        checkpointSaver: memory,
        stateModifier: async (state) => {
          const sequences: BaseMessage[][] = [];
          let currentSequence: BaseMessage[] = [];

          for (let i = 0; i < state.messages.length; i++) {
            const current = state.messages[i];
            const next = state.messages[i + 1];

            console.log(
              `Content length: ${current.content?.toString().length}`
            );

            if (current.additional_kwargs?.stop_reason === 'tool_use') {
              // Début d'une nouvelle séquence d'outil
              if (currentSequence.length > 0) {
                sequences.push(currentSequence);
                currentSequence = [];
              }
              currentSequence.push(current);
              if (next) {
                currentSequence.push(next);
                i++; // Sauter le message suivant
              }
            } else if (currentSequence.length === 0) {
              // Message normal hors séquence d'outil
              currentSequence.push(current);
            }
          }

          // Ajouter la dernière séquence si elle existe
          if (currentSequence.length > 0) {
            sequences.push(currentSequence);
          }

          // Prendre les 2 dernières séquences complètes
          const recentSequences = sequences.slice(-2);
          const finalMessages = [
            new SystemMessage(json_config.prompt),
            ...recentSequences.flat(),
          ];

          return finalMessages;
        },
      });

      return { agent, agentConfig, json_config };
    }
  } catch (error) {
    console.error(
      `⚠️ Ensure your environment variables are set correctly according to your agent.character.json file.`
    );
    console.error('Failed to load or parse JSON config:', error);
  }
};
