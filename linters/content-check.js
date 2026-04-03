/**
 * linters/content-check.js
 * P-003: 유니코드 불릿 금지
 * P-004: breakLine 누락 감지
 * P-005: option 객체 재사용 패턴 감지
 * P-006: ROUNDED_RECTANGLE + accent 조합 감지
 * P-008: 타이틀 하단 accent 라인 패턴 감지
 */

const fs = require('fs');

const RULES = [
  {
    id: 'P-003',
    pattern: /addText\s*\(\s*["'][^"']*[•·‣▸▪▫◦⁃].*["']/g,
    message: 'P-003: 유니코드 불릿 기호 금지. bullet: true 옵션을 사용하십시오.',
    severity: 'error',
  },
  {
    id: 'P-005',
    // const shadow = { ... } 를 정의 후 재사용하는 패턴 감지
    // 팩토리 함수(makeShadow = () =>)는 허용
    pattern: /const\s+\w*[Ss]hadow\s*=\s*\{[^}]+\}/g,
    check: (match, content) => {
      // 변수명 추출
      const varName = match.match(/const\s+(\w+)/)?.[1];
      if (!varName) return false;
      // 해당 변수가 두 곳 이상에서 { shadow: varName } 형태로 쓰이면 위반
      const usages = (content.match(new RegExp(`\\b${varName}\\b`, 'g')) || []).length;
      return usages > 2; // 선언 + 2번 이상 사용
    },
    message: 'P-005: shadow/fill 옵션 객체 재사용 금지. const makeShadow = () => ({...}) 팩토리 패턴을 사용하십시오.',
    severity: 'warn',
  },
  {
    id: 'P-006',
    pattern: /ROUNDED_RECTANGLE/g,
    check: (match, content, lineIndex, lines) => {
      // 같은 파일에 ROUNDED_RECTANGLE과 accent용 RECTANGLE이 연속으로 있는지 확인
      const contextWindow = lines.slice(Math.max(0, lineIndex - 3), lineIndex + 5).join('\n');
      return /ROUNDED_RECTANGLE/.test(contextWindow) &&
             /RECTANGLE/.test(contextWindow) &&
             /accent|border|left.*bar|side.*bar/i.test(contextWindow);
    },
    message: 'P-006: ROUNDED_RECTANGLE + 직선 accent 조합 금지. RECTANGLE을 사용하십시오.',
    severity: 'warn',
  },
  {
    id: 'P-008',
    // 타이틀 다음에 라인/하선 추가하는 패턴
    pattern: /addShape\s*\(\s*pres\.shapes\.LINE/g,
    check: (match, content, lineIndex, lines) => {
      // 타이틀 addText 바로 다음 라인에 LINE이 있는지 확인
      const prevLines = lines.slice(Math.max(0, lineIndex - 5), lineIndex).join('\n');
      return /title|Title|제목|header|Header/i.test(prevLines);
    },
    message: 'P-008: 타이틀 하단 accent 라인 금지 (AI 생성 슬라이드 패턴). 여백 또는 배경색으로 구분하십시오.',
    severity: 'error',
  },
];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations = [];

  for (const rule of RULES) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('//')) continue;

      const matches = line.match(rule.pattern);
      if (!matches) continue;

      // 추가 조건 검사가 있는 경우
      if (rule.check) {
        const shouldFlag = rule.check(matches[0], content, i, lines);
        if (!shouldFlag) continue;
      }

      violations.push({
        line: i + 1,
        code: rule.id,
        message: rule.message,
        severity: rule.severity,
      });
    }
  }

  return violations;
}

const args = process.argv.slice(2);
const targetFile = args[0];

if (!targetFile) {
  console.error('사용법: node content-check.js <파일경로>');
  process.exit(1);
}

const violations = checkFile(targetFile);
let errorCount = 0;

if (violations.length === 0) {
  console.log('✅ P-003/P-005/P-006/P-008: 콘텐츠 패턴 검사 통과');
  process.exit(0);
} else {
  violations.forEach(v => {
    if (v.severity === 'error') errorCount++;
    const level = v.severity === 'error' ? 'ERROR' : 'WARN';
    console[v.severity === 'error' ? 'error' : 'warn'](
      `[${v.code}][${level}] ${targetFile}:${v.line} - ${v.message}`
    );
  });
  console.log(`\n총 ${violations.length}건 (에러: ${errorCount}건)`);
  if (errorCount > 0) process.exit(1);
}
