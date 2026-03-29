import { Composition } from "remotion";
import { HelloWorld } from "./compositions/HelloWorld";
import { CurvedCarousel } from "./compositions/CurvedCarousel";
import { BookingClubShowcase, TOTAL_FRAMES } from "./compositions/BookingClubShowcase";
import { BookingClubVideo, VIDEO_FRAMES } from "./compositions/BookingClubVideo";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="CurvedCarousel"
        component={CurvedCarousel}
        durationInFrames={9999}
        fps={30}
        width={1200}
        height={600}
      />
      <Composition
        id="BookingClubShowcase"
        component={BookingClubShowcase}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1440}
        height={810}
      />
      <Composition
        id="BookingClubVideo"
        component={BookingClubVideo}
        durationInFrames={VIDEO_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
