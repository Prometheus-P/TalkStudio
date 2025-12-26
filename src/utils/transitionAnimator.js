/**
 * Transition Animator - 메시지 등장 애니메이션
 * fade-in, slide-up, scale 등 다양한 등장 효과 지원
 */

/**
 * 이징 함수 모음
 */
export const EASING = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeOutBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeOutElastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  spring: (t) => {
    return 1 - Math.cos(t * Math.PI * 2.5) * Math.exp(-t * 6);
  },
};

/**
 * 트랜지션 프리셋
 */
export const TRANSITION_PRESETS = {
  none: {
    name: '없음',
    duration: 0,
    properties: {},
  },
  fadeIn: {
    name: '페이드 인',
    duration: 300,
    easing: 'easeOut',
    properties: {
      opacity: { from: 0, to: 1 },
    },
  },
  slideUp: {
    name: '슬라이드 업',
    duration: 350,
    easing: 'easeOut',
    properties: {
      opacity: { from: 0, to: 1 },
      translateY: { from: 20, to: 0 },
    },
  },
  slideIn: {
    name: '슬라이드 인',
    duration: 300,
    easing: 'easeOut',
    properties: {
      opacity: { from: 0, to: 1 },
      translateX: { from: -20, to: 0 },
    },
  },
  scale: {
    name: '스케일',
    duration: 250,
    easing: 'easeOutBack',
    properties: {
      opacity: { from: 0, to: 1 },
      scale: { from: 0.8, to: 1 },
    },
  },
  pop: {
    name: '팝',
    duration: 400,
    easing: 'spring',
    properties: {
      opacity: { from: 0, to: 1 },
      scale: { from: 0.5, to: 1 },
    },
  },
  bounceIn: {
    name: '바운스',
    duration: 500,
    easing: 'easeOutElastic',
    properties: {
      opacity: { from: 0, to: 1 },
      scale: { from: 0.3, to: 1 },
    },
  },
};

/**
 * 트랜지션 프레임 생성
 * @param {string} presetName - 프리셋 이름
 * @param {Object} options - 옵션
 * @returns {Array<{timestamp: number, styles: Object}>}
 */
export function generateTransitionFrames(presetName, options = {}) {
  const { fps = 60, customDuration = null } = options;
  const preset = TRANSITION_PRESETS[presetName] || TRANSITION_PRESETS.fadeIn;

  if (preset.duration === 0) {
    return [{ timestamp: 0, styles: getEndStyles(preset) }];
  }

  const duration = customDuration || preset.duration;
  const frameCount = Math.ceil((duration / 1000) * fps);
  const easingFn = EASING[preset.easing] || EASING.linear;
  const frames = [];

  for (let i = 0; i <= frameCount; i++) {
    const t = i / frameCount;
    const easedT = easingFn(t);

    const styles = {};
    for (const [prop, range] of Object.entries(preset.properties)) {
      styles[prop] = range.from + (range.to - range.from) * easedT;
    }

    frames.push({
      timestamp: (i / frameCount) * duration,
      progress: t,
      styles,
    });
  }

  return frames;
}

/**
 * 스타일 객체를 CSS 문자열로 변환
 * @param {Object} styles - 스타일 객체
 * @returns {Object} CSS 스타일 객체
 */
export function stylesToCSS(styles) {
  const css = {};

  if (styles.opacity !== undefined) {
    css.opacity = styles.opacity;
  }

  const transforms = [];
  if (styles.translateX !== undefined) {
    transforms.push(`translateX(${styles.translateX}px)`);
  }
  if (styles.translateY !== undefined) {
    transforms.push(`translateY(${styles.translateY}px)`);
  }
  if (styles.scale !== undefined) {
    transforms.push(`scale(${styles.scale})`);
  }
  if (styles.rotate !== undefined) {
    transforms.push(`rotate(${styles.rotate}deg)`);
  }

  if (transforms.length > 0) {
    css.transform = transforms.join(' ');
  }

  return css;
}

/**
 * 진행률에 따른 현재 스타일 계산
 * @param {string} presetName - 프리셋 이름
 * @param {number} progress - 진행률 (0-1)
 * @returns {Object} CSS 스타일 객체
 */
export function getTransitionStyles(presetName, progress) {
  const preset = TRANSITION_PRESETS[presetName] || TRANSITION_PRESETS.fadeIn;

  if (preset.duration === 0 || progress >= 1) {
    return stylesToCSS(getEndStyles(preset));
  }

  const easingFn = EASING[preset.easing] || EASING.linear;
  const easedProgress = easingFn(Math.min(1, Math.max(0, progress)));

  const styles = {};
  for (const [prop, range] of Object.entries(preset.properties)) {
    styles[prop] = range.from + (range.to - range.from) * easedProgress;
  }

  return stylesToCSS(styles);
}

/**
 * 메시지 배열에 등장 애니메이션 적용
 * @param {Array} messages - 메시지 배열
 * @param {Object} options - 옵션
 * @returns {Array} 애니메이션 정보가 추가된 배열
 */
export function applyEntranceAnimation(messages, options = {}) {
  const {
    preset = 'slideUp',
    stagger = 100, // 메시지 간 딜레이 (ms)
  } = options;

  const transitionPreset = TRANSITION_PRESETS[preset] || TRANSITION_PRESETS.slideUp;

  return messages.map((message, index) => ({
    ...message,
    animation: {
      preset,
      startTime: index * stagger,
      duration: transitionPreset.duration,
      endTime: index * stagger + transitionPreset.duration,
    },
  }));
}

/**
 * 현재 타임스탬프에서 메시지 표시 상태 계산
 * @param {Array} animatedMessages - 애니메이션 정보가 있는 메시지 배열
 * @param {number} currentTime - 현재 시간 (ms)
 * @returns {Array} 각 메시지의 표시 상태
 */
export function getMessageStates(animatedMessages, currentTime) {
  return animatedMessages.map((message) => {
    const { animation } = message;

    if (currentTime < animation.startTime) {
      return { visible: false, progress: 0, styles: {} };
    }

    if (currentTime >= animation.endTime) {
      return { visible: true, progress: 1, styles: {} };
    }

    const elapsed = currentTime - animation.startTime;
    const progress = elapsed / animation.duration;

    return {
      visible: true,
      progress,
      styles: getTransitionStyles(animation.preset, progress),
    };
  });
}

// 헬퍼 함수
function getEndStyles(preset) {
  const styles = {};
  for (const [prop, range] of Object.entries(preset.properties)) {
    styles[prop] = range.to;
  }
  return styles;
}

export default {
  EASING,
  TRANSITION_PRESETS,
  generateTransitionFrames,
  stylesToCSS,
  getTransitionStyles,
  applyEntranceAnimation,
  getMessageStates,
};
