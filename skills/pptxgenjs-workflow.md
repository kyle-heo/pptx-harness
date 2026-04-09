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

## Step 1.5: 참고 이미지 확인

`docs/reference-images/` 디렉토리에 참고 이미지가 있는지 확인한다.

```bash
ls docs/reference-images/ 2>/dev/null
```

**이미지가 있는 경우 반드시 수행:**
1. 디렉토리 내 모든 이미지를 읽는다 (png, jpg, pdf 등)
2. 각 이미지에서 다음 요소를 분석한다:
   - **색상 톤** — 주조색, 보조색, 강조색 추출
   - **레이아웃 패턴** — 콘텐츠 배치, 여백, 그리드 구조
   - **타이포그래피 스타일** — 제목/본문 크기 비율, 폰트 무게감
   - **시각 요소** — 아이콘 스타일, 도형 사용 방식, 이미지 배치
   - **전체 분위기** — 포멀/캐주얼, 미니멀/장식적
3. **두 단계 톤앤매너 분석을 수행한다:**
   - **세트 단위 톤앤매너** — 디렉토리 내 모든 이미지를 관통하는 공통 분위기(브랜드 무드, 색 시그니처, 위계 규칙)를 한 단락으로 메모 (`fileToneAndManner`).
   - **이미지 단위 톤앤매너** — 각 이미지마다 역할(cover/content/stat/closing 등), 배경 모드, 레이아웃 패턴, 강조 방식, 한 줄 톤 요약을 표로 메모 (`slideToneMap`).
4. 분석 결과를 Step 2·3에 반영한다:
   - 참고 이미지의 색상 톤과 가장 유사한 팔레트 선택 (또는 커스텀 팔레트 구성)
   - 레이아웃 모티프를 참고 이미지의 배치 패턴에 맞춰 조정
   - Step 3에서 신규 슬라이드 각각에 대해 가장 유사한 역할의 참고 이미지를 `slideToneMap`에서 1개 매핑하고, Step 4 코드에서 해당 톤을 차용한다
   - 전체 데크는 `fileToneAndManner` 단락이 정의한 일관성을 벗어나지 않게 유지

**이미지가 없는 경우:** 이 단계를 건너뛰고 Step 1.6으로 진행.

---

## Step 1.6: 참고 PPT 확인 (master + sub 슬라이드)

`docs/reference-pptxs/` 디렉토리에 참고 `.pptx` 파일이 있는지 확인한다.

```bash
ls docs/reference-pptxs/*.pptx 2>/dev/null
```

**파일이 있는 경우 반드시 수행 (시각 + 구조 양쪽):**

### (A) 시각 레퍼런스 — 슬라이드 이미지화
각 `.pptx`를 PDF→이미지로 변환하여 master(1번 슬라이드 = 타이틀/커버)와 sub(2번 이후 = 콘텐츠 레이아웃)를 분리 분석한다.

```bash
mkdir -p /home/claude/ref-pptx
for f in docs/reference-pptxs/*.pptx; do
  name=$(basename "$f" .pptx)
  python scripts/office/soffice.py --headless --convert-to pdf --outdir /home/claude/ref-pptx "$f"
  pdftoppm -jpeg -r 120 "/home/claude/ref-pptx/${name}.pdf" "/home/claude/ref-pptx/${name}-slide"
done
ls /home/claude/ref-pptx/*.jpg
```

- `*-slide-1.jpg` → **master 슬라이드** (커버/타이틀 톤·배경·타이포 기준으로 삼는다)
- `*-slide-2.jpg` 이후 → **sub 슬라이드** (콘텐츠 레이아웃 패턴, 그리드, 카드 스타일의 표본)

Read 툴로 위 이미지들을 직접 열어 Step 1.5와 동일한 5요소(색상 톤/레이아웃/타이포/시각 요소/분위기)를 분석하되, **두 단계 톤앤매너 분석**을 반드시 수행한다:

#### 1. 파일 단위 톤앤매너 (file-level)
참고 PPT 1개 전체를 관통하는 일관된 분위기를 추출한다.
- 브랜드 무드 (예: "엔터프라이즈/보수적", "스타트업/대담", "에디토리얼/감성")
- 공통 색상 시그니처와 대비 강도
- 공통 타이포 위계 (제목/본문 비율)
- 공통 여백·정렬 규칙
→ 결과를 `fileToneAndManner` 한 단락으로 메모.

#### 2. 장표 단위 톤앤매너 (slide-level)
각 슬라이드(`*-slide-N.jpg`)마다 개별 톤을 분석한다.
- 슬라이드 번호 / 역할 (cover · section divider · content · stat · closing 등)
- 배경 모드 (다크 / 라이트 / 이미지)
- 레이아웃 패턴 (two-col, grid, hero, timeline …)
- 강조 방식 (대형 숫자, 아이콘, 도형, 사진)
- 한 줄 톤 요약 (예: "차분한 다크 hero, 큰 세리프 타이틀")
→ 결과를 `slideToneMap` 표(슬라이드 번호별)로 메모.

#### 3. 신규 장표 작성 시 적용 (필수)
- Step 3에서 새 슬라이드 구조를 짤 때, 각 신규 슬라이드에 대해 **가장 유사한 역할의 참고 슬라이드**를 `slideToneMap`에서 1개 선택하여 매핑한다 (예: `신규 slide 1 (cover) ← ref-A slide-1`, `신규 slide 4 (stat) ← ref-B slide-7`).
- Step 4 코드 생성 시 매핑된 참고 슬라이드의 톤(배경, 색, 강조 방식)을 그대로 차용한다.
- 전체 데크는 `fileToneAndManner` 단락이 정의한 일관성을 벗어나지 않아야 한다.
- master 분석 → 새 PPT의 타이틀·마무리 슬라이드에 반영
- sub 분석 → 본문 슬라이드의 레이아웃 모티프에 반영

### (B) 구조 레퍼런스 — python-pptx로 master/layout 추출
참고 PPT의 `slideMaster` 및 `slideLayouts`에서 배경색, placeholder 위치, 폰트, 도형 치수를 추출하여 코드 상수로 재사용한다.

```bash
python - <<'PY'
from pptx import Presentation
from pptx.util import Emu
import glob, json, os

def emu_to_in(v): return round(Emu(v).inches, 3) if v is not None else None

for path in glob.glob("docs/reference-pptxs/*.pptx"):
    prs = Presentation(path)
    print(f"\n=== {os.path.basename(path)} ===")
    print(f"slide_size: {emu_to_in(prs.slide_width)} x {emu_to_in(prs.slide_height)} in")

    for mi, master in enumerate(prs.slide_masters):
        print(f"\n[master {mi}] layouts={len(master.slide_layouts)}")
        for li, layout in enumerate(master.slide_layouts):
            phs = []
            for ph in layout.placeholders:
                phs.append({
                    "idx": ph.placeholder_format.idx,
                    "type": str(ph.placeholder_format.type),
                    "name": ph.name,
                    "x": emu_to_in(ph.left), "y": emu_to_in(ph.top),
                    "w": emu_to_in(ph.width), "h": emu_to_in(ph.height),
                })
            print(f"  layout[{li}] name={layout.name!r} placeholders={json.dumps(phs, ensure_ascii=False)}")
PY
```

출력된 치수/placeholder 좌표를 Step 4의 `COLORS`·레이아웃 상수와 슬라이드 빌더에 반영한다 (master = 타이틀 슬라이드 배치, sub layout들 = 콘텐츠 슬라이드 배치 템플릿).

**주의:** 참고 PPT의 텍스트·이미지 콘텐츠는 복사하지 말 것. 톤·레이아웃·구조 메타데이터만 차용한다.

**파일이 없는 경우:** 이 단계를 건너뛰고 Step 2로 진행.

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

**톤앤매너 매핑 (Step 1.5/1.6에서 만든 `slideToneMap`이 있을 경우 필수):**
신규 슬라이드 각각에 대해 가장 가까운 역할의 참고 슬라이드 1개를 매핑하여 표로 정리한다.

| 신규 # | 역할 | 매핑된 참고 | 차용할 톤 요소 |
|--------|------|------------|----------------|
| 1 | cover | ref-A slide-1 | 다크 배경 + 대형 세리프 타이틀 |
| 2 | two-col content | ref-B slide-3 | 좌 텍스트 / 우 카드, 옅은 그림자 |
| … | … | … | … |

이 표가 Step 4 코드 생성의 single source of truth가 된다.

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
