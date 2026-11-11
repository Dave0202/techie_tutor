const pptxgen = require('pptxgenjs');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'VirtualTeach Project';
pptx.subject = 'VirtualTeach project defence overview';
pptx.title = 'VirtualTeach | Project Defence';
pptx.company = 'TechieTutor';
pptx.lang = 'en-GB';
pptx.theme = {
  headFontFace: 'Aptos Display',
  bodyFontFace: 'Aptos',
  lang: 'en-GB',
};
pptx.defineSlideMaster({
  title: 'BASE',
  background: { color: '08172C' },
  objects: [
    { rect: { x: 0, y: 0, w: 13.333, h: 0.075, line: { color: '2D7FF9', transparency: 100 }, fill: { color: '2D7FF9' } } },
    { rect: { x: 0, y: 0.075, w: 13.333, h: 0.025, line: { color: 'FFC247', transparency: 100 }, fill: { color: 'FFC247' } } },
  ],
  slideNumber: { x: 12.62, y: 7.18, w: 0.22, h: 0.16, color: '8295B2', fontFace: 'Aptos', fontSize: 8, align: 'right' },
});

const C = {
  navy: '08172C',
  panel: '102541',
  panel2: '132D4E',
  blue: '2D7FF9',
  blueLight: 'A9CBFF',
  gold: 'FFC247',
  white: 'F7FAFF',
  muted: 'A9B8CD',
  pale: 'EAF2FF',
  ink: '102541',
  teal: '6EE7D2',
};
const FONT = 'Aptos';
const HEAD = 'Aptos Display';
const slide = pptx.addSlide('BASE');
slide.background = { color: C.navy };

function text(value, x, y, w, h, options = {}) {
  slide.addText(value, {
    x, y, w, h,
    margin: 0,
    breakLine: false,
    fontFace: options.fontFace || FONT,
    fontSize: options.fontSize || 12,
    color: options.color || C.white,
    bold: options.bold || false,
    charSpacing: options.charSpacing || 0,
    valign: options.valign || 'mid',
    align: options.align || 'left',
    fit: 'shrink',
    transparency: options.transparency || 0,
    ...options,
  });
}

function shape(type, x, y, w, h, fill, line = fill, extras = {}) {
  slide.addShape(type, {
    x, y, w, h,
    rectRadius: 0.12,
    fill: { color: fill },
    line: { color: line, width: 0.8 },
    ...extras,
  });
}

function card(x, y, w, h, fill = C.panel) {
  shape(pptx.ShapeType.roundRect, x, y, w, h, fill, '24405F', {
    radius: 0.14,
    shadow: { type: 'outer', color: '000000', blur: 4, angle: 45, distance: 1.5, opacity: 0.22 },
  });
}

function pill(label, x, y, w, color = C.blue) {
  shape(pptx.ShapeType.roundRect, x, y, w, 0.28, color, color, {
    radius: 0.12,
    line: { color, transparency: 100 },
  });
  text(label, x + 0.1, y + 0.015, w - 0.2, 0.24, {
    fontSize: 8.3, bold: true, color: C.white, charSpacing: 0.7, align: 'center',
  });
}

// Atmospheric brand accents
shape(pptx.ShapeType.ellipse, 11.55, -0.75, 2.8, 2.8, '12315B', '12315B', {
  fill: { color: '12315B', transparency: 28 },
  line: { color: '12315B', transparency: 100 },
});
shape(pptx.ShapeType.ellipse, 12.25, 0.37, 0.13, 0.13, C.gold, C.gold, {
  line: { color: C.gold, transparency: 100 },
});

// Header
shape(pptx.ShapeType.roundRect, 0.55, 0.39, 0.48, 0.48, C.blue, C.blue);
text('VT', 0.55, 0.405, 0.48, 0.43, {
  fontFace: HEAD, fontSize: 14, bold: true, align: 'center', color: C.white,
});
text('TECHIETUTOR  /  PROJECT DEFENCE', 1.18, 0.4, 5.2, 0.19, {
  fontSize: 9, bold: true, charSpacing: 1.6, color: C.gold,
});
text('VIRTUALTEACH', 1.16, 0.61, 6.2, 0.48, {
  fontFace: HEAD, fontSize: 29, bold: true, charSpacing: 0.5, color: C.white,
});
text('A role-based virtual tutoring platform', 1.19, 1.08, 6.5, 0.24, {
  fontSize: 12, color: C.muted,
});
pill('FULL-STACK MVP', 10.77, 0.54, 1.95, C.panel2);
text('DISCOVER  ·  BOOK  ·  LEARN', 9.4, 0.91, 3.4, 0.2, {
  fontSize: 9, bold: true, charSpacing: 0.8, color: C.blueLight, align: 'right',
});

// Product purpose and learner flow
card(0.55, 1.56, 3.54, 2.28);
text('THE OPPORTUNITY', 0.82, 1.79, 2.9, 0.2, {
  fontSize: 9, bold: true, charSpacing: 1.2, color: C.gold,
});
text('Learning support,\nconnected end to end.', 0.82, 2.09, 2.95, 0.65, {
  fontFace: HEAD, fontSize: 21, bold: true, color: C.white, valign: 'top',
});
text('Students find tutors, request lessons and access shared study resources in one platform.', 0.82, 2.84, 2.95, 0.48, {
  fontSize: 11, color: C.muted, valign: 'top', breakLine: false,
});
const flow = [
  ['01', 'Discover'],
  ['02', 'Book'],
  ['03', 'Manage'],
  ['04', 'Learn'],
];
flow.forEach(([number, label], index) => {
  const x = 0.82 + index * 0.78;
  shape(pptx.ShapeType.ellipse, x, 3.44, 0.25, 0.25, index === 3 ? C.gold : C.blue, index === 3 ? C.gold : C.blue);
  text(number, x, 3.46, 0.25, 0.19, { fontSize: 7.3, bold: true, color: C.navy, align: 'center' });
  text(label, x - 0.08, 3.71, 0.43, 0.15, { fontSize: 7.5, bold: true, color: C.blueLight, align: 'center' });
  if (index < flow.length - 1) {
    text('›', x + 0.43, 3.46, 0.22, 0.18, { fontSize: 13, bold: true, color: C.muted, align: 'center' });
  }
});

// Architecture
card(4.27, 1.56, 8.51, 2.28);
text('HOW THE PLATFORM WORKS', 4.56, 1.79, 4.4, 0.2, {
  fontSize: 9, bold: true, charSpacing: 1.2, color: C.gold,
});
text('Three layers. One learning experience.', 4.56, 2.04, 6.4, 0.25, {
  fontFace: HEAD, fontSize: 16, bold: true, color: C.white,
});

const layers = [
  { x: 4.58, title: 'WEB APP', detail: 'React  ·  Vite', accent: C.blue },
  { x: 7.54, title: 'REST API', detail: 'Spring Boot  ·  Java 17', accent: C.gold },
  { x: 10.5, title: 'DATA', detail: 'MariaDB  ·  JPA', accent: C.teal },
];
layers.forEach(({ x, title, detail, accent }) => {
  shape(pptx.ShapeType.roundRect, x, 2.48, 2.37, 0.63, C.panel2, '294968');
  shape(pptx.ShapeType.rect, x, 2.48, 0.055, 0.63, accent, accent, {
    line: { color: accent, transparency: 100 },
  });
  text(title, x + 0.17, 2.57, 2.03, 0.16, { fontSize: 8, bold: true, charSpacing: 1.0, color: accent });
  text(detail, x + 0.17, 2.78, 2.04, 0.18, { fontSize: 10.2, bold: true, color: C.white });
});
text('›', 7.08, 2.68, 0.29, 0.2, { fontSize: 18, bold: true, color: C.muted, align: 'center' });
text('›', 10.04, 2.68, 0.29, 0.2, { fontSize: 18, bold: true, color: C.muted, align: 'center' });
shape(pptx.ShapeType.roundRect, 4.58, 3.3, 8.29, 0.32, '0C1E35', '0C1E35');
text('JWT AUTH', 4.76, 3.36, 0.86, 0.14, { fontSize: 7.5, bold: true, charSpacing: 0.6, color: C.gold });
text('Role-aware access', 5.7, 3.35, 1.53, 0.16, { fontSize: 9, color: C.white });
text('Cloudinary profile photos', 7.45, 3.35, 2.15, 0.16, { fontSize: 9, color: C.white });
text('REST endpoints', 10.1, 3.35, 1.45, 0.16, { fontSize: 9, color: C.white });
text('DEV → DELIVERY', 11.57, 3.36, 1.1, 0.14, { fontSize: 7.2, bold: true, color: C.blueLight, align: 'right' });

// Role-specific value
text('BUILT AROUND THREE ROLES', 0.58, 4.09, 4.2, 0.2, {
  fontSize: 9, bold: true, charSpacing: 1.25, color: C.gold,
});
text('Clear tools for every participant', 8.0, 4.08, 4.75, 0.22, {
  fontSize: 10, color: C.muted, align: 'right',
});

const roles = [
  {
    x: 0.55, mark: 'S', title: 'STUDENT', accent: C.blue,
    body: 'Find tutors  ·  request 30 / 60 / 90-min sessions  ·  track booking status',
  },
  {
    x: 4.74, mark: 'T', title: 'TUTOR', accent: C.gold,
    body: 'Create a profile  ·  manage session requests  ·  publish resource links',
  },
  {
    x: 8.93, mark: 'A', title: 'ADMIN', accent: C.teal,
    body: 'Review the account directory  ·  monitor student, tutor and admin totals',
  },
];
roles.forEach(({ x, mark, title, accent, body }) => {
  card(x, 4.4, 3.85, 1.56, C.panel);
  shape(pptx.ShapeType.ellipse, x + 0.25, 4.65, 0.39, 0.39, accent, accent);
  text(mark, x + 0.25, 4.69, 0.39, 0.26, {
    fontFace: HEAD, fontSize: 14, bold: true, color: C.navy, align: 'center',
  });
  text(title, x + 0.79, 4.67, 2.7, 0.22, {
    fontSize: 10, bold: true, charSpacing: 1.2, color: accent,
  });
  shape(pptx.ShapeType.rect, x + 0.25, 5.19, 3.34, 0.012, '29415E', '29415E', {
    line: { color: '29415E', transparency: 100 },
  });
  text(body, x + 0.25, 5.35, 3.32, 0.45, {
    fontSize: 10.5, color: C.white, valign: 'top', breakLine: false,
  });
});

// Stack, quality and delivery
card(0.55, 6.19, 12.23, 0.79, '0D203A');
text('TECH + QUALITY', 0.82, 6.37, 1.3, 0.16, {
  fontSize: 8, bold: true, charSpacing: 1, color: C.gold,
});
text('React + Vite   ·   Java 17 + Spring Boot   ·   MariaDB + JWT', 2.22, 6.33, 5.0, 0.2, {
  fontSize: 10.2, bold: true, color: C.white,
});
text('MockMvc + H2 backend test stack', 2.22, 6.6, 3.4, 0.16, {
  fontSize: 8.4, color: C.muted,
});
shape(pptx.ShapeType.rect, 7.55, 6.35, 0.012, 0.46, '29415E', '29415E', {
  line: { color: '29415E', transparency: 100 },
});
text('DELIVERY', 7.83, 6.37, 0.88, 0.16, {
  fontSize: 8, bold: true, charSpacing: 1, color: C.blueLight,
});
text('Docker + Compose  ·  Kubernetes baseline', 8.82, 6.33, 3.55, 0.2, {
  fontSize: 9.3, bold: true, color: C.white,
});
text('GitHub Actions  →  GHCR image publishing', 8.82, 6.6, 3.55, 0.16, {
  fontSize: 8.4, color: C.muted,
});

text('DISCOVER. CONNECT. KEEP LEARNING.', 0.57, 7.13, 4.9, 0.16, {
  fontSize: 7.5, bold: true, charSpacing: 1, color: C.blueLight,
});

pptx.writeFile({ fileName: 'VirtualTeach-Project-Defence.pptx' });
