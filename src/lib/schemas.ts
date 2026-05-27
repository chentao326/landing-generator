// Zod validation schemas

import { z } from "zod";

export const userInputSchema = z.object({
  productName: z
    .string()
    .min(2, "产品名称至少需要 2 个字符")
    .max(50, "产品名称不能超过 50 个字符"),
  description: z
    .string()
    .min(10, "产品描述至少需要 10 个字符")
    .max(1000, "产品描述不能超过 1000 个字符"),
  targetAudience: z
    .string()
    .min(1, "目标受众不能为空"),
  sellingPoints: z
    .array(
      z
        .string()
        .min(2, "卖点至少需要 2 个字符")
        .max(30, "每个卖点不能超过 30 个字符")
    )
    .min(1, "至少需要 1 个卖点")
    .max(5, "最多只能有 5 个卖点"),
});

export const generationInputSchema = userInputSchema.extend({
  skeleton: z.enum([
    "hero-left",
    "hero-center",
    "hero-split",
    "hero-minimal",
  ]),
  temperature: z
    .number()
    .min(0, "温度不能小于 0")
    .max(2, "温度不能大于 2")
    .optional(),
});

export const colorSchemeSchema = z.object({
  primary: z.string().regex(/^#[0-9a-fA-F]{6}$/, "颜色格式无效，需要 6 位 hex 值"),
  secondary: z.string().regex(/^#[0-9a-fA-F]{6}$/, "颜色格式无效，需要 6 位 hex 值"),
  background: z.string().regex(/^#[0-9a-fA-F]{6}$/, "颜色格式无效，需要 6 位 hex 值"),
  text: z.string().regex(/^#[0-9a-fA-F]{6}$/, "颜色格式无效，需要 6 位 hex 值"),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/, "颜色格式无效，需要 6 位 hex 值"),
});
