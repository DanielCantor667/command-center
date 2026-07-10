import Anthropic from '@anthropic-ai/sdk';
import type { ScenePromptClient } from './scene-prompt-client';

export class AnthropicSceneClient implements ScenePromptClient {
  private readonly client: Anthropic;

  constructor(apiKey: string = process.env.ANTHROPIC_API_KEY ?? '') {
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }
    this.client = new Anthropic({ apiKey });
  }

  async generate(prompt: string): Promise<string> {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const [block] = response.content;
    if (!block || block.type !== 'text') {
      throw new Error('unexpected response from Anthropic API');
    }

    return block.text;
  }
}
