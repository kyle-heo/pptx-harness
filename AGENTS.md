# AGENTS.md — PPT 생성 하네스
> PPT(pptx) 파일 생성 전용 하네스입니다.
> 소스코드 하네스와 독립적으로 운영됩니다.
> 작업 시작 전 반드시 이 파일을 읽으십시오.

---

## 작업 시작 전 필수 체크

1. `CONSTRAINTS.md` — PPT 생성 불변 조건 확인
2. `SIGNALS.md` — 현재 품질 상태 및 과거 실패 패턴 확인
3. `docs/specs/` — 요청된 PPT의 스펙 파일 확인
4. `docs/context/` — 브랜드 가이드, 참조 자료 확인
5. `skills/pptxgenjs-workflow.md` — 생성 워크플로우 실행

---

## 디렉토리 맵

| 경로 | 역할 | 우선순위 |
|------|------|----------|
| `CONSTRAINTS.md` | PPT 불변 조건 (절대 위반 금지) | P0 |
| `SIGNALS.md` | 품질 상태 허브 + 실패 로그 | P0 |
| `skills/pptxgenjs-workflow.md` | 생성 전체 워크플로우 | P0 |
| `skills/design-system.md` | 색상/폰트/레이아웃 기준 | P0 |
| `skills/qa-protocol.md` | QA 및 시각적 검증 절차 | P0 |
| `docs/specs/` | PPT별 스펙 (슬라이드 수, 목적, 대상) | P1 |
| `docs/context/` | 브랜드 가이드, 레퍼런스 자료 | P1 |
| `docs/plans/` | 실행 플랜 및 반복 작업 이력 | P1 |
| `templates/` | 재사용 슬라이드 템플릿 코드 | P1 |
| `gc-jobs/` | 품질 자동 검사 잡 | P0 |
| `linters/` | PPT 산출물 자동 검증 스크립트 | P0 |

---

## PPT 생성 표준 플로우

```
1. 스펙 확인 (docs/specs/)
   ↓
2. 디자인 시스템 선택 (skills/design-system.md)
   ↓
3. 슬라이드 구성 설계 (LAYOUT.md 참조)
   ↓
4. pptxgenjs로 생성 (skills/pptxgenjs-workflow.md)
   ↓
5. Content QA (markitdown)
   ↓
6. Visual QA — 서브에이전트 활용 (skills/qa-protocol.md)
   ↓
7. 이슈 수정 → 재검증 (최소 1 fix-verify 사이클)
   ↓
8. SIGNALS.md 품질 점수 갱신
   ↓
9. 산출물 저장 (/mnt/user-data/outputs/)
```

---

## 실패 시 프로토콜

```
1. SIGNALS.md > "최근 실패 로그"에 실패 항목 추가
2. 실패 유형 분류 (레이아웃 / 콘텐츠 / QA 미통과 / 파일 손상)
3. gc-jobs/constraint-enforcer.md 자동 트리거
4. CONSTRAINTS.md에 재발 방지 불변 조건 추가
```

---

## 자동 갱신 이력

<!-- gc-jobs/drift-detector.md가 자동 업데이트 -->
| 날짜 | 갱신 내용 | 트리거 |
|------|-----------|--------|
| (초기화) | 최초 생성 | 수동 |
