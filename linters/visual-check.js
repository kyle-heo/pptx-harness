/**
 * linters/visual-check.js
 * P-009: 텍스트 전용 슬라이드 감지 (시각 요소 없는 슬라이드)
 * P-010: Content QA 미실행 감지 (markitdown 실행 여부)
 */

const fs = require('fs');
const { execSync } = require('child_process');

// P-009: 슬라이드별 시각 요소 존재 여부 분석
function checkVisualElements(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const violations = [];

  // 슬라이드 블록 분리 (addSlide 기준)
  const slideBlocks = content.split(/(?=(?:const|let|var)\s+s\w+\s*=\s*pres\.addSlide\(\))/);

  slideBlocks.forEach((block, idx) => {
    if (!block.includes('addSlide')) return;

    const slideNum = idx;
    const hasVisual =
      block.includes('addImage') ||
      block.includes('addShape') ||
      block.includes('addChart') ||
      block.includes('addTable') ||
      /addShape\s*\(\s*pres\.shapes\.(RECTANGLE|OVAL|LINE|ROUNDED_RECTANGLE)/.test(block);

    const hasOnlyText = block.includes('addText') && !hasVisual;

    if (hasOnlyText) {
      violations.push({
        code: 'P-009',
        severity: 'error',
        message: `P-009: 슬라이드 블록 ${slideNum}에 시각 요소가 없습니다. addImage/addShape/addChart 중 하나 이상 추가하십시오.`,
        block: block.substring(0, 100),
      });
    }
  });

  return violations;
}

// P-010: pptx 파일 대상 markitdown 실행 및 placeholder 감지
function checkContentQA(pptxPath) {
  if (!pptxPath || !fs.existsSync(pptxPath)) {
    return [{
      code: 'P-010',
      severity: 'warn',
      message: 'P-010: PPTX 파일 경로가 제공되지 않았습니다. markitdown QA를 수동으로 실행하십시오.',
    }];
  }

  try {
    const output = execSync(
      `python -m markitdown "${pptxPath}" 2>/dev/null`,
      { encoding: 'utf-8', timeout: 30000 }
    );

    const placeholderPattern = /\bx{3,}\b|lorem|ipsum|\bTODO\b|\[insert|\bFIXME\b/gi;
    const matches = output.match(placeholderPattern);

    if (matches) {
      return [{
        code: 'P-010',
        severity: 'error',
        message: `P-010: placeholder 텍스트 잔류 감지: ${matches.slice(0, 3).join(', ')}. 수정 후 재생성하십시오.`,
      }];
    }

    return [];
  } catch (err) {
    return [{
      code: 'P-010',
      severity: 'warn',
      message: `P-010: markitdown 실행 실패. 수동으로 Content QA를 실행하십시오. (${err.message})`,
    }];
  }
}

const args = process.argv.slice(2);
const targetFile = args[0];
const pptxPath = args[1]; // 선택적

if (!targetFile) {
  console.error('사용법: node visual-check.js <생성스크립트.js> [output.pptx]');
  process.exit(1);
}

const codeViolations = checkVisualElements(targetFile);
const qaViolations = pptxPath ? checkContentQA(pptxPath) : [];
const allViolations = [...codeViolations, ...qaViolations];
let errorCount = 0;

if (allViolations.length === 0) {
  console.log('✅ P-009/P-010: 시각 요소 및 콘텐츠 검사 통과');
  process.exit(0);
} else {
  allViolations.forEach(v => {
    if (v.severity === 'error') errorCount++;
    const level = v.severity === 'error' ? 'ERROR' : 'WARN';
    console[v.severity === 'error' ? 'error' : 'warn'](
      `[${v.code}][${level}] ${v.message}`
    );
  });
  console.log(`\n총 ${allViolations.length}건 (에러: ${errorCount}건)`);
  if (errorCount > 0) process.exit(1);
}
