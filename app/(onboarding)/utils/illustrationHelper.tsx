import LottieView from "lottie-react-native";
import { Dimensions, View } from "react-native";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get('window');

export default function getCurrentIllustration(id: string) {
  switch (id) {
    case "select-school-service":
      return <LottieView autoPlay loop={false} style={{ width: width * 0.5, height: width * 0.5 }} source={require('@/assets/lotties/school-services.json')} />
    case "select-univ-service":
      return <LottieView autoPlay loop={false} style={{ width: width * 0.5, height: width * 0.5 }} source={require('@/assets/lotties/uni-services.json')} />
    case "select-method":
      return <LottieView autoPlay loop={false} style={{ width: width * 0.5, height: width * 0.5 }} source={require('@/assets/lotties/connexion.json')} />
    case "enter-url":
      return (
        <View style={{
          flex: 1,
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 4
        }}>
          <LinkIcon />
        </View>
      )
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