export interface ScenePromptClient {
  generate(prompt: string): Promise<string>;
}
