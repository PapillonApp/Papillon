import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { DotLottieReact, type DotLottie } from "@lottiefiles/dotlottie-react";

interface LottieViewProps {
  source: any;
  autoPlay?: boolean;
  loop?: boolean;
  style?: any;
}

export interface LottieViewHandle {
  play: () => void;
  reset: () => void;
}

// Metro is configured to treat .json as an asset (see metro.config.js),
// so require(".../xxx.json") can resolve either to the raw parsed JSON
// object OR to an asset descriptor ({ uri, width, height, ... }) depending
// on the platform. This normalizes both shapes (plus plain string URLs)
// into what @lottiefiles/dotlottie-react expects.
function resolveSource(source: any): { src?: string; data?: string } {
  if (typeof source === "string") {
    return { src: source };
  }
  if (source && typeof source === "object" && typeof source.uri === "string") {
    return { src: source.uri };
  }
  if (source) {
    return { data: JSON.stringify(source) };
  }
  return {};
}

// Web replacement for lottie-react-native's <LottieView>, used automatically
// by Metro on web builds (this file wins over LottieView.tsx for platform "web").
const LottieView = forwardRef<LottieViewHandle, LottieViewProps>(
  ({ source, autoPlay = false, loop = false, style }, ref) => {
    const dotLottieRef = useRef<DotLottie | null>(null);
    const { src, data } = resolveSource(source);

    useImperativeHandle(ref, () => ({
      play: () => dotLottieRef.current?.play(),
      reset: () => {
        dotLottieRef.current?.stop();
        dotLottieRef.current?.setFrame(0);
      },
    }));

    return (
      <DotLottieReact
        dotLottieRefCallback={(instance) => {
          dotLottieRef.current = instance;
        }}
        src={src}
        data={data}
        autoplay={autoPlay}
        loop={loop}
        style={style}
      />
    );
  }
);

LottieView.displayName = "LottieView";

export default LottieView;
