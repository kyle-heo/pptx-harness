/**
 * templates/slide-patterns.js
 * 재사용 슬라이드 패턴 라이브러리.
 * 각 함수는 pptxgenjs pres 인스턴스와 slide 객체를 받아 요소를 추가합니다.
 *
 * 사용법:
 *   const { addTitleSlide, addTwoColSlide, addStatCallout } = require('./templates/slide-patterns');
 *   const slide = pres.addSlide();
 *   addTitleSlide(slide, { title: '제목', subtitle: '부제목' }, COLORS, FONTS);
 */

// P-005: 팩토리 함수로 shadow 객체 재사용 방지
const makeShadow = (opts = {}) => ({
  type: 'outer',
  color: '000000',
  blur: 6,
  offset: 2,
  angle: 135,
  opacity: 0.12,
  ...opts,
});

/**
 * 타이틀 슬라이드 (다크 배경 전체)
 * Slide 1 / 마지막 슬라이드 용도
 */
function addTitleSlide(slide, { title, subtitle = '', note = '' }, COLORS, FONTS) {
  slide.background = { color: COLORS.primary };

  slide.addText(title, {
    x: 0.8, y: 1.5, w: 8.4, h: 1.3,
    fontSize: 44, bold: true, fontFace: FONTS.header,
    color: COLORS.accent, align: 'center',
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.8, y: 3.0, w: 8.4, h: 0.6,
      fontSize: 18, fontFace: FONTS.body,
      color: COLORS.secondary, align: 'center',
    });
  }

  if (note) {
    slide.addText(note, {
      x: 0.8, y: 4.8, w: 8.4, h: 0.4,
      fontSize: 12, fontFace: FONTS.body,
      color: COLORS.secondary, align: 'center',
    });
  }
}

/**
 * 섹션 헤더 추가 (P-008: 하단 라인 없이 여백으로 구분)
 */
function addHeader(slide, title, subtitle = '', COLORS, FONTS) {
  slide.addText(title, {
    x: 0.5, y: 0.25, w: 9, h: 0.65,
    fontSize: 28, bold: true, fontFace: FONTS.header,
    color: COLORS.primary,
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5, y: 0.95, w: 9, h: 0.35,
      fontSize: 13, fontFace: FONTS.body,
      color: COLORS.textLight,
    });
  }
}

/**
 * 2열 레이아웃: 텍스트 좌 / 시각 요소 우
 * P-009: 우측에 시각 요소(카드) 필수 포함
 */
function addTwoColLayout(slide, {
  title, subtitle = '',
  bullets = [],        // [{ text, bold }]
  rightContent = null, // 우측 추가 콜백 또는 null
}, COLORS, FONTS) {
  addHeader(slide, title, subtitle, COLORS, FONTS);

  // 좌: 불릿 리스트
  const bulletItems = bullets.map((b, i) => [
    { text: b.text, options: { bullet: true, bold: !!b.bold, breakLine: i < bullets.length - 1 } },
  ]).flat();

  slide.addText(bulletItems, {
    x: 0.5, y: 1.45, w: 4.5, h: 3.8,
    fontSize: 14, fontFace: FONTS.body,
    color: COLORS.text, paraSpaceAfter: 10,
  });

  // 우: 시각 카드 (기본 구현, rightContent 콜백으로 오버라이드 가능)
  if (rightContent) {
    rightContent(slide, COLORS, FONTS);
  } else {
    // 기본 색상 카드
    slide.addShape('rect', {
      x: 5.3, y: 1.3, w: 4.2, h: 4.0,
      fill: { color: COLORS.primary },
      shadow: makeShadow(),
    });
  }
}

/**
 * 아이콘 행 레이아웃 (최대 4행)
 * items: [{ icon: base64String, title, desc }]
 */
function addIconRowLayout(slide, { title, subtitle = '', items = [] }, COLORS, FONTS) {
  addHeader(slide, title, subtitle, COLORS, FONTS);

  const startY = 1.45;
  const rowH = 0.9;

  items.slice(0, 4).forEach((item, i) => {
    const y = startY + i * rowH;

    // 아이콘 원
    slide.addShape('ellipse', {
      x: 0.5, y: y, w: 0.5, h: 0.5,
      fill: { color: COLORS.accent },
    });

    // 아이콘 이미지 (제공된 경우)
    if (item.icon) {
      slide.addImage({ data: item.icon, x: 0.6, y: y + 0.1, w: 0.3, h: 0.3 });
    }

    // 제목
    slide.addText(item.title, {
      x: 1.2, y: y, w: 8.3, h: 0.3,
      fontSize: 14, bold: true, fontFace: FONTS.body,
      color: COLORS.text, margin: 0,
    });

    // 설명
    if (item.desc) {
      slide.addText(item.desc, {
        x: 1.2, y: y + 0.3, w: 8.3, h: 0.5,
        fontSize: 12, fontFace: FONTS.body,
        color: COLORS.textLight, margin: 0,
      });
    }
  });
}

/**
 * 2×2 그리드 카드 레이아웃
 * cards: [{ title, desc, color? }]
 */
function addGrid2x2Layout(slide, { title, subtitle = '', cards = [] }, COLORS, FONTS) {
  addHeader(slide, title, subtitle, COLORS, FONTS);

  const positions = [
    { x: 0.4, y: 1.45 },
    { x: 5.1, y: 1.45 },
    { x: 0.4, y: 3.55 },
    { x: 5.1, y: 3.55 },
  ];

  cards.slice(0, 4).forEach((card, i) => {
    const pos = positions[i];
    const cardColor = card.color || COLORS.secondary;

    // 카드 배경
    slide.addShape('rect', {
      x: pos.x, y: pos.y, w: 4.3, h: 1.9,
      fill: { color: cardColor },
      shadow: makeShadow(),
    });

    // 카드 타이틀
    slide.addText(card.title, {
      x: pos.x + 0.2, y: pos.y + 0.15, w: 3.9, h: 0.4,
      fontSize: 14, bold: true, fontFace: FONTS.body,
      color: COLORS.primary,
    });

    // 카드 설명
    if (card.desc) {
      slide.addText(card.desc, {
        x: pos.x + 0.2, y: pos.y + 0.6, w: 3.9, h: 1.1,
        fontSize: 12, fontFace: FONTS.body,
        color: COLORS.text,
      });
    }
  });
}

/**
 * 대형 통계 콜아웃 (stat-callout)
 * stats: [{ value, label, color? }] (최대 3개)
 */
function addStatCallout(slide, { title, subtitle = '', stats = [] }, COLORS, FONTS) {
  addHeader(slide, title, subtitle, COLORS, FONTS);

  const colW = 10 / Math.min(stats.length, 3);
  stats.slice(0, 3).forEach((stat, i) => {
    const x = i * colW;

    slide.addText(stat.value, {
      x, y: 1.8, w: colW, h: 1.5,
      fontSize: 64, bold: true, fontFace: FONTS.header,
      color: stat.color || COLORS.primary, align: 'center',
    });

    slide.addText(stat.label, {
      x, y: 3.4, w: colW, h: 0.5,
      fontSize: 14, fontFace: FONTS.body,
      color: COLORS.textLight, align: 'center',
    });
  });
}

/**
 * 타임라인 / 프로세스 (최대 5단계)
 * steps: [{ num, title, desc }]
 */
function addTimelineLayout(slide, { title, subtitle = '', steps = [] }, COLORS, FONTS, pres) {
  addHeader(slide, title, subtitle, COLORS, FONTS);

  const count = Math.min(steps.length, 5);
  const totalW = 9.0;
  const stepW = totalW / count;
  const startX = 0.5;
  const arrowY = 2.4;

  steps.slice(0, count).forEach((step, i) => {
    const x = startX + i * stepW;
    const cx = x + stepW / 2;

    // 번호 원
    slide.addShape('ellipse', {
      x: cx - 0.3, y: arrowY - 0.3, w: 0.6, h: 0.6,
      fill: { color: COLORS.primary },
    });

    slide.addText(String(step.num || i + 1), {
      x: cx - 0.3, y: arrowY - 0.3, w: 0.6, h: 0.6,
      fontSize: 14, bold: true, fontFace: FONTS.body,
      color: COLORS.accent, align: 'center', valign: 'middle',
    });

    // 단계 사이 연결선
    if (i < count - 1) {
      slide.addShape('line', {
        x: cx + 0.3, y: arrowY, w: stepW - 0.6, h: 0,
        line: { color: COLORS.primary, width: 1.5 },
      });
    }

    // 제목
    slide.addText(step.title, {
      x: x, y: arrowY + 0.5, w: stepW, h: 0.4,
      fontSize: 12, bold: true, fontFace: FONTS.body,
      color: COLORS.text, align: 'center',
    });

    // 설명
    if (step.desc) {
      slide.addText(step.desc, {
        x: x, y: arrowY + 0.95, w: stepW, h: 1.5,
        fontSize: 11, fontFace: FONTS.body,
        color: COLORS.textLight, align: 'center',
      });
    }
  });
}

module.exports = {
  makeShadow,
  addTitleSlide,
  addHeader,
  addTwoColLayout,
  addIconRowLayout,
  addGrid2x2Layout,
  addStatCallout,
  addTimelineLayout,
};
