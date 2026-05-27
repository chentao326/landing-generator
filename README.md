# AI 落地页生成器 (Landing Page Generator)

输入产品信息，AI 自动生成完整落地页——文案、配色、4 种布局骨架可选，支持实时预览和 ZIP 导出。

---

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | Next.js 15 (App Router) |
| 前端 | React 19 + TypeScript + Tailwind CSS v4 |
| 状态管理 | Zustand v5 |
| 校验 | Zod v3 |
| AI | OpenAI SDK (GPT-4o) |
| 导出 | JSZip |
| 图标 | Lucide React |

---

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入你的 OPENAI_API_KEY

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器
open http://localhost:3000
```

---

## 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── generate/route.ts   # AI 生成端点 (POST)
│   │   └── preview/route.ts    # HTML 预览生成端点 (POST)
│   ├── layout.tsx              # 根布局
│   └── page.tsx                # 主页面（输入+预览+导出）
├── components/
│   ├── editor/
│   │   └── ExportButton.tsx    # ZIP 导出按钮
│   └── layouts/
│       ├── HeroSection.tsx     # Hero 区块（4 种布局）
│       ├── FeaturesSection.tsx # 功能亮点区块
│       ├── CTASection.tsx      # 行动号召区块
│       ├── FooterSection.tsx   # 页脚区块
│       └── LandingPage.tsx     # 完整落地页组合
├── lib/
│   ├── ai/
│   │   ├── client.ts           # OpenAI 客户端工厂
│   │   └── service.ts          # AI 服务（文案+配色生成）
│   ├── types.ts                # 全局类型定义
│   └── schemas.ts              # Zod 校验 Schema
└── store/
    └── index.ts                # Zustand 全局状态
```

---

## API 端点

### POST /api/generate

生成落地页文案和配色。

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

响应：
```json
{
  "result": {
    "status": "done",
    "content": { "hero": {...}, "features": {...}, "cta": {...}, "footer": {...} },
    "colorScheme": { "primary": "#3B82F6", ... }
  }
}
```

### POST /api/preview

生成完整 HTML 预览。

请求体：`{ content, skeleton, colorScheme }`

响应：`{ html: "<!DOCTYPE html>..." }`

---

## 部署

推荐部署到 Vercel（免费套餐）：

1. 将项目推送到 GitHub
2. 在 Vercel 中导入仓库
3. 设置环境变量 `OPENAI_API_KEY`
4. 部署

---

## License

MIT
