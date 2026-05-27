import OpenAI from "openai";

export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "未找到 OPENAI_API_KEY 环境变量，请在 .env.local 文件中设置该变量"
    );
  }
  return new OpenAI({ apiKey });
}
