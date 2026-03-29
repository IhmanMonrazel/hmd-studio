import { Player } from "@remotion/player";
import { HelloWorld } from "../../../remotion/compositions/HelloWorld";
import { CurvedCarousel } from "../../../remotion/compositions/CurvedCarousel";
import { BookingClubShowcase } from "../../../remotion/compositions/BookingClubShowcase";
import { BookingClubVideo } from "../../../remotion/compositions/BookingClubVideo";

const COMPOSITIONS = {
  HelloWorld,
  CurvedCarousel,
  BookingClubShowcase,
  BookingClubVideo,
};

export const RemotionPlayer = ({
  component = "HelloWorld",
  durationInFrames = 150,
  fps = 30,
  width = 1440,
  height = 810,
  controls = false,
  loop = false,
  autoPlay = false,
}) => {
  const Comp = COMPOSITIONS[component];

  if (!Comp) {
    return <div style={{ color: "red" }}>Composition "{component}" introuvable.</div>;
  }

  return (
    <Player
      component={Comp}
      durationInFrames={durationInFrames}
      fps={fps}
      compositionWidth={width}
      compositionHeight={height}
      controls={controls}
      loop={loop}
      autoPlay={autoPlay}
      style={{ width: "100%" }}
      clickToPlay={false}
    />
  );
};
