'use client';

import { useState } from 'react';
import JSZip from 'jszip';
import type { LandingPageContent, LayoutSkeleton, ColorScheme } from '@/lib/types';

interface ExportButtonProps {
  content: LandingPageContent;
  skeleton: LayoutSkeleton;
  colorScheme: ColorScheme;
  productName: string;
}

export default function ExportButton({
  content,
  skeleton,
  colorScheme,
  productName,
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const disabled = loading || !content;

  const handleExport = async () => {
    if (disabled) return;

    setLoading(true);

    try {
      const previewRes = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, skeleton, colorScheme }),
      });

      const previewData = await previewRes.json();

      if (!previewRes.ok || previewData.error) {
        throw new Error(previewData.error ?? '预览生成失败');
      }

      const html = previewData.html;
      if (!html || typeof html !== 'string' || html.trim().length === 0) {
        throw new Error('预览 HTML 为空，请重试');
      }

      const zip = new JSZip();
      zip.file('index.html', html);
      const blob = await zip.generateAsync({ type: 'blob' });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${productName}-landing.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : '导出失败';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={disabled}
      className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? '打包中...' : '下载 ZIP'}
    </button>
  );
}
