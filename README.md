# pptx-harness

AI 에이전트가 **pptxgenjs**로 프레젠테이션(PPTX)을 생성할 때 품질을 보장하기 위한 하네스(harness) 시스템입니다.

소스코드 프로젝트와 독립적으로 운영되며, PPT 생성 전 과정에 걸쳐 불변 조건 준수, 디자인 일관성, 자동 QA를 강제합니다.

---

## 핵심 개념

| 개념 | 설명 |
|------|------|
| **불변 조건 (Constraints)** | pptxgenjs의 알려진 함정을 P-번호로 코드화한 규칙 (P-001 ~ P-012) |
| **디자인 시스템** | 색상 팔레트, 폰트 페어링, 레이아웃 모티프 기준 |
| **레퍼런스 톤앤매너** | `reference-images/`·`reference-pptxs/`에서 추출한 파일/장표 단위 톤을 신규 슬라이드에 매핑 |
| **린터** | 생성된 코드를 불변 조건 기준으로 자동 검증하는 스크립트 |
| **GC 잡** | 실패 시 자동으로 조건을 강화하고 패턴을 추적하는 거버넌스 작업 |

---

## 디렉토리 구조

```
pptx-harness/
├── AGENTS.md              # 에이전트 진입점 — 작업 시작 전 필독
├── CONSTRAINTS.md         # PPT 불변 조건 (P-001 ~ P-012)
├── SIGNALS.md             # 품질 상태 대시보드 + 실패 로그
│
├── skills/
│   ├── pptxgenjs-workflow.md   # 생성 워크플로우 (Step 1 ~ 8)
│   ├── design-system.md        # 색상/폰트/레이아웃 기준
│   └── qa-protocol.md          # Visual QA 절차
│
├── templates/
│   └── slide-patterns.js       # 재사용 슬라이드 패턴 함수
│
├── linters/
│   ├── hex-color-check.js      # P-001, P-002, P-007 검사
│   ├── content-check.js        # P-003, P-004, P-005, P-006, P-008 검사
│   └── visual-check.js         # P-009, P-010 검사
│
├── gc-jobs/
│   ├── constraint-enforcer.md  # 실패 시 불변 조건 자동 추가
│   ├── drift-detector.md       # 디자인 드리프트 감지
│   └── quality-grader.md       # 품질 점수 산출 (4영역 가중 평균)
│
└── docs/
    ├── specs/                  # PPT별 스펙 파일
    ├── reference-images/       # 참고 이미지 (디자인 톤/레이아웃 참조)
    └── reference-pptxs/        # 참고 PPT (master/sub 슬라이드 시각·구조 참조)
```

---

## 생성 워크플로우

```
스펙 → 레퍼런스 분석(이미지 + PPT) → 디자인 시스템 → 슬라이드 구조 + 톤 매핑
   → 콘텐츠 충실도 설계 → pptxgenjs 코드 → Content QA → Visual QA
   → fix-verify 사이클 → SIGNALS.md 갱신 → 산출물 저장
```

| Step | 단계 | 설명 |
|------|------|------|
| 1   | 스펙 확인 | `docs/specs/`에서 목적·대상·구성 확인 |
| 1.5 | 참고 이미지 분석 | `docs/reference-images/` — 파일 단위 + 이미지 단위 톤앤매너 추출 |
| 1.6 | 참고 PPT 분석 | `docs/reference-pptxs/` — master/sub 슬라이드를 시각(이미지화) + 구조(python-pptx) 양쪽으로 추출 |
| 2   | 디자인 시스템 | 팔레트 + 폰트 + 레이아웃 모티프 결정 (레퍼런스 톤 반영) |
| 3   | 슬라이드 구조 설계 | 신규 슬라이드 ↔ 참고 슬라이드 톤 매핑 표 작성 (의무) |
| 3.5 | 콘텐츠 충실도 설계 | 빈 슬라이드 금지 — 역할별 최소 구성요소를 충족하도록 본문 초안 작성 |
| 4   | 코드 생성 | `templates/slide-patterns.js` 활용, 불변 조건 준수 |
| 5   | Content QA | `markitdown`으로 텍스트 추출, placeholder 잔류 검사 (P-010) |
| 6/7 | Visual QA | 슬라이드 이미지화 후 서브에이전트 시각 검증 (P-011) |
| 8   | 완료 처리 | fix-verify 1회 이상 (P-012) → SIGNALS.md 갱신 → 산출물 저장 |

---

## 불변 조건 요약

| ID | 규칙 | 이유 |
|----|------|------|
| P-001 | hex 색상에 `#` 금지 | 파일 손상 |
| P-002 | 8자리 hex 투명도 금지 (`opacity` 사용) | 파일 손상 |
| P-003 | 유니코드 불릿(`•`) 금지 (`bullet: true` 사용) | 이중 불릿 버그 |
| P-004 | 텍스트 배열에 `breakLine: true` 필수 | 렌더링 오류 |
| P-005 | 옵션 객체 재사용 금지 (팩토리 함수) | EMU 변환 시 손상 |
| P-006 | ROUNDED_RECTANGLE + accent 직선 조합 금지 | 시각적 결함 |
| P-007 | shadow offset 음수 금지 | 파일 손상 |
| P-008 | 타이틀 하단 accent 라인 금지 | AI 생성 티 |
| P-009 | 텍스트 전용 슬라이드 금지 | 시각 요소 필수 |
| P-010 | Content QA(markitdown) 필수 | placeholder 잔류 방지 |
| P-011 | Visual QA(서브에이전트) 필수 | 시각적 결함 검증 |
| P-012 | fix-verify 사이클 필수 | 검증 없는 완료 방지 |

---

## 레퍼런스 톤앤매너 (2단계 분석)

`docs/reference-images/` 또는 `docs/reference-pptxs/` 에 자료가 있으면 다음 두 단계 분석을 **반드시** 수행한다.

1. **파일 단위 톤앤매너 (`fileToneAndManner`)** — 한 디렉토리/한 PPT 전체를 관통하는 브랜드 무드, 색 시그니처, 위계 규칙을 한 단락으로 요약.
2. **장표 단위 톤앤매너 (`slideToneMap`)** — 각 이미지/슬라이드마다 역할(cover/content/stat/closing 등), 배경, 레이아웃 패턴, 강조 방식, 한 줄 톤 요약을 표로 정리.

Step 3에서 신규 슬라이드 각각에 대해 **가장 유사한 역할의 참고 슬라이드 1개를 매핑**하고, Step 4 코드 생성 시 그 톤을 차용한다. 데크 전체는 `fileToneAndManner` 일관성을 벗어나지 않아야 한다.

참고 PPT는 추가로 `python-pptx`로 `slideMaster`/`slideLayouts`의 배경, placeholder 좌표, 폰트, 도형 치수를 추출하여 **구조 메타데이터**까지 차용한다. 단, 참고 자료의 텍스트·이미지 콘텐츠 자체를 복사하는 것은 금지.

---

## 빈 슬라이드 금지 (Step 3.5)

스펙이 키워드 한 줄만 줬더라도 그대로 한 줄만 박지 않는다. 슬라이드의 역할별 최소 구성요소(cover / divider / two-col / grid / stat / timeline / closing)를 충족하도록 본문 초안을 작성하고 Step 4 코드에 그대로 반영한다.

- 합리적 추론으로 살을 붙이되, 추론한 텍스트는 Step 3 플랜에 `(추론)`/`(보강)`으로 표시
- 숫자·고유명사·인용은 스펙·context에 명시된 것만 사용 (환각 금지)
- 텍스트가 부족하면 아이콘·카드·도형·차트로 시각 균형 (빈 공간 > 30% 시 재설계)
- placeholder 텍스트(`xxx`, `lorem`, `TODO`, `[insert ...]`)는 P-010에서 자동 검출 → 실패 처리

---

## 품질 거버넌스

### 자동 트리거

- **실패 로그 추가** → `constraint-enforcer`가 새 P-번호 자동 추가
- **동일 규칙 2회 위반** → `drift-detector`가 린터 강도 상향
- **Visual QA 이슈 3건+** → `quality-grader`가 품질 등급 재산출

### 품질 점수 산출

| 영역 | 가중치 |
|------|--------|
| 불변 조건 준수 | 40% |
| Content QA | 25% |
| Visual QA | 25% |
| 디자인 일관성 | 10% |

점수 기준: **90+** = 통과 / **70-89** = 경고 / **70 미만** = 실패

---

## 사용 방법

1. `docs/specs/TEMPLATE.md`를 복사하여 PPT 스펙 작성
2. 참고 자료가 있으면 `docs/reference-images/` 또는 `docs/reference-pptxs/`에 배치
3. 에이전트에게 `AGENTS.md`를 읽고 작업 시작하도록 지시
4. 에이전트는 자동으로 Step 1 ~ 8 워크플로우를 따라 생성 → QA → fix-verify → 완료
5. `SIGNALS.md`에서 품질 상태 확인
