import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const HelloWorld = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1
        style={{
          fontFamily: "sans-serif",
          fontSize: "6rem",
          color: "#ffffff",
          opacity,
          letterSpacing: "0.1em",
        }}
      >
        HMD STUDIO
      </h1>
    </AbsoluteFill>
  );
};
