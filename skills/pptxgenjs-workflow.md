# skills/pptxgenjs-workflow.md
> pptxgenjs를 사용한 PPT 생성 전체 워크플로우입니다.
> SKILL.md의 pptxgenjs 스킬을 기반으로 이 하네스에 최적화되어 있습니다.

---

## 사전 준비

```bash
# 의존성 설치 (최초 1회)
npm install -g pptxgenjs react react-dom react-icons sharp
pip install "markitdown[pptx]" Pillow --break-system-packages
```

---

## Step 1: 스펙 확인

작업 전 `docs/specs/` 에서 해당 PPT 스펙 파일 확인:
- 목적 및 대상 청중
- 슬라이드 수 및 구성
- 브랜드/색상 요구사항
- 레이아웃 선호도

스펙 파일 없으면 `docs/specs/TEMPLATE.md`를 복사하여 먼저 작성.

---

## Step 2: 디자인 시스템 결정

`skills/design-system.md` 참조하여:
1. 색상 팔레트 선택 (주조색 60-70%, 보조색, 강조색)
2. 폰트 페어링 결정
3. 레이아웃 모티프 선택 (슬라이드 전체에서 일관되게 사용)
4. 다크/라이트 구조 결정 (타이틀·마무리 = 다크, 콘텐츠 = 라이트 권장)

---

## Step 3: 슬라이드 구조 설계

코드 작성 전 슬라이드별 레이아웃 계획:

```
Slide 1: 타이틀 (다크 배경, 전체 화면)
Slide 2-N: 콘텐츠 (라이트 배경, 레이아웃 다양화)
Slide N+1: 마무리/CTA (다크 배경)
```

슬라이드마다 레이아웃 유형 지정:
- `two-col` — 텍스트 좌 / 비주얼 우
- `icon-row` — 아이콘 + 텍스트 가로 나열
- `grid-2x2` / `grid-2x3` — 그리드 카드
- `stat-callout` — 대형 숫자 강조
- `timeline` — 순서형 프로세스

---

## Step 4: 코드 생성 (pptxgenjs)

```javascript
// /home/claude/generate-pptx.js 에 작성
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

// ── 색상/폰트 상수 (design-system.md에서 결정) ──
const COLORS = {
  primary:    "1E2761",   // 주조색
  secondary:  "CADCFC",   // 보조색
  accent:     "FFFFFF",   // 강조색
  text:       "1A1A2E",   // 본문 텍스트
  textLight:  "64748B",   // 서브 텍스트
  bg:         "F8FAFC",   // 라이트 배경
};
const FONTS = { header: "Georgia", body: "Calibri" };

// ── 아이콘 헬퍼 (P-005: 팩토리 패턴으로 객체 재사용 방지) ──
const makeShadow = () => ({
  type: "outer", color: "000000", blur: 6, offset: 2,
  angle: 135, opacity: 0.12,
});

async function iconToBase64(IconComponent, color = "#000000", size = 256) {
  const { renderToStaticMarkup } = ReactDOMServer;
  const svg = renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// ── 공통 슬라이드 헬퍼 ──
function addSectionHeader(slide, title, subtitle, colors = COLORS) {
  // P-008: 타이틀 하단 accent 라인 금지 → 배경색으로 구분
  slide.addText(title, {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 36, bold: true, fontFace: FONTS.header,
    color: colors.primary,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5, y: 1.0, w: 9, h: 0.4,
      fontSize: 14, fontFace: FONTS.body,
      color: colors.textLight,
    });
  }
}

async function buildPresentation() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "프레젠테이션 제목";

  // ────────────────────────────────────
  // Slide 1: 타이틀 슬라이드 (다크)
  // ────────────────────────────────────
  const s1 = pres.addSlide();
  s1.background = { color: COLORS.primary };

  s1.addText("프레젠테이션 제목", {
    x: 0.8, y: 1.5, w: 8.4, h: 1.2,
    fontSize: 44, bold: true, fontFace: FONTS.header,
    color: COLORS.accent, align: "center",
  });
  s1.addText("부제목 또는 날짜", {
    x: 0.8, y: 2.9, w: 8.4, h: 0.5,
    fontSize: 16, fontFace: FONTS.body,
    color: COLORS.secondary, align: "center",
  });

  // ────────────────────────────────────
  // Slide 2: 콘텐츠 (two-col 레이아웃)
  // ────────────────────────────────────
  const s2 = pres.addSlide();
  s2.background = { color: COLORS.bg };
  addSectionHeader(s2, "섹션 제목", "섹션 설명");

  // 좌: 텍스트
  s2.addText([
    { text: "핵심 포인트 1", options: { bullet: true, bold: true, breakLine: true } },
    { text: "상세 설명 내용", options: { bullet: false, color: COLORS.textLight, breakLine: true } },
    { text: "핵심 포인트 2", options: { bullet: true, bold: true, breakLine: true } },
    { text: "상세 설명 내용", options: { bullet: false, color: COLORS.textLight } },
  ], {
    x: 0.5, y: 1.6, w: 4.5, h: 3.5,
    fontSize: 14, fontFace: FONTS.body, color: COLORS.text,
    paraSpaceAfter: 8,
  });

  // 우: 비주얼 카드
  s2.addShape(pres.shapes.RECTANGLE, {
    x: 5.3, y: 1.4, w: 4.2, h: 3.8,
    fill: { color: COLORS.primary },
    shadow: makeShadow(),   // P-005: 팩토리 함수
  });
  s2.addText("시각 요소 영역", {
    x: 5.3, y: 2.8, w: 4.2, h: 1.0,
    fontSize: 16, fontFace: FONTS.body,
    color: COLORS.accent, align: "center",
  });

  // ────────────────────────────────────
  // Slide N: 마무리 (다크)
  // ────────────────────────────────────
  const sLast = pres.addSlide();
  sLast.background = { color: COLORS.primary };
  sLast.addText("감사합니다", {
    x: 0.5, y: 2.0, w: 9, h: 1.0,
    fontSize: 40, bold: true, fontFace: FONTS.header,
    color: COLORS.accent, align: "center",
  });

  await pres.writeFile({ fileName: "/mnt/user-data/outputs/output.pptx" });
  console.log("✅ PPTX 생성 완료");
}

buildPresentation().catch(console.error);
```

```bash
node /home/claude/generate-pptx.js
```

---

## Step 5: Content QA

```bash
# P-010: markitdown으로 내용 확인
python -m markitdown /mnt/user-data/outputs/output.pptx

# placeholder 잔류 검사
python -m markitdown /mnt/user-data/outputs/output.pptx \
  | grep -iE "\bx{3,}\b|lorem|ipsum|\bTODO|\[insert|this.*(page|slide).*layout"
```

결과에 매칭 항목 있으면 즉시 수정.

---

## Step 6: 이미지 변환 (Visual QA용)

```bash
python scripts/office/soffice.py --headless --convert-to pdf /mnt/user-data/outputs/output.pptx
rm -f /home/claude/slide-*.jpg
pdftoppm -jpeg -r 150 /home/claude/output.pdf /home/claude/slide
ls -1 "$PWD"/slide-*.jpg
```

→ 출력된 절대 경로를 `skills/qa-protocol.md`의 서브에이전트 프롬프트에 전달.

---

## Step 7: Visual QA

`skills/qa-protocol.md` 참조.
이슈 발견 → 수정 → Step 6 재실행 → 재검증 (P-012).

---

## Step 8: 완료 처리

```bash
# 산출물 최종 확인
ls -lh /mnt/user-data/outputs/output.pptx

# SIGNALS.md 갱신
# (품질 상태를 🟡 → 🟢 로 업데이트)
```
