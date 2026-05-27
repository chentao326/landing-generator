import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface DesignStyle {
  id: string;
  name: string;
  desc: string;
  category: string;
}

const MANIFEST_PATH = join(process.cwd(), 'src/designs/manifest.json');
const DESIGNS_DIR = join(process.cwd(), 'src/designs/design-md');

let _manifest: DesignStyle[] | null = null;

export function getDesignStyles(): DesignStyle[] {
  if (!_manifest) {
    const raw = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));
    _manifest = raw as DesignStyle[];
  }
  return _manifest!;
}

export function getDesignColors(styleId: string): Record<string, string> {
  const designPath = join(DESIGNS_DIR, styleId, 'DESIGN.md');
  if (!existsSync(designPath)) return {};

  const content = readFileSync(designPath, 'utf-8');

  // Parse YAML-like color section: "  primary: \"#533afd\""
  const colors: Record<string, string> = {};
  const lines = content.split('\n');
  let inColors = false;

  for (const line of lines) {
    if (line.startsWith('colors:')) { inColors = true; continue; }
    if (inColors && line.match(/^[a-z]/)) { inColors = false; continue; }
    if (!inColors) continue;

    const match = line.match(/^\s+([a-z][a-z0-9_-]*):\s*"?(#[0-9a-fA-F]{3,8})"?/);
    if (match) {
      colors[match[1]] = match[2];
    }
  }

  return colors;
}
