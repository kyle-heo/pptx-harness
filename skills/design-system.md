# skills/design-system.md
> PPT 생성 시 디자인 일관성을 보장하는 시스템입니다.
> SKILL.md의 디자인 가이드를 이 하네스에 구조화했습니다.

---

## 색상 팔레트 카탈로그

목적에 맞는 팔레트를 선택하십시오. 팔레트를 교체해도 어색하지 않으면 선택이 잘못된 것입니다.

| 팔레트 ID | 테마 | primary | secondary | accent | 적합한 용도 |
|-----------|------|---------|-----------|--------|------------|
| `midnight-exec` | 미드나이트 임원 | `1E2761` | `CADCFC` | `FFFFFF` | 경영 보고, 투자 제안 |
| `forest-moss` | 포레스트 | `2C5F2D` | `97BC62` | `F5F5F5` | ESG, 환경, 지속가능성 |
| `coral-energy` | 코랄 에너지 | `F96167` | `F9E795` | `2F3C7E` | 마케팅, 제품 런칭 |
| `terracotta` | 따뜻한 테라코타 | `B85042` | `E7E8D1` | `A7BEAE` | 브랜드, 문화, HR |
| `ocean-deep` | 오션 딥 | `065A82` | `1C7293` | `21295C` | 기술, IT, 데이터 |
| `charcoal-min` | 차콜 미니멀 | `36454F` | `F2F2F2` | `212121` | 컨설팅, 전략 |
| `teal-trust` | 틸 트러스트 | `028090` | `00A896` | `02C39A` | 헬스케어, 금융, 신뢰 |
| `berry-cream` | 베리 & 크림 | `6D2E46` | `A26769` | `ECE2D0` | 럭셔리, 패션, 뷰티 |
| `cherry-bold` | 체리 볼드 | `990011` | `FCF6F5` | `2F3C7E` | 긴급, 경보, 강렬함 |

### 색상 가중치 규칙
- **dominant (60-70%)**: primary → 배경, 헤더 배경
- **supporting (20-30%)**: secondary → 카드, 강조 영역
- **accent (10%)**: accent → CTA, 키 포인트

---

## 폰트 페어링

| 페어 ID | 헤더 | 본문 | 특징 |
|---------|------|------|------|
| `georgia-calibri` | Georgia | Calibri | 클래식, 신뢰감 |
| `arialblack-arial` | Arial Black | Arial | 강렬, 현대적 |
| `cambria-calibri` | Cambria | Calibri | 전통, 가독성 |
| `trebuchet-calibri` | Trebuchet MS | Calibri | 친근, 테크 |
| `palatino-garamond` | Palatino | Garamond | 고급, 에디토리얼 |

### 폰트 크기 기준 (SKILL.md 준수)

| 요소 | 크기 | 비고 |
|------|------|------|
| 슬라이드 타이틀 | 36-44pt bold | |
| 섹션 헤더 | 20-24pt bold | |
| 본문 | 14-16pt | |
| 캡션/서브텍스트 | 10-12pt | 흐린 색상 |
| 통계 숫자 콜아웃 | 60-72pt bold | |

---

## 레이아웃 모티프 카탈로그

슬라이드 전체에서 하나의 모티프를 일관되게 사용하십시오.

### `two-col` — 2열 레이아웃
```
[텍스트/리스트] | [이미지/아이콘/차트]
    x:0.5~4.8   |   x:5.3~9.5
```

### `icon-row` — 아이콘 + 텍스트 행
```
[🔵아이콘] 헤더텍스트
           설명 텍스트
[🔵아이콘] 헤더텍스트
           설명 텍스트
```
아이콘은 colored circle 내부에 배치. 원 색상 = accent.

### `grid-2x2` — 2×2 카드 그리드
```
[카드1] [카드2]
[카드3] [카드4]
```
카드 크기: w=4.3, h=1.9 / 갭: 0.3인치

### `grid-2x3` — 2×3 카드 그리드
```
[카드1] [카드2] [카드3]
[카드4] [카드5] [카드6]
```
카드 크기: w=2.8, h=1.9 / 갭: 0.2인치

### `stat-callout` — 대형 통계 강조
```
         72%
    핵심 수치 설명
```
숫자: 60-72pt bold, 라벨: 14pt

### `timeline` — 타임라인 / 프로세스
```
①→②→③→④
단계1 단계2 단계3 단계4
```
연결선 + 번호 원 + 라벨

---

## 슬라이드 구조 규칙

### 다크/라이트 샌드위치 구조 (권장)
```
슬라이드 1   : 타이틀 → 다크 (primary 배경)
슬라이드 2~N : 콘텐츠 → 라이트 (bg 배경)
슬라이드 N+1 : 마무리 → 다크 (primary 배경)
```

### 간격 기준
- 슬라이드 가장자리 여백: 최소 0.5인치
- 콘텐츠 블록 간 간격: 0.3~0.5인치
- 텍스트 박스 내부 패딩: `margin: 0` (정렬 필요 시)

### 슬라이드당 규칙
- 시각 요소 최소 1개 필수 (P-009)
- 레이아웃 유형을 슬라이드마다 변화 (동일 레이아웃 연속 3장 이상 금지)
- 본문 텍스트 좌정렬, 타이틀만 중앙 또는 좌정렬
- 색상 대비: 텍스트는 배경 대비 4.5:1 이상

---

## 아이콘 사용 가이드

```javascript
// colored circle + 아이콘 패턴
// 원
slide.addShape(pres.shapes.OVAL, {
  x: 0.5, y: 1.4, w: 0.5, h: 0.5,
  fill: { color: COLORS.accent }
});
// 아이콘 (원 내부)
const iconData = await iconToBase64(FaCheckCircle, "#FFFFFF", 256);
slide.addImage({ data: iconData, x: 0.6, y: 1.5, w: 0.3, h: 0.3 });
```

아이콘 선택 기준:
- `react-icons/fa` — Font Awesome (범용)
- `react-icons/md` — Material Design (테크/모던)
- `react-icons/hi` — Heroicons (클린/심플)
