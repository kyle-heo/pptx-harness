# SIGNALS.md — PPT 품질 신호 허브
> PPT 생성 품질 상태를 통합하는 단일 신호 허브입니다.
> 에이전트 실패 또는 QA 미통과 시 이 파일에 기록합니다.

---

## 현재 상태 대시보드

| 영역 | 상태 | 마지막 갱신 | 담당 GC 잡 |
|------|------|------------|-----------|
| Content QA (markitdown) | 🟡 초기화 | - | `gc-jobs/quality-grader.md` |
| Visual QA (서브에이전트) | 🟡 초기화 | - | `gc-jobs/quality-grader.md` |
| 불변 조건 준수 | 🟡 초기화 | - | `gc-jobs/constraint-enforcer.md` |
| 디자인 일관성 | 🟡 초기화 | - | `gc-jobs/drift-detector.md` |
| 산출물 완전성 | 🟡 초기화 | - | `gc-jobs/quality-grader.md` |

> 상태 범례: 🟢 통과 / 🟡 미검증 / 🔴 실패

---

## 린터 연결 테이블

| CONSTRAINTS ID | 린터 파일 | 검사 시점 | 현재 위반 |
|----------------|-----------|----------|-----------|
| P-001, P-002 | `linters/hex-color-check.js` | 생성 직후 | 0 |
| P-003~P-007 | `linters/content-check.js` | 생성 직후 | 0 |
| P-009~P-012 | `linters/visual-check.js` | QA 단계 | 0 |

---

## GC 자동 트리거 조건

| 조건 | 트리거되는 잡 |
|------|-------------|
| 실패 로그 추가됨 | `constraint-enforcer.md` |
| Visual QA 이슈 3건 이상 | `quality-grader.md` |
| 동일 P-번호 위반 2회 이상 | `drift-detector.md` (패턴 강화) |
| placeholder 잔류 감지 | `quality-grader.md` (즉시) |

---

## 최근 실패 로그

<!-- 에이전트는 실패 시 이 섹션에 항목을 추가합니다 -->
| 날짜 | PPT 제목 | 실패 유형 | 위반 P-번호 | 처리 상태 |
|------|---------|-----------|------------|-----------|
| (초기화) | - | - | - | - |

---

## 누적 패턴 분석

<!-- gc-jobs/drift-detector.md가 자동 갱신 -->
| P-번호 | 누적 위반 횟수 | 마지막 발생 | 린터 강도 |
|--------|-------------|------------|-----------|
| P-001 | 0 | - | 표준 |
| P-005 | 0 | - | 표준 |
| P-008 | 0 | - | 표준 |
| P-009 | 0 | - | 표준 |
