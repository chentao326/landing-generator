import { NextResponse } from "next/server";
import { generationInputSchema } from "@/lib/schemas";
import { AIService } from "@/lib/ai/service";
import { getOpenAIClient } from "@/lib/ai/client";
import { rateLimit } from "@/lib/rate-limit";
import { getDesignColors } from "@/lib/designs";
import type {
  GenerateResponse,
  GenerationResult,
  UserInput,
} from "@/lib/types";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const rl = rateLimit(ip, { limit: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "请求过于频繁，请稍后再试" },
      { status: 429, headers: { "X-RateLimit-Remaining": "0", "X-RateLimit-Reset": String(rl.reset) } }
    );
  }

  try {
    const body: unknown = await request.json();

    const parsed = generationInputSchema.safeParse(body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message);
      return NextResponse.json(
        { result: { status: "error" as const, error: messages.join("；") } satisfies GenerationResult },
        { status: 400 }
      );
    }

    const { productName, description, targetAudience, sellingPoints } =
      parsed.data;
    const userInput: UserInput = {
      productName,
      description,
      targetAudience,
      sellingPoints,
    };

    // Load style colors if a design style is selected
    const styleId = (body as Record<string, unknown>).styleId as string | undefined;
    const styleColors = styleId ? getDesignColors(styleId) : undefined;

    const client = getOpenAIClient();
    const service = new AIService(client);

    const [content, colorScheme] = await Promise.all([
      service.generateCopy(userInput),
      service.generateColorScheme(userInput, styleColors),
    ]);

    const result: GenerationResult = {
      status: "done",
      content,
      colorScheme,
    };

    const response: GenerateResponse = { result };

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "服务器内部错误";
    const result: GenerationResult = {
      status: "error",
      error: message,
    };
    return NextResponse.json({ result }, { status: 500 });
  }
}
