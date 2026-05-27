import OpenAI from "openai";
import type { UserInput, LandingPageContent, ColorScheme } from "../types";

export function copyPrompt(input: UserInput): string {
  return `你是一位资深的产品文案专家，请根据以下产品信息，为一个着陆页（Landing Page）生成各个区块的文案内容。

产品名称：${input.productName}
产品描述：${input.description}
目标受众：${input.targetAudience}
核心卖点：${input.sellingPoints.join("、")}

请生成以下四个区块的文案（输出 JSON 格式）：

1. hero（首屏）：
   - headline: 一个抓人眼球的主标题（不超过 30 字）
   - subheadline: 一个补充说明的副标题（不超过 50 字）
   - ctaText: 行动号召按钮文字（不超过 8 字）
   - backgroundStyle: 背景风格描述，如 "渐变"、"深色"、"简约"等

2. features（功能亮点）：
   - features: 数组，包含 3~4 个功能亮点，每个包含：
     - icon: 建议的图标名称（如 star、shield、zap、heart 等）
     - title: 功能标题（不超过 10 字）
     - description: 功能描述（不超过 30 字）

3. cta（行动号召）：
   - title: 行动号召区域的主标题（不超过 30 字）
   - description: 行动号召的补充说明（不超过 50 字）
   - buttonText: 按钮文字（不超过 8 字）

4. footer（页脚）：
   - companyName: 公司名称
   - links: 页脚链接数组，每个包含 label（链接名称）和 url（链接地址），提供 3~4 个常用链接

请确保文案风格符合产品的调性和目标受众的喜好，输出严格符合以下 JSON 格式：
{
  "hero": {
    "headline": "...",
    "subheadline": "...",
    "ctaText": "...",
    "backgroundStyle": "..."
  },
  "features": {
    "features": [
      { "icon": "...", "title": "...", "description": "..." }
    ]
  },
  "cta": {
    "title": "...",
    "description": "...",
    "buttonText": "..."
  },
  "footer": {
    "companyName": "...",
    "links": [
      { "label": "...", "url": "..." }
    ]
  }
}`;
}

export function themePrompt(input: UserInput): string {
  return `你是一位专业的 UI/UX 设计师，请根据以下产品信息，推荐一套适合着陆页（Landing Page）的配色方案。

产品名称：${input.productName}
产品描述：${input.description}
目标受众：${input.targetAudience}
核心卖点：${input.sellingPoints.join("、")}

请根据产品的行业属性、品牌调性和目标受众的偏好，选择一套协调的颜色搭配。每个颜色使用 6 位 hex 色值（如 #1A2B3C）。

输出严格符合以下 JSON 格式：
{
  "primary": "#XXXXXX",
  "secondary": "#XXXXXX",
  "background": "#XXXXXX",
  "text": "#XXXXXX",
  "accent": "#XXXXXX"
}

颜色使用指南：
- primary: 主色，用于按钮、标题等关键元素
- secondary: 辅助色，用于次要按钮、标签等
- background: 页面背景色
- text: 主文字颜色
- accent: 强调色，用于高亮、hover 状态等

请确保颜色之间有足够的对比度，整体配色协调美观。`;
}

export class AIService {
  private client: OpenAI;

  constructor(client: OpenAI) {
    this.client = client;
  }

  private async safeGenerate<T>(
    prompt: string,
    type: string
  ): Promise<T> {
    const attempt = async (): Promise<T> => {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const text = response.choices[0]?.message?.content;
      if (!text) {
        throw new Error("AI 未返回有效内容");
      }

      try {
        return JSON.parse(text) as T;
      } catch {
        throw new Error("AI 返回的 JSON 格式无法解析");
      }
    };

    // 首次尝试
    try {
      return await attempt();
    } catch (firstError) {
      console.warn(`首次生成${type}失败，正在重试...`, firstError);
      // 重试一次
      try {
        return await attempt();
      } catch (secondError) {
        const message =
          secondError instanceof Error ? secondError.message : "未知错误";
        throw new Error(`生成${type}失败（已重试）：${message}`);
      }
    }
  }

  async generateCopy(input: UserInput): Promise<LandingPageContent> {
    return this.safeGenerate<LandingPageContent>(
      copyPrompt(input),
      "文案"
    );
  }

  async generateColorScheme(input: UserInput): Promise<ColorScheme> {
    return this.safeGenerate<ColorScheme>(
      themePrompt(input),
      "配色方案"
    );
  }
}
