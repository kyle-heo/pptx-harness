# skills/qa-protocol.md
> PPT QA 전체 절차입니다. P-010, P-011, P-012 불변 조건을 충족하기 위한 필수 프로토콜.
> SKILL.md의 QA 섹션을 이 하네스에 구조화했습니다.

---

## QA 원칙

> "Assume there are problems. Your job is to find them."
> "Your first render is almost never correct."

첫 렌더링이 완벽하다고 가정하지 마십시오.
QA는 확인 절차가 아니라 **버그 사냥**입니다.

---

## Phase 1: Content QA (자동)

```bash
# 전체 텍스트 추출
python -m markitdown /mnt/user-data/outputs/output.pptx

# placeholder 잔류 검사 (P-010)
python -m markitdown /mnt/user-data/outputs/output.pptx \
  | grep -iE "\bx{3,}\b|lorem|ipsum|\bTODO|\[insert|this.*(page|slide).*layout"
```

**통과 기준**: grep 결과 0건.
실패 시 즉시 수정 후 재실행.

---

## Phase 2: 린터 자동 검사

```bash
# P-001, P-002: hex 색상 오류
node linters/hex-color-check.js /home/claude/generate-pptx.js

# P-003~P-007: 콘텐츠 패턴 오류
node linters/content-check.js /home/claude/generate-pptx.js

# P-008, P-009: 시각 요소 검사
node linters/visual-check.js /home/claude/generate-pptx.js
```

위반 0건이 되어야 Phase 3 진행.

---

## Phase 3: 이미지 변환

```bash
# PPTX → PDF → JPG
python scripts/office/soffice.py --headless --convert-to pdf /mnt/user-data/outputs/output.pptx
rm -f /home/claude/slide-*.jpg
pdftoppm -jpeg -r 150 /home/claude/output.pdf /home/claude/slide
ls -1 "$PWD"/slide-*.jpg
```

절대 경로 목록을 복사해 Phase 4에서 사용.

---

## Phase 4: Visual QA — 서브에이전트

**반드시 서브에이전트 사용** (P-011). 에이전트 자신은 생성 코드를 보며 편향됨.

서브에이전트에게 전달할 프롬프트:

```
Visually inspect these slides. Assume there are issues — find them.

Look for:
- Overlapping elements (text through shapes, lines through words, stacked elements)
- Text overflow or cut off at edges/box boundaries
- Elements too close (< 0.3" gaps) or cards/sections nearly touching
- Uneven gaps (large empty area in one place, cramped in another)
- Insufficient margin from slide edges (< 0.5")
- Columns or similar elements not aligned consistently
- Low-contrast text (e.g., light gray text on cream-colored background)
- Low-contrast icons (e.g., dark icons on dark backgrounds without a contrasting circle)
- Text boxes too narrow causing excessive wrapping
- Leftover placeholder content
- Accent lines under titles (이것은 금지 패턴 - P-008)
- Slides with NO visual element (text-only - P-009 위반)
- Decorative lines positioned for single-line text but title wrapped to two lines
- Source citations or footers colliding with content above

Read and analyze these images — run `ls -1 "$PWD"/slide-*.jpg`
and use the exact absolute paths it prints:
1. <absolute-path>/slide-N.jpg — (Expected: [brief description])
...

Report ALL issues found, including minor ones.
List each issue as: [슬라이드 번호] [이슈 유형] [구체적 설명]
```

---

## Phase 5: 이슈 처리 및 재검증 (P-012)

### 이슈 심각도 분류

| 심각도 | 예시 | 처리 |
|--------|------|------|
| CRITICAL | 파일 손상, placeholder 잔류 | 즉시 수정 필수 |
| HIGH | 텍스트 오버플로, 요소 겹침 | 수정 필수 |
| MEDIUM | 간격 불균형, 정렬 불일치 | 수정 권장 |
| LOW | 미세 폰트 크기 차이 | 선택적 수정 |

### 재검증 체크리스트

수정 후 반드시:
- [ ] 수정된 슬라이드만 재변환 (또는 전체 재변환)
- [ ] Content QA 재실행
- [ ] 서브에이전트 재검증 (수정된 슬라이드 대상)
- [ ] "새 이슈 없음" 확인 후 완료 선언

---

## Phase 6: SIGNALS.md 갱신

QA 완료 후:
```
SIGNALS.md의 현재 상태 대시보드 업데이트:
- Content QA: 🟢 통과 (YYYY-MM-DD)
- Visual QA: 🟢 통과 (YYYY-MM-DD)
- 불변 조건 준수: 🟢 통과
```

발견된 이슈가 있었다면 실패 로그에도 기록.

---

## 빠른 QA 체크리스트 (전체 요약)

```
[ ] markitdown 실행 → placeholder 0건
[ ] hex-color-check 린터 → 위반 0건
[ ] content-check 린터 → 위반 0건
[ ] visual-check 린터 → 위반 0건
[ ] 이미지 변환 완료
[ ] 서브에이전트 Visual QA 실행
[ ] CRITICAL/HIGH 이슈 0건 또는 수정 완료
[ ] 수정 후 재검증 완료
[ ] SIGNALS.md 🟢 갱신
```
