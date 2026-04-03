/**
 * linters/hex-color-check.js
 * P-001: hex 색상에 # 접두사 절대 금지
 * P-002: 8자리 hex로 투명도 표현 절대 금지
 */

const fs = require('fs');

const VIOLATIONS = [
  {
    id: 'P-001',
    pattern: /color\s*:\s*["']#[0-9A-Fa-f]{6}["']/g,
    message: 'P-001: hex 색상에 # 접두사 금지. "#FF0000" → "FF0000"',
    severity: 'error',
  },
  {
    id: 'P-002',
    pattern: /color\s*:\s*["'][0-9A-Fa-f]{8}["']/g,
    message: 'P-002: 8자리 hex로 투명도 표현 금지. opacity 프로퍼티를 사용하십시오.',
    severity: 'error',
  },
  {
    id: 'P-007',
    pattern: /offset\s*:\s*-\d+/g,
    message: 'P-007: shadow offset은 반드시 0 이상이어야 합니다.',
    severity: 'error',
  },
];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations = [];

  for (const rule of VIOLATIONS) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('//')) continue;
      const matches = line.match(rule.pattern);
      if (matches) {
        violations.push({
          line: i + 1,
          code: rule.id,
          message: rule.message,
          severity: rule.severity,
          found: matches[0],
        });
      }
    }
  }

  return violations;
}

const args = process.argv.slice(2);
const targetFile = args[0];

if (!targetFile) {
  console.error('사용법: node hex-color-check.js <파일경로>');
  process.exit(1);
}

const violations = checkFile(targetFile);

if (violations.length === 0) {
  console.log('✅ P-001/P-002/P-007: hex 색상 검사 통과');
  process.exit(0);
} else {
  violations.forEach(v => {
    console.error(`[${v.code}][${v.severity.toUpperCase()}] ${targetFile}:${v.line}`);
    console.error(`  → ${v.message}`);
    console.error(`  발견: ${v.found}`);
  });
  console.error(`\n총 ${violations.length}건 위반 → CI 블로킹`);
  process.exit(1);
}
