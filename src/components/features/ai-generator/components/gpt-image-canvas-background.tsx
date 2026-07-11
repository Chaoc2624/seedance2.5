import { useEffect, useRef } from 'react';

type ThemeMode = 'light' | 'dark';

type FloatingGlyph = {
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
  rotation: number;
  rotationSpeed: number;
  kind: number;
  color: string;
  opacity: number;
  scale: number;
};

type GlowOrb = {
  x: number;
  y: number;
  radius: number;
  phase: number;
  pulseSpeed: number;
  moveX: number;
  moveY: number;
  colorA: string;
  colorB: string;
};

type Scene = {
  glyphs: FloatingGlyph[];
  orbs: GlowOrb[];
};

const CANVAS_PALETTES: Record<
  ThemeMode,
  {
    glyphColors: string[];
    orbColors: string[][];
    glyphOpacityBase: number;
    glyphOpacityRange: number;
    glyphMinAlpha: number;
    glyphPulseBase: number;
    glyphPulseRange: number;
    orbInnerAlpha: number;
    orbMidAlpha: number;
    orbPulseBase: number;
    orbPulseRange: number;
    orbAlphaBase: number;
    orbAlphaRange: number;
    compositeOperation: GlobalCompositeOperation;
  }
> = {
  light: {
    glyphColors: [
      '15, 23, 42',
      '8, 96, 108',
      '14, 95, 78',
      '112, 72, 38',
      '101, 62, 88',
    ],
    orbColors: [
      ['92, 102, 112', '48, 121, 124'],
      ['137, 112, 82', '77, 112, 124'],
      ['105, 96, 132', '54, 123, 113'],
      ['128, 91, 118', '138, 108, 66'],
    ],
    glyphOpacityBase: 0.16,
    glyphOpacityRange: 0.12,
    glyphMinAlpha: 0.1,
    glyphPulseBase: 0.68,
    glyphPulseRange: 0.38,
    orbInnerAlpha: 0.14,
    orbMidAlpha: 0.058,
    orbPulseBase: 0.78,
    orbPulseRange: 0.34,
    orbAlphaBase: 0.72,
    orbAlphaRange: 0.34,
    compositeOperation: 'multiply',
  },
  dark: {
    glyphColors: [
      '112, 231, 255',
      '134, 239, 172',
      '250, 204, 21',
      '244, 114, 182',
      '196, 181, 253',
    ],
    orbColors: [
      ['112, 231, 255', '134, 239, 172'],
      ['244, 114, 182', '196, 181, 253'],
      ['250, 204, 21', '112, 231, 255'],
      ['134, 239, 172', '244, 114, 182'],
    ],
    glyphOpacityBase: 0.13,
    glyphOpacityRange: 0.2,
    glyphMinAlpha: 0.08,
    glyphPulseBase: 0.72,
    glyphPulseRange: 0.2,
    orbInnerAlpha: 0.14,
    orbMidAlpha: 0.07,
    orbPulseBase: 0.72,
    orbPulseRange: 0.18,
    orbAlphaBase: 1,
    orbAlphaRange: 0,
    compositeOperation: 'screen',
  },
};

function getThemeMode(): ThemeMode {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function seededRandom(seed: number) {
  let value = seed % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function strokeRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  roundedRect(ctx, x, y, width, height, radius);
  ctx.stroke();
}

function drawImageFrame(
  ctx: CanvasRenderingContext2D,
  size: number,
  color: string
) {
  ctx.lineWidth = Math.max(1, size * 0.028);
  ctx.strokeStyle = color;
  strokeRoundedRect(ctx, -size * 0.45, -size * 0.3, size * 0.9, size * 0.6, 7);

  ctx.beginPath();
  ctx.moveTo(-size * 0.34, size * 0.14);
  ctx.lineTo(-size * 0.1, -size * 0.04);
  ctx.lineTo(size * 0.06, size * 0.1);
  ctx.lineTo(size * 0.28, -size * 0.12);
  ctx.lineTo(size * 0.37, size * 0.14);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(size * 0.24, -size * 0.15, size * 0.05, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawAperture(
  ctx: CanvasRenderingContext2D,
  size: number,
  color: string
) {
  ctx.lineWidth = Math.max(1, size * 0.025);
  ctx.strokeStyle = color;
  for (let index = 0; index < 3; index += 1) {
    ctx.beginPath();
    ctx.arc(0, 0, size * (0.18 + index * 0.13), 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawPromptChip(
  ctx: CanvasRenderingContext2D,
  size: number,
  color: string
) {
  const width = size * 1.05;
  const height = size * 0.42;
  ctx.lineWidth = Math.max(1, size * 0.026);
  ctx.strokeStyle = color;
  strokeRoundedRect(ctx, -width / 2, -height / 2, width, height, height / 2);
  ctx.fillStyle = color;

  for (let index = 0; index < 4; index += 1) {
    const x = -width * 0.3 + index * size * 0.16;
    roundedRect(ctx, x, -size * 0.055, size * 0.07, size * 0.11, 2);
    ctx.fill();
  }
}

function drawSpark(ctx: CanvasRenderingContext2D, size: number, color: string) {
  ctx.lineWidth = Math.max(1.1, size * 0.03);
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.34);
  ctx.lineTo(0, size * 0.34);
  ctx.moveTo(-size * 0.34, 0);
  ctx.lineTo(size * 0.34, 0);
  ctx.moveTo(-size * 0.18, -size * 0.18);
  ctx.lineTo(size * 0.18, size * 0.18);
  ctx.moveTo(size * 0.18, -size * 0.18);
  ctx.lineTo(-size * 0.18, size * 0.18);
  ctx.stroke();
}

function drawTile(ctx: CanvasRenderingContext2D, size: number, color: string) {
  ctx.lineWidth = Math.max(1, size * 0.026);
  ctx.strokeStyle = color;
  strokeRoundedRect(ctx, -size * 0.3, -size * 0.3, size * 0.6, size * 0.6, 8);

  ctx.fillStyle = color;
  for (let index = 0; index < 4; index += 1) {
    const x = (index % 2 === 0 ? -1 : 1) * size * 0.12;
    const y = (index < 2 ? -1 : 1) * size * 0.12;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.035, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGlyph(
  ctx: CanvasRenderingContext2D,
  glyph: FloatingGlyph,
  time: number,
  width: number,
  height: number,
  animate: boolean,
  themeMode: ThemeMode
) {
  const palette = CANVAS_PALETTES[themeMode];
  const travel = height + 140;
  const y =
    ((((glyph.y - (animate ? time * glyph.speed : 0)) % travel) + travel) %
      travel) -
    70;
  const x = glyph.x + Math.sin(time * 0.34 + glyph.phase) * glyph.size * 0.16;
  const alpha =
    glyph.opacity *
    (palette.glyphPulseBase +
      Math.sin(time * 0.9 + glyph.phase) * palette.glyphPulseRange);

  if (x < -80 || x > width + 80 || y < -80 || y > height + 80) return;

  ctx.save();
  ctx.globalAlpha = Math.max(palette.glyphMinAlpha, alpha);
  ctx.translate(x, y);
  ctx.rotate(glyph.rotation + (animate ? time * glyph.rotationSpeed : 0));
  ctx.scale(glyph.scale, glyph.scale);

  const color = `rgb(${glyph.color})`;
  switch (glyph.kind) {
    case 0:
      drawImageFrame(ctx, glyph.size, color);
      break;
    case 1:
      drawAperture(ctx, glyph.size, color);
      break;
    case 2:
      drawPromptChip(ctx, glyph.size, color);
      break;
    case 3:
      drawSpark(ctx, glyph.size, color);
      break;
    default:
      drawTile(ctx, glyph.size, color);
      break;
  }

  ctx.restore();
}

function drawOrb(
  ctx: CanvasRenderingContext2D,
  orb: GlowOrb,
  width: number,
  height: number,
  animate: boolean,
  themeMode: ThemeMode
) {
  const palette = CANVAS_PALETTES[themeMode];

  if (animate) {
    orb.phase += orb.pulseSpeed;
    orb.x += orb.moveX;
    orb.y += orb.moveY;

    if (orb.x - orb.radius < 0 || orb.x + orb.radius > width) {
      orb.moveX *= -1;
    }
    if (orb.y - orb.radius < 0 || orb.y + orb.radius > height) {
      orb.moveY *= -1;
    }
  }

  const pulse =
    palette.orbPulseBase + Math.sin(orb.phase) * palette.orbPulseRange;
  const alphaPulse =
    palette.orbAlphaBase + Math.sin(orb.phase) * palette.orbAlphaRange;
  const radius = orb.radius * pulse;
  const gradient = ctx.createRadialGradient(
    orb.x,
    orb.y,
    0,
    orb.x,
    orb.y,
    radius
  );

  gradient.addColorStop(
    0,
    `rgba(${orb.colorA}, ${palette.orbInnerAlpha * alphaPulse})`
  );
  gradient.addColorStop(
    0.42,
    `rgba(${orb.colorB}, ${palette.orbMidAlpha * alphaPulse})`
  );
  gradient.addColorStop(1, `rgba(${orb.colorA}, 0)`);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(orb.x, orb.y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function createScene(
  width: number,
  height: number,
  themeMode: ThemeMode
): Scene {
  const palette = CANVAS_PALETTES[themeMode];
  const random = seededRandom(Math.round(width * 11 + height * 17 + 42));
  const area = width * height;
  const glyphCount = Math.max(22, Math.min(38, Math.round(area / 43000)));
  const orbCount = Math.max(4, Math.min(7, Math.round(area / 180000)));

  const glyphs = Array.from({ length: glyphCount }, (_, index) => ({
    x: random() * width,
    y: random() * (height + 140),
    size: 18 + random() * 28,
    speed: 14 + random() * 24,
    phase: random() * Math.PI * 2,
    rotation: random() * Math.PI * 2,
    rotationSpeed: (random() - 0.5) * 0.12,
    kind: index % 5,
    color: palette.glyphColors[index % palette.glyphColors.length],
    opacity: palette.glyphOpacityBase + random() * palette.glyphOpacityRange,
    scale: 0.74 + random() * 0.42,
  }));

  const orbs = Array.from({ length: orbCount }, (_, index) => {
    const colors = palette.orbColors[index % palette.orbColors.length];
    return {
      x: random() * width,
      y: random() * height,
      radius: 120 + random() * 190,
      phase: random() * Math.PI * 2,
      pulseSpeed: 0.01 + random() * 0.018,
      moveX: (random() - 0.5) * 0.28,
      moveY: (random() - 0.5) * 0.28,
      colorA: colors[0],
      colorB: colors[1],
    };
  });

  return { glyphs, orbs };
}

export function GPTImageCanvasBackground({
  themeMode: forcedThemeMode,
}: {
  themeMode?: ThemeMode;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    let animationFrame = 0;
    let resizeFrame = 0;
    let width = 1;
    let height = 1;
    let pixelRatio = 1;
    let themeMode = forcedThemeMode ?? getThemeMode();
    let scene = createScene(1200, 800, themeMode);
    let isVisible = false;

    const resize = () => {
      width = Math.max(
        1,
        window.document.documentElement.clientWidth || window.innerWidth
      );
      height = Math.max(1, window.innerHeight);
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);

      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      scene = createScene(width, height, themeMode);
    };

    const render = (timestamp = 0) => {
      const time = timestamp / 1000;
      context.clearRect(0, 0, width, height);

      context.save();
      context.globalCompositeOperation =
        CANVAS_PALETTES[themeMode].compositeOperation;
      for (const orb of scene.orbs) {
        drawOrb(context, orb, width, height, !reducedMotion, themeMode);
      }
      for (const glyph of scene.glyphs) {
        drawGlyph(
          context,
          glyph,
          time,
          width,
          height,
          !reducedMotion,
          themeMode
        );
      }
      context.restore();

      if (isVisible && !reducedMotion) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    const stop = () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    };

    const start = () => {
      stop();
      if (reducedMotion) {
        render(0);
        return;
      }

      animationFrame = window.requestAnimationFrame(render);
    };

    const scheduleResize = () => {
      if (resizeFrame) {
        window.cancelAnimationFrame(resizeFrame);
      }
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = 0;
        resize();
        if (isVisible) {
          start();
        } else {
          render(0);
        }
      });
    };

    const updateThemeMode = () => {
      const nextThemeMode = forcedThemeMode ?? getThemeMode();
      if (nextThemeMode === themeMode) return;

      themeMode = nextThemeMode;
      scene = createScene(width, height, themeMode);

      if (isVisible && document.visibilityState === 'visible') {
        start();
      } else {
        render(0);
      }
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = !!entry?.isIntersecting;
        if (isVisible && document.visibilityState === 'visible') {
          start();
        } else {
          stop();
        }
      },
      { rootMargin: '120px 0px 120px 0px' }
    );

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isVisible) {
        start();
      } else {
        stop();
      }
    };

    const themeObserver = new MutationObserver(updateThemeMode);

    resize();
    render(0);
    intersectionObserver.observe(canvas);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    window.addEventListener('resize', scheduleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      intersectionObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener('resize', scheduleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stop();
      if (resizeFrame) {
        window.cancelAnimationFrame(resizeFrame);
      }
    };
  }, [forcedThemeMode]);

  const blendClass =
    forcedThemeMode === 'dark'
      ? 'opacity-80 mix-blend-screen'
      : 'opacity-[0.88] mix-blend-multiply dark:opacity-80 dark:mix-blend-screen';

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 top-0 z-0 h-screen w-full ${blendClass}`}
    />
  );
}
