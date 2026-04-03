# CONSTRAINTS.md — PPT 생성 불변 조건
> 이 파일의 모든 항목은 절대 위반 금지입니다.
> 위반 시 파일 손상 또는 시각적 결함이 발생합니다.
> 에이전트 실패 시 gc-jobs/constraint-enforcer.md가 신규 항목을 자동 추가합니다.

---

## P-001: hex 색상에 # 접두사 절대 금지
- **규칙**: 모든 color 값은 6자리 hex만 사용. `#` 금지
- **근거**: pptxgenjs가 # 포함 시 파일 손상 발생
- **린터**: `linters/hex-color-check.js`
- **위반 예시**: `color: "#FF0000"` → `color: "FF0000"`

## P-002: 8자리 hex로 투명도 표현 절대 금지
- **규칙**: 투명도는 반드시 `opacity` 프로퍼티 사용
- **근거**: `"00000020"` 같은 8자리 hex는 파일 손상
- **린터**: `linters/hex-color-check.js`
- **위반 예시**: `shadow: { color: "00000020" }` → `shadow: { color: "000000", opacity: 0.12 }`

## P-003: 유니코드 불릿 기호 절대 금지
- **규칙**: `bullet: true` 옵션 사용. `"•"` 등 유니코드 직접 삽입 금지
- **근거**: 이중 불릿 렌더링 버그
- **린터**: `linters/content-check.js`

## P-004: breakLine 없는 배열 텍스트 금지
- **규칙**: 텍스트 배열 사용 시 마지막 항목 제외 모든 항목에 `breakLine: true` 필수
- **린터**: `linters/content-check.js`

## P-005: option 객체 재사용 절대 금지
- **규칙**: shadow, fill 등 옵션 객체는 반드시 호출마다 새 객체 생성
- **근거**: pptxgenjs가 객체를 EMU 단위로 내부 변환하여 재사용 시 두 번째 호출 손상
- **패턴**: `const makeShadow = () => ({ ... })` 팩토리 함수 사용
- **린터**: `linters/content-check.js`

## P-006: ROUNDED_RECTANGLE + 직선 accent 조합 금지
- **규칙**: accent 경계선과 함께 쓸 때는 `RECTANGLE` 사용
- **근거**: 둥근 모서리가 accent 직선을 덮지 못해 시각적 결함 발생
- **린터**: `linters/content-check.js`

## P-007: shadow offset 음수 금지
- **규칙**: `shadow.offset`은 반드시 0 이상
- **근거**: 음수 offset은 파일 손상
- **패턴**: 위쪽 그림자는 `angle: 270` + 양수 offset

## P-008: 타이틀 하단 accent 라인 금지
- **규칙**: 슬라이드 타이틀 아래 장식선 삽입 금지
- **근거**: SKILL.md 명시 — AI 생성 슬라이드의 대표적 티가 남는 패턴
- **대안**: 여백 또는 배경 색상으로 구분

## P-009: 텍스트 전용 슬라이드 금지
- **규칙**: 모든 슬라이드에 최소 1개의 시각 요소(이미지/아이콘/차트/도형) 포함
- **근거**: SKILL.md — "Text-only slides are forgettable"
- **린터**: `linters/visual-check.js`

## P-010: Content QA 없이 산출물 제출 금지
- **규칙**: `python -m markitdown output.pptx` 실행 결과를 반드시 확인
- **체크**: placeholder 텍스트(`xxx`, `lorem`, `TODO`, `[insert`) 잔류 여부
- **린터**: `linters/visual-check.js` (markitdown 출력 파이프)

## P-011: Visual QA 없이 산출물 제출 금지
- **규칙**: 서브에이전트 시각 검증 1회 이상 필수 (슬라이드 수 무관)
- **근거**: SKILL.md — "even for 2-3 slides. You've been staring at the code"
- **절차**: `skills/qa-protocol.md` 참조

## P-012: fix-verify 사이클 없이 완료 선언 금지
- **규칙**: QA에서 이슈 발견 시 수정 후 반드시 재검증 1회 이상 수행
- **근거**: SKILL.md — "Do not declare success until you've completed at least one fix-and-verify cycle"

---

## 불변 조건 추가 프로토콜

에이전트 실패 발생 시:
1. `SIGNALS.md` 실패 로그 기록
2. 이 파일에 `P-NNN` 항목 추가
3. `linters/` 에 대응 검사 로직 추가 또는 갱신
4. `AGENTS.md` 갱신 이력 기록
