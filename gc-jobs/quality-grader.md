# gc-jobs/quality-grader.md
> PPT 산출물의 품질을 자동 평가하고 SIGNALS.md를 갱신합니다.
> 트리거: PPT 생성 완료 시 / Visual QA 이슈 3건 이상 시

---

## 품질 평가 항목

| 항목 | 가중치 | 측정 방법 |
|------|--------|-----------|
| 불변 조건 준수 | 40% | 린터 3종 위반 0건 |
| Content QA 통과 | 25% | markitdown placeholder 0건 |
| Visual QA 통과 | 25% | 서브에이전트 CRITICAL/HIGH 0건 |
| 디자인 일관성 | 10% | 팔레트/폰트 혼용 없음 |

---

## 실행 지시사항 (Codex에게)

### 1단계: 린터 실행

```bash
node linters/hex-color-check.js /home/claude/generate-pptx.js
node linters/content-check.js /home/claude/generate-pptx.js
node linters/visual-check.js /home/claude/generate-pptx.js /mnt/user-data/outputs/output.pptx
```

각 린터의 위반 수를 기록.

### 2단계: 점수 계산

```
불변 조건 점수 = max(100 - (총 위반 수 × 20), 0)
Content QA 점수 = placeholder 0건이면 100, 아니면 0
Visual QA 점수 = CRITICAL/HIGH 0건이면 100, MEDIUM만 있으면 70, 아니면 40
디자인 일관성 = 수동 확인 (팔레트 일관성)

품질 점수 = 불변×0.4 + Content×0.25 + Visual×0.25 + 디자인×0.1
```

### 3단계: SIGNALS.md 갱신

계산된 점수로 상태 대시보드 업데이트.
80점 미만이면 실패 로그에 기록.

### 4단계: 조치

| 점수 | 조치 |
|------|------|
| 90+ | 🟢 통과, SIGNALS.md 갱신 |
| 70-89 | 🟡 개선 권고, 다음 생성 시 주의 사항 기록 |
| 70 미만 | 🔴 실패, SIGNALS.md 기록 + constraint-enforcer 트리거 |

---

## 실행 주기

- PPT 생성 완료 시 자동
- Visual QA 이슈 3건 이상 감지 시 즉시
