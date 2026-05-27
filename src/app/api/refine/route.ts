import { NextResponse } from "next/server";
import { z } from "zod";
import { AIService } from "@/lib/ai/service";
import { getOpenAIClient } from "@/lib/ai/client";
import { rateLimit } from "@/lib/rate-limit";
import { getDesignColors } from "@/lib/designs";
import type { GenerationResult, ColorScheme } from "@/lib/types";

const refineSchema = z.object({
  content: z.record(z.unknown()),
  colorScheme: z.record(z.string()),
  feedback: z.string().min(2, "修改建议至少需要 2 个字符"),
  styleId: z.string().optional(),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const rl = rateLimit(ip, { limit: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "请求过于频繁，请稍后再试" },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = refineSchema.safeParse(body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message);
      return NextResponse.json(
        { result: { status: "error" as const, error: messages.join("；") } satisfies GenerationResult },
        { status: 400 }
      );
    }

    const { content, feedback, styleId } = parsed.data;

    const client = getOpenAIClient();
    const service = new AIService(client);

    const refined = await service.generateRefined(content as never, feedback);

    const result: GenerationResult = {
      status: "done",
      content: refined,
    };

    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "服务器内部错误";
    const result: GenerationResult = { status: "error", error: message };
    return NextResponse.json({ result }, { status: 500 });
  }
}
