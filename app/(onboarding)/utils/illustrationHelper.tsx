import LottieView from "lottie-react-native";
import { Dimensions, View } from "react-native";
import Svg, { Circle, Mask, Path } from "react-native-svg";

const { width } = Dimensions.get('window');

export default function getCurrentIllustration(id: string) {
  const baseSize = width * 0.5;

  switch (id) {
    case "select-school-service":
      return (
        <LottieView
          autoPlay
          loop={false}
          style={{ width: baseSize, height: baseSize }}
          source={require('@/assets/lotties/school-services.json')}
        />
      );
    case "select-univ-service":
      return (
        <LottieView
          autoPlay
          loop={false}
          style={{ width: baseSize, height: baseSize }}
          source={require('@/assets/lotties/uni-services.json')}
        />
      );
    case "select-method":
      return (
        <LottieView
          autoPlay
          loop={false}
          style={{ width: baseSize, height: baseSize }}
          source={require('@/assets/lotties/connexion.json')}
        />
      );
    case "enter-url":
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <LinkIcon />
        </View>
      );
    case "location-select":
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <MapIcon />
        </View>
      );
    default:
      return null;
  }
}

const LinkIcon = () => (
  <Svg
    width={182}
    height={139}
    fill="none"
  >
    <Path
      fill="#fff"
      d="M139.878 31.3C130.977 13.247 112.399.814 90.887.814L51.86.884C23 2.348.062 26.2.062 55.413l.07 2.795c1.242 24.52 18.64 44.755 41.765 50.294 8.51 17.265 25.866 29.387 46.193 30.419l39.027.069c29.214 0 53.067-22.937 54.53-51.799l.068-2.795c0-25.76-17.835-47.347-41.837-53.096Z"
    />
    <Path
      fill="#9A9A9A"
      d="M90.887 15.558c18.262 0 33.655 12.285 38.368 29.041 21.016 1.111 37.716 18.504 37.716 39.797l-.05 2.05c-1.067 21.056-18.481 37.8-39.804 37.8H90.89l-2.053-.051c-17.356-.88-31.782-12.864-36.316-28.99-20.338-1.074-36.633-17.394-37.664-37.743l-.051-2.05c0-21.321 16.744-38.735 37.8-39.803l2.054-.05h36.227Zm38.979 48.187c-3.832 18.009-19.827 31.518-38.979 31.518H73.115c3.661 5.977 10.252 9.965 17.775 9.965h36.227c11.505 0 20.836-9.327 20.836-20.832 0-10.573-7.88-19.306-18.087-20.651Zm-38.976-.18c-8.612 0-16.002 5.226-19.175 12.679h19.172c8.612 0 16.004-5.226 19.179-12.679H90.89ZM54.66 34.581c-11.505 0-20.832 9.326-20.832 20.832.001 10.573 7.878 19.305 18.083 20.65 3.694-17.363 18.692-30.546 36.926-31.47l2.053-.051h17.773C105 38.567 98.408 34.58 90.887 34.58H54.66Z"
    />
  </Svg>
)

const MapIcon = () => (
  <Svg
    width={117}
    height={131}
    fill="none"
  >
    <Mask
      id="a"
      width={127.369}
      height={139.247}
      x={-4.187}
      y={-3.99}
      fill="#000"
      maskUnits="userSpaceOnUse"
    >
      <Path fill="#fff" d="M-4.187-3.99h127.369v139.247H-4.187z" />
      <Path d="M54.88 12.834c35.383-2.825 62.674 32.76 43.413 62.617-8.019 12.43-19.837 28.807-27.269 38.938a10.147 10.147 0 0 1-15.294 1.271c-9.003-8.764-23.364-22.965-33.325-33.9-23.927-26.265-2.888-65.87 32.476-68.926Z" />
    </Mask>
    <Path
      fill="#DB006E"
      d="M54.88 12.834c35.383-2.825 62.674 32.76 43.413 62.617-8.019 12.43-19.837 28.807-27.269 38.938a10.147 10.147 0 0 1-15.294 1.271c-9.003-8.764-23.364-22.965-33.325-33.9-23.927-26.265-2.888-65.87 32.476-68.926Z"
    />
    <Path
      fill="#fff"
      d="m54.88 12.834-.932-11.676-.038.003-.038.004 1.009 11.67Zm43.413 62.617-9.842-6.35 9.842 6.35Zm-27.269 38.938 9.445 6.928-9.444-6.928ZM55.73 115.66l-8.17 8.393 8.17-8.393Zm-33.325-33.9-8.66 7.888 8.66-7.888ZM54.88 12.834l.932 11.676c13.491-1.077 25.248 5.177 31.76 14.22 6.34 8.807 7.613 19.93.878 30.37l9.842 6.35 9.843 6.35c12.525-19.415 9.783-41.013-1.552-56.757C95.419 9.536 75.839-.59 53.948 1.158l.933 11.676Zm43.412 62.617-9.842-6.35C80.64 81.206 69.01 97.333 61.58 107.46l9.444 6.929 9.444 6.928c7.434-10.134 19.439-26.762 27.667-39.517l-9.843-6.35Zm-27.269 38.938-9.444-6.929c.541-.737 1.665-.831 2.32-.193l-8.17 8.393-8.17 8.393c9.54 9.288 25.033 7.999 32.909-2.736l-9.444-6.928ZM55.73 115.66l8.17-8.393c-9-8.76-23.135-22.745-32.836-33.395l-8.66 7.888-8.658 7.888c10.222 11.221 24.807 25.638 33.813 34.405l8.17-8.393Zm-33.325-33.9 8.659-7.888c-8.367-9.185-8.949-20.365-4.15-30.098 4.929-9.995 15.491-18.105 28.975-19.27l-1.008-11.67-1.009-11.67c-21.88 1.891-39.518 15.112-47.968 32.25-8.58 17.4-7.718 39.154 7.842 56.234l8.659-7.888Z"
      mask="url(#a)"
    />
    <Circle
      cx={57.462}
      cy={54.521}
      r={15.529}
      fill="#fff"
      transform="rotate(-4.753 57.462 54.52)"
    />
  </Svg>
);