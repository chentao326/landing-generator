'use client';

import { useState } from 'react';
import { useLandingStore } from '@/store';
import { userInputSchema } from '@/lib/schemas';
import type { LayoutSkeleton, GenerateResponse, DesignStyle } from '@/lib/types';
import ExportButton from '@/components/editor/ExportButton';
import styles from '@/designs/manifest.json';

// --------------------------------------------------------------- Skeleton options

interface SkeletonOption {
  value: LayoutSkeleton;
  label: string;
  desc: string;
}

const SKELETON_OPTIONS: SkeletonOption[] = [
  { value: 'hero-left', label: '左对齐', desc: 'Hero 内容左对齐' },
  { value: 'hero-center', label: '居中', desc: 'Hero 内容居中' },
  { value: 'hero-split', label: '分栏', desc: '左右分栏布局' },
  { value: 'hero-minimal', label: '极简', desc: '极简风格' },
];

// --------------------------------------------------------------- Viewport options

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const VIEWPORT_CONFIG: { value: ViewportSize; label: string; width: number }[] = [
  { value: 'desktop', label: '桌面', width: 1440 },
  { value: 'tablet', label: '平板', width: 768 },
  { value: 'mobile', label: '手机', width: 375 },
];

// --------------------------------------------------------------- Home Page

export default function Home() {
  const {
    userInput,
    selectedSkeleton,
    temperature,
    generationResult,
    setUserInput,
    setSkeleton,
    setGenerationResult,
  } = useLandingStore();

  const [generating, setGenerating] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [viewport, setViewport] = useState<ViewportSize>('desktop');

  const [previewError, setPreviewError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [refineFeedback, setRefineFeedback] = useState('');
  const [refining, setRefining] = useState(false);

  // ---- sellingPoints helpers

  const addSellingPoint = () => {
    if (userInput.sellingPoints.length >= 5) return;
    setUserInput({ sellingPoints: [...userInput.sellingPoints, ''] });
  };

  const removeSellingPoint = (index: number) => {
    if (userInput.sellingPoints.length <= 1) return;
    setUserInput({
      sellingPoints: userInput.sellingPoints.filter((_, i) => i !== index),
    });
  };

  const updateSellingPoint = (index: number, value: string) => {
    const updated = [...userInput.sellingPoints];
    updated[index] = value;
    setUserInput({ sellingPoints: updated });
  };

  // ---- generate handler

  const handleGenerate = async () => {
    // Validate
    const validation = userInputSchema.safeParse(userInput);
    if (!validation.success) {
      const messages = validation.error.errors.map((e) => e.message);
      alert(messages.join('\n'));
      return;
    }

    if (!selectedSkeleton) {
      alert('请选择一种布局骨架');
      return;
    }

    const currentSkeleton = selectedSkeleton;

    // Start
    setPreviewError(null);    setGenerating(true);
    setGenerationResult({ status: 'generating_copy' });

    try {
      const body = {
        productName: userInput.productName,
        description: userInput.description,
        targetAudience: userInput.targetAudience,
        sellingPoints: userInput.sellingPoints,
        skeleton: currentSkeleton,
        temperature,
        ...(selectedStyle ? { styleId: selectedStyle } : {}),
      };

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data: GenerateResponse = await res.json();

      if (!res.ok || data.result.error) {
        throw new Error(data.result.error ?? '生成失败');
      }

      const { content, colorScheme } = data.result;
      setGenerationResult({ content, colorScheme, status: 'done' });

      // Fetch preview HTML from /api/preview
      try {
        const previewBody = {
          content,
          skeleton: currentSkeleton,
          colorScheme,
        };

        const previewRes = await fetch('/api/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(previewBody),
        });

        const previewData = await previewRes.json();

        if (previewData.html) {
          setPreviewHtml(previewData.html);
        } else {
          setPreviewError(previewData.error || '预览生成失败');
        }
      } catch (previewErr) {
        setPreviewError('预览请求失败，请检查网络连接');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误';
      alert(message);
      setGenerationResult({ status: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  // ---- refine handler

  const handleRefine = async () => {
    if (!refineFeedback.trim() || !generationResult?.content || !generationResult?.colorScheme) return;

    setRefining(true);
    setPreviewError(null);

    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: generationResult.content,
          colorScheme: generationResult.colorScheme,
          feedback: refineFeedback,
          ...(selectedStyle ? { styleId: selectedStyle } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.result.error) {
        throw new Error(data.result.error ?? '优化失败');
      }

      const { content } = data.result;
      setGenerationResult({ content, status: 'done' });
      setRefineFeedback('');

      // Regenerate preview
      const previewRes = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, skeleton: selectedSkeleton!, colorScheme: generationResult.colorScheme! }),
      });
      const previewData = await previewRes.json();
      if (previewData.html) {
        setPreviewHtml(previewData.html);
        setPreviewError(null);
      }
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : '优化失败');
    } finally {
      setRefining(false);
    }
  };

  // ---- derived

  const buttonLabel = generating ? '生成中...' : '生成落地页';
  const selectedWidth = VIEWPORT_CONFIG.find((v) => v.value === viewport)?.width ?? 1440;

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      {/* ====================== 左侧：输入面板 ====================== */}
      <aside className="w-full shrink-0 border-b border-gray-200 bg-gray-50 p-6 lg:w-96 lg:border-b-0 lg:border-r lg:overflow-y-auto">
        <h2 className="mb-6 text-xl font-bold text-gray-800">产品信息</h2>

        {/* 产品名称 */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            产品名称
          </label>
          <input
            type="text"
            value={userInput.productName}
            onChange={(e) => setUserInput({ productName: e.target.value })}
            placeholder="你的产品名称"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* 产品描述 */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            产品描述
          </label>
          <textarea
            value={userInput.description}
            onChange={(e) => setUserInput({ description: e.target.value })}
            placeholder="简要描述你的产品..."
            rows={6}
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* 目标用户 */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            目标用户
          </label>
          <input
            type="text"
            value={userInput.targetAudience}
            onChange={(e) => setUserInput({ targetAudience: e.target.value })}
            placeholder="例如：初创企业、独立开发者"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* 设计风格 */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            设计风格
          </label>
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="">AI 自动匹配</option>
            {(styles as DesignStyle[]).map((s) => (
              <option key={s.id} value={s.id}>{s.name} — {s.desc}</option>
            ))}
          </select>
        </div>

        {/* 卖点列表 */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            卖点
          </label>
          <div className="space-y-2">
            {userInput.sellingPoints.map((point, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={point}
                  onChange={(e) => updateSellingPoint(i, e.target.value)}
                  placeholder={`卖点 ${i + 1}`}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {userInput.sellingPoints.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSellingPoint(i)}
                    className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    aria-label="删除卖点"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          {userInput.sellingPoints.length < 5 && (
            <button
              type="button"
              onClick={addSellingPoint}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
            >
              + 添加卖点
            </button>
          )}
        </div>

        {/* 布局骨架选择器 */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            布局骨架
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SKELETON_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSkeleton(opt.value)}
                className={`rounded-lg border-2 p-3 text-left transition ${
                  selectedSkeleton === opt.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-medium text-gray-800">
                  {opt.label}
                </div>
                <div className="mt-0.5 text-xs text-gray-500">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 生成按钮 */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {buttonLabel}
        </button>
      </aside>

      {/* ====================== 右侧：预览区域 ====================== */}
      <section className="flex flex-1 flex-col overflow-hidden">
        {/* 视口切换栏 */}
        {previewHtml && generationResult?.content && generationResult?.colorScheme && selectedSkeleton && (
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2">
            <div className="flex-1" />
            <div className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5">
              {VIEWPORT_CONFIG.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => setViewport(v.value)}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                    viewport === v.value
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {v.label}
                  <span className="ml-1 text-xs opacity-70">{v.width}px</span>
                </button>
              ))}
            </div>
            <div className="flex flex-1 justify-end">
              <ExportButton
                content={generationResult.content}
                skeleton={selectedSkeleton}
                colorScheme={generationResult.colorScheme}
                productName={userInput.productName}
              />
            </div>
          </div>
        )}

        {/* 修改建议栏 */}
        {previewHtml && (
          <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-2">
            <input
              type="text"
              value={refineFeedback}
              onChange={(e) => setRefineFeedback(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
              placeholder="输入修改建议，如「标题再大一点」「配色暖一点」..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={refining}
            />
            <button
              type="button"
              onClick={handleRefine}
              disabled={refining || !refineFeedback.trim()}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {refining ? '优化中...' : '优化'}
            </button>
          </div>
        )}

        {/* iframe 预览 / 空状态 */}
        <div className="flex-1 overflow-auto bg-gray-100">
          {previewError ? (
            <div className="mx-4 mt-4 flex items-center justify-between rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">{previewError}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewError(null)}
                className="ml-4 shrink-0 rounded-md p-1 hover:bg-red-100 transition"
                aria-label="关闭错误提示"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : previewHtml ? (
            <div className="h-full w-full overflow-auto p-4">
              <iframe
                srcDoc={previewHtml}
                style={{ width: '100%', maxWidth: selectedWidth, height: '100%', minHeight: '80vh' }}
                className="border-0 bg-white shadow-lg transition-all duration-300"
                title="落地页预览"
              />
            </div>
          ) : (
            <div className="flex min-h-full flex-col items-center justify-center p-8 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mb-4 h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-lg">填写产品信息并点击生成，预览落地页</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
