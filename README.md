# AI 落地页生成器 (Landing Page Generator)

输入产品信息，AI 自动生成完整落地页——文案、配色、4 种布局骨架可选，支持实时预览、视口切换和 ZIP 导出。

🚀 在线体验：https://landing-generator-mu.vercel.app

---

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | Next.js 15 (App Router) |
| 前端 | React 19 + TypeScript + Tailwind CSS v4 |
| 状态管理 | Zustand v5 |
| 校验 | Zod v3 |
| AI SDK | OpenAI SDK（兼容 OpenAI / DeepSeek 等） |
| 导出 | JSZip |
| 图标 | Lucide React |
| 限流 | 自研内存限流器（generate 5/min，preview 20/min） |
| 部署 | Vercel（自动 CI/CD） |

---

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local：
#   - 用 OpenAI：只需填 OPENAI_API_KEY
#   - 用 DeepSeek：填 OPENAI_API_KEY + OPENAI_BASE_URL + OPENAI_MODEL

# 3. 启动
npm run dev

# 4. 打开 http://localhost:3000
```

### 环境变量

| 变量 | 必需 | 说明 |
|------|------|------|
| `OPENAI_API_KEY` | 是 | API Key（OpenAI 格式 `sk-...`，DeepSeek 格式 `sk-...`） |
| `OPENAI_BASE_URL` | 否 | 自定义 API 端点。DeepSeek 填 `https://api.deepseek.com/v1` |
| `OPENAI_MODEL` | 否 | 模型名称。默认 `gpt-4o`，DeepSeek 用 `deepseek-chat` |

---

## 功能

- 输入产品名称、描述、目标用户、卖点 → AI 生成完整落地页
- 4 种 Hero 布局骨架可选：左对齐 / 居中 / 分栏 / 极简
- 61 种设计风格可选（Stripe、Apple、Cursor、Claude、NVIDIA 等），AI 自动参考配色
- 修改建议输入框，输入反馈 AI 即时优化文案
- 实时预览 + 桌面/平板/手机三档视口切换
- 一键下载 ZIP（含 index.html，可直接部署）
- Rate Limiting 保护 API

---

## 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── generate/route.ts   # AI 生成端点 (POST, 5/min)
│   │   ├── preview/route.ts    # HTML 预览端点 (POST, 20/min)
│   │   └── refine/route.ts     # 文案优化端点 (POST, 5/min)
│   ├── layout.tsx              # 根布局
│   └── page.tsx                # 主页面（输入+预览+导出）
├── components/
│   ├── editor/
│   │   └── ExportButton.tsx    # ZIP 导出按钮
│   └── layouts/
│       ├── HeroSection.tsx     # Hero 区块（4 种布局变体）
│       ├── FeaturesSection.tsx # 功能亮点区块（3 列响应式）
│       ├── CTASection.tsx      # 行动号召区块
│       ├── FooterSection.tsx   # 页脚区块
│       └── LandingPage.tsx     # 完整落地页组合
├── designs/
│   ├── manifest.json           # 61 种设计风格索引
│   └── design-md/              # 各品牌设计规范（71 个目录）
├── lib/
│   ├── ai/
│   │   ├── client.ts           # AI 客户端工厂（支持自定义 baseURL）
│   │   └── service.ts          # AI 服务（文案+配色生成，自动重试）
│   ├── designs.ts              # 设计风格加载（颜色解析）
│   ├── rate-limit.ts           # 内存限流器
│   ├── types.ts                # 全局类型定义
│   └── schemas.ts              # Zod 校验 Schema
└── store/
    └── index.ts                # Zustand 全局状态
```

---

## API 端点

### POST /api/generate

生成落地页文案和配色。限流：5 次/分钟。

请求体：
```json
{
  "productName": "MyApp",
  "description": "一款高效的团队协作工具",
  "targetAudience": "初创团队",
  "sellingPoints": ["实时同步", "简单易用", "免费开始"],
  "skeleton": "hero-center",
  "temperature": 0.7
}
```

### POST /api/preview

生成完整 HTML 预览页面。限流：20 次/分钟。
请求体 `{ content, skeleton, colorScheme }`，返回 `{ html: "<!DOCTYPE html>..." }`

### POST /api/refine

根据用户反馈优化文案。限流：5 次/分钟。
请求体 `{ content, colorScheme, feedback }`，返回 `{ result: { content, ... } }`

---

## 部署

已部署于 Vercel，每次推送 `main` 分支自动部署。

自行部署：
1. Fork 仓库
2. 在 Vercel 导入
3. 设置环境变量（OPENAI_API_KEY 等）
4. 部署

---

## License

MIT
