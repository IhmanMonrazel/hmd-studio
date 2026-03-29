import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";

const IMAGES = [
  "https://res.cloudinary.com/dtlybacjm/image/upload/v1774478066/Image_25-03-2026_a%CC%80_23.30_oxxqqe.png",
  "https://res.cloudinary.com/dtlybacjm/image/upload/v1774478052/Image_25-03-2026_a%CC%80_23.31_lpm4xo.png",
  "https://res.cloudinary.com/dtlybacjm/image/upload/v1774478060/Image_25-03-2026_a%CC%80_23.31_1_bappod.png",
  "https://res.cloudinary.com/dtlybacjm/image/upload/v1774478060/Image_25-03-2026_a%CC%80_23.32_ed96lh.png",
  "https://res.cloudinary.com/dtlybacjm/image/upload/v1774478057/Image_25-03-2026_a%CC%80_23.32_1_yrtmjd.png",
  "https://res.cloudinary.com/dtlybacjm/image/upload/v1774478412/IMG_5122_luigwi.jpg",
];

// Each image: 90 frames (3s at 30fps), overlap by 15 frames for crossfade
const FRAMES_PER_IMAGE = 90;
const OVERLAP = 15;
const STEP = FRAMES_PER_IMAGE - OVERLAP; // 75 frames between starts
export const TOTAL_FRAMES = STEP * (IMAGES.length - 1) + FRAMES_PER_IMAGE; // 450

const ImageSlide = ({ src }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, OVERLAP, FRAMES_PER_IMAGE - OVERLAP, FRAMES_PER_IMAGE],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const scale = interpolate(
    frame,
    [0, FRAMES_PER_IMAGE],
    [1.06, 1.0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill>
      <img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
          opacity,
          display: "block",
        }}
      />
    </AbsoluteFill>
  );
};

export const BookingClubShowcase = () => {
  return (
    <AbsoluteFill style={{ background: "#000000" }}>
      {IMAGES.map((src, i) => (
        <Sequence
          key={i}
          from={i * STEP}
          durationInFrames={FRAMES_PER_IMAGE}
        >
          <ImageSlide src={src} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
