import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

// ─── Assets ───────────────────────────────────────────────────────────────
const IMG1 = "https://res.cloudinary.com/dtlybacjm/image/upload/v1774478066/Image_25-03-2026_a%CC%80_23.30_oxxqqe.png";
const IMG2 = "https://res.cloudinary.com/dtlybacjm/image/upload/v1774478052/Image_25-03-2026_a%CC%80_23.31_lpm4xo.png";
const IMG3 = "https://res.cloudinary.com/dtlybacjm/image/upload/v1774478060/Image_25-03-2026_a%CC%80_23.31_1_bappod.png";
const IMG4 = "https://res.cloudinary.com/dtlybacjm/image/upload/v1774478060/Image_25-03-2026_a%CC%80_23.32_ed96lh.png";
const IMG_MOBILE = "https://res.cloudinary.com/dtlybacjm/image/upload/v1774478412/IMG_5122_luigwi.jpg";

// ─── Constants ────────────────────────────────────────────────────────────
const W = 1920;
const H = 1080;
const RED = "#CC0000";
const BLACK = "#000000";
const WHITE = "#ffffff";
const BEBAS = "'Bebas Neue', 'Arial Narrow', Impact, sans-serif";

// Scene timings (frames at 30fps)
const S1_START = 0;    // 0s  – title card
const S2_START = 120;  // 4s  – screenshot 1 slide from right
const S3_START = 270;  // 9s  – screenshot 2 reveal from bottom
const S4_START = 390;  // 13s – screenshots 3+4 pop
const S5_START = 510;  // 17s – mobile + pulsing CTA
export const VIDEO_FRAMES = 600; // 20s

// ─── Scene 1 : Typewriter title ───────────────────────────────────────────
const TITLE = "BOOKING CLUB";
const CHARS_PER_FRAME = TITLE.length / 65; // full title by frame ~65

const Scene1 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const charsVisible = Math.min(TITLE.length, Math.floor(frame * CHARS_PER_FRAME) + 1);
  const showCursor = frame < 70 && Math.floor(frame / 8) % 2 === 0;

  const subtitleY = spring({ frame: Math.max(0, frame - 70), fps, config: { damping: 18, stiffness: 80 } });
  const subtitleOpacity = interpolate(subtitleY, [0, 1], [0, 1]);

  const stackOpacity = interpolate(frame, [95, 115], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const stackX = interpolate(frame, [95, 115], [-40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        background: BLACK,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 120px",
      }}
    >
      {/* Decorative top line */}
      <div style={{ width: 80, height: 2, background: RED, marginBottom: 32 }} />

      {/* Title typewriter */}
      <h1
        style={{
          fontFamily: BEBAS,
          fontSize: 200,
          color: WHITE,
          letterSpacing: "0.04em",
          lineHeight: 0.88,
          margin: 0,
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        {TITLE.slice(0, charsVisible)}
        {showCursor && (
          <span style={{ color: RED, marginLeft: 4 }}>|</span>
        )}
      </h1>

      {/* Subtitle */}
      <p
        style={{
          opacity: subtitleOpacity,
          transform: `translateY(${interpolate(subtitleY, [0, 1], [20, 0])}px)`,
          color: "rgba(255,255,255,0.65)",
          fontSize: 30,
          fontFamily: "Inter, sans-serif",
          fontWeight: 300,
          letterSpacing: "0.04em",
          marginTop: 28,
          marginBottom: 0,
        }}
      >
        Full-stack booking system for sports clubs
      </p>

      {/* Stack */}
      <p
        style={{
          opacity: stackOpacity,
          transform: `translateX(${stackX}px)`,
          color: RED,
          fontSize: 18,
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          marginTop: 20,
          marginBottom: 0,
        }}
      >
        Rails &nbsp;/&nbsp; PostgreSQL &nbsp;/&nbsp; Stripe
      </p>
    </AbsoluteFill>
  );
};

// ─── Scene 2 : Screenshot 1 – slide from right ────────────────────────────
const Scene2 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({ frame, fps, config: { damping: 22, stiffness: 70, mass: 1 } });
  const translateX = interpolate(slideIn, [0, 1], [W, 0]);
  const scale = interpolate(frame, [30, 150], [1.0, 1.05], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  return (
    <AbsoluteFill style={{ background: WHITE, overflow: "hidden" }}>
      <img
        src={IMG1}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          transform: `translateX(${translateX}px) scale(${scale})`,
          transformOrigin: "center center",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Scene 3 : Screenshot 2 – reveal from bottom ─────────────────────────
const Scene3 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const revealIn = spring({ frame, fps, config: { damping: 20, stiffness: 65, mass: 1.1 } });
  const translateY = interpolate(revealIn, [0, 1], [H, 0]);

  return (
    <AbsoluteFill style={{ background: WHITE, overflow: "hidden" }}>
      <img
        src={IMG2}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          transform: `translateY(${translateY}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Scene 4 : Screenshots 3 & 4 – staggered pop ─────────────────────────
const Scene4 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cfg = { damping: 14, stiffness: 150, mass: 0.8 };

  const pop1 = spring({ frame, fps, config: cfg });
  const pop2 = spring({ frame: Math.max(0, frame - 18), fps, config: cfg });

  const imgStyle = (progress) => ({
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transform: `scale(${progress})`,
    opacity: progress,
  });

  return (
    <AbsoluteFill
      style={{
        background: BLACK,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 4,
        overflow: "hidden",
      }}
    >
      <div style={{ overflow: "hidden" }}>
        <img src={IMG3} style={imgStyle(pop1)} />
      </div>
      <div style={{ overflow: "hidden" }}>
        <img src={IMG4} style={imgStyle(pop2)} />
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 5 : Mobile + pulsing CTA ──────────────────────────────────────
const Scene5 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mobileIn = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });
  const mobileOpacity = interpolate(mobileIn, [0, 1], [0, 1]);
  const mobileScale = interpolate(mobileIn, [0, 1], [0.88, 1]);

  const ctaOpacity = interpolate(frame, [45, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulse: smooth sine oscillation
  const pulse = 1 + Math.sin(frame * 0.18) * 0.06;

  return (
    <AbsoluteFill
      style={{
        background: BLACK,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 48,
      }}
    >
      {/* Mobile screenshot */}
      <div
        style={{
          opacity: mobileOpacity,
          transform: `scale(${mobileScale})`,
          width: 340,
          height: 600,
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <img
          src={IMG_MOBILE}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>

      {/* Pulsing CTA */}
      <div
        style={{
          opacity: ctaOpacity,
          transform: `scale(${pulse})`,
          fontFamily: BEBAS,
          fontSize: 56,
          color: RED,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        LIVE DEMO &rarr;
      </div>

      {/* URL hint */}
      <p
        style={{
          opacity: ctaOpacity * 0.45,
          fontFamily: "Inter, sans-serif",
          fontSize: 16,
          color: WHITE,
          letterSpacing: "0.08em",
          marginTop: -32,
        }}
      >
        reservation-club-demo.herokuapp.com
      </p>
    </AbsoluteFill>
  );
};

// ─── Root composition ─────────────────────────────────────────────────────
export const BookingClubVideo = () => {
  return (
    <AbsoluteFill style={{ background: BLACK }}>
      <Sequence from={S1_START} durationInFrames={S2_START - S1_START}>
        <Scene1 />
      </Sequence>
      <Sequence from={S2_START} durationInFrames={S3_START - S2_START}>
        <Scene2 />
      </Sequence>
      <Sequence from={S3_START} durationInFrames={S4_START - S3_START}>
        <Scene3 />
      </Sequence>
      <Sequence from={S4_START} durationInFrames={S5_START - S4_START}>
        <Scene4 />
      </Sequence>
      <Sequence from={S5_START} durationInFrames={VIDEO_FRAMES - S5_START}>
        <Scene5 />
      </Sequence>
    </AbsoluteFill>
  );
};
