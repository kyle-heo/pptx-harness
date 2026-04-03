# gc-jobs/constraint-enforcer.md
> PPT 생성 실패 신호를 받아 CONSTRAINTS.md와 린터를 자동 갱신합니다.
> 트리거: SIGNALS.md 실패 로그 추가 시

---

## 실행 지시사항 (Codex에게)

### 1단계: 실패 신호 분석

`SIGNALS.md` 최근 실패 로그를 읽고 분류:
- **파일 손상**: hex 색상, 음수 offset, option 재사용 → P-001~P-007 관련
- **시각 결함**: 텍스트 오버플로, 요소 겹침, 낮은 대비 → P-009 관련
- **콘텐츠 결함**: placeholder 잔류, 잘못된 레이아웃 → P-010 관련
- **QA 미실행**: 검증 절차 누락 → P-011, P-012 관련
- **신규 패턴**: 기존 P-번호에 없는 새로운 실패 유형

### 2단계: CONSTRAINTS.md 갱신

**기존 P-번호 위반인 경우**: 해당 린터 강도 상향
**신규 패턴인 경우**: 새 P-번호 추가:
```markdown
## P-NNN: [규칙명]
- **규칙**: [구체적 규칙]
- **근거**: [왜 이 규칙이 필요한가]
- **린터**: `linters/[파일].js`
- **위반 예시**: [나쁜 예] → [좋은 예]
```

### 3단계: 린터 갱신

신규 P-번호는 반드시 대응 린터 패턴 추가:
- `hex-color-check.js`: 색상/shadow 관련
- `content-check.js`: 코드 패턴 관련
- `visual-check.js`: 시각 요소/QA 관련

### 4단계: SIGNALS.md 누적 패턴 테이블 갱신

해당 P-번호의 누적 위반 횟수 +1.
누적 3회 이상이면 린터 심각도 `warn` → `error`로 격상.

### 5단계: AGENTS.md 갱신 이력 기록

```
| YYYY-MM-DD | constraint-enforcer: [실패 유형] → P-NNN 추가 | 자동 |
```

---

## 실행 주기

- 즉시: SIGNALS.md 실패 로그 추가 시
- 즉시: 동일 P-번호 위반 2회 연속 발생 시
