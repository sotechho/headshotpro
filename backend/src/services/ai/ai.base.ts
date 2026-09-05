interface IAIBase {
  generateImage(_imgUrl: string, prompt: string): Promise<string>;
}

export abstract class BaseAI implements IAIBase {
  abstract generateImage(_imgUrl: string, prompt: string): Promise<string>;
}
