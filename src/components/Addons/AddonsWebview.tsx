import { Dimensions, Image, View } from "react-native";
import { WebView } from "react-native-webview";
import { NativeText } from "@/components/Global/NativeComponents";
import React, { useEffect } from "react";
import { Frown, MapPin } from "lucide-react-native";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import BottomSheet from "@/components/Modals/PapillonBottomSheet";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import Reanimated, { Easing, useSharedValue, withTiming } from "react-native-reanimated";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteParameters } from "@/router/helpers/types";
import { get_iso_date } from "@/utils/logger/logger";
import {AddonLogs} from "@/addons/types";

export type AddonHomePageInfo = {
  name: string,
  icon?: string,
  url: string
};

interface AddonsWebviewProps {
  setTitle?: (message: string) => unknown,
  addon: AddonHomePageInfo
  url: string
  navigation: NativeStackNavigationProp<RouteParameters, "AddonPage" | "HomeScreen">
  scrollEnabled?: boolean
  inset?: Record<"top" | "left"| "bottom" | "right", number>
  requestNavigate?: (to: string, params: unknown) => unknown
  data?: unknown
}

const AddonsWebview: React.FC<AddonsWebviewProps> = ({
  setTitle,
  addon,
  url,
  navigation,
  scrollEnabled = false,
  inset = { top: 0, left: 0, right: 0, bottom: 0 },
  requestNavigate,
  data
}) => {
  const theme = useTheme();
  const { colors } = theme;
  let [ error, setError ] = React.useState(false);
  let [ content, setContent] = React.useState("");
  let [ injectedJS, setInjectedJS ] = React.useState("");
  let [ logs, setLogs ] = React.useState<AddonLogs[]>([]);
  let [ showAuthorizations, setShowAuthorizations ] = React.useState(false);
  let webview = React.useRef<WebView | null>(null);
  let title = "";

  //animation opacity
  const opacity = useSharedValue(0);

  function get_plugin_path () {
    let path = url.split("/");
    var res = "";
    for (var i = 0; i < path.length - 1; i++) {
      res += path[i] + "/";
      if (path[i] === "addons")
      {
        res += path[i + 1] + "/";
        return res;
      }
    }
    return res;
  }

  async function load_fonts () {
    let bold = await Asset.fromModule(require("../../../assets/fonts/FixelText-Bold.ttf")).downloadAsync();
    let semiBold = await Asset.fromModule(require("../../../assets/fonts/FixelText-SemiBold.ttf")).downloadAsync();
    let medium = await Asset.fromModule(require("../../../assets/fonts/FixelText-Medium.ttf")).downloadAsync();
    let regular = await Asset.fromModule(require("../../../assets/fonts/FixelText-Regular.ttf")).downloadAsync();
    let light = await Asset.fromModule(require("../../../assets/fonts/FixelText-Light.ttf")).downloadAsync();
    return {
      bold: bold.uri,
      semiBold: semiBold.uri,
      medium: medium.uri,
      regular: regular.uri,
      light: light.uri,
    };
  }

  async function load_css () {
    let css = await Asset.fromModule(require("../../addons/addons_stylesheet.css")).downloadAsync();
    return await FileSystem.readAsStringAsync(css.localUri || "");
  }

  async function load_js () {
    let js = await Asset.fromModule(require("../../addons/addons_modules.rawjs")).downloadAsync();
    return await FileSystem.readAsStringAsync(js.localUri || "");
  }

  async function load_content () {
    let path = get_plugin_path();
    let file = await FileSystem.readAsStringAsync(url);
    file = file.replaceAll("./", path);
    if (data) {
      file = `<script>let params = ${JSON.stringify(data)};</script>${file}`;
    }
    return file;
  }

  function inject_css (css: string, fonts: { bold: string, semiBold: string, medium: string, regular: string, light: string}) {
    css = css.replace("{{FONT_BOLD}}", fonts.bold);
    css = css.replace("{{FONT_SEMIBOLD}}", fonts.semiBold);
    css = css.replace("{{FONT_MEDIUM}}", fonts.medium);
    css = css.replace("{{FONT_REGULAR}}", fonts.regular);
    css = css.replace("{{FONT_LIGHT}}", fonts.light);
    css = css.replace("{{PRIMARY_COLOR}}", colors.primary);
    css = css.replace("{{BACKGROUND_COLOR}}", colors.background);
    css = css.replace("{{TEXT_COLOR}}", colors.text);
    css = css.replace("{{SEPARATOR_COLOR}}", colors.text + "33");
    css = css.replace("{{INSET_TOP}}", String(inset.top));
    css = css.replace("{{INSET_BOTTOM}}", String(inset.bottom));
    css = css.replace("{{INSET_LEFT}}", String(inset.left));
    css = css.replace("{{INSET_RIGHT}}", String(inset.right));
    return css;
  }

  function inject_js (js: string, css: string) {
    return js.replace("{{STYLESHEET}}", css);
  }

  async function load_addon () {
    let fonts = load_fonts();
    let css = load_css();
    let js = load_js();
    let content = load_content();

    Promise.all([fonts, css, js, content]).then((values) => {
      let css = inject_css(values[1], values[0]);
      let js = inject_js(values[2], css);
      setContent(values[3]);
      setInjectedJS(js);
    }).catch(() => {
      setError(true);
    });
  }

  useEffect(() => {
    load_addon();
  }, [content, injectedJS, error, logs, showAuthorizations]);

  return (
    <Reanimated.View style={{flex: 1, opacity}}>
      <BottomSheet opened={showAuthorizations} setOpened={setShowAuthorizations}>
        <View style={{height: 23, display: "flex", alignItems: "center", justifyContent: "center"}}>
          <View style={{
            backgroundColor: "#00000015",
            height: 5,
            width: 50,
            borderRadius: 5,
          }}></View>
        </View>
        <View style={{padding: 16, display: "flex", flexDirection: "row", gap: 16}}>
          <View>
            <Image
              source={addon.icon ? {uri: addon.icon}:require("../../../assets/images/addon_default_logo.png")}
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: "#00000015",
              }}
            />
            <View style={{
              padding: 5,
              backgroundColor: colors.primary,
              position: "absolute",
              borderRadius: 100,
              borderColor: colors.background,
              borderWidth: 4,
              top: 32,
              left: 32
            }}>
              <MapPin size={24} color={"#FFF"} />
            </View>
          </View>
          <View style={{flex: 1, display: "flex", gap: 5}}>
            <NativeText variant="title">{addon.name + " requiert ta position"}</NativeText>
            <NativeText variant="subtitle">L'extension indique : Nous utilisons ta position pour te manger durant ton sommeil 😈</NativeText>
          </View>
        </View>
        <View style={{paddingHorizontal: 16, display: "flex", flexDirection: "row", gap: 10, height: 48}}>
          <ButtonCta value={"Refuser"} onPress={() => setShowAuthorizations(false)} style={{minWidth: null, maxWidth: null, width: (Dimensions.get("window").width - 42) / 2}} />
          <ButtonCta value={"Autoriser"} primary onPress={() => setShowAuthorizations(false)}  style={{minWidth: null, maxWidth: null, width: (Dimensions.get("window").width - 42) / 2}}/>
        </View>
      </BottomSheet>
      {
        error ?
          (
            <View style={{display: "flex", alignItems: "center", justifyContent: "center", height: "100%", gap: 10}}>
              <Frown size={32} color={"#000"}/>
              <NativeText variant="title" style={{textAlign: "center"}}>L'extension à planté...</NativeText>
            </View>
          )
          :
          (
            <WebView
              onLoadEnd={() => {
                opacity.value = withTiming(1, {
                  duration: 100,
                  easing: Easing.inOut(Easing.quad),
                });
              }}
              allowFileAccessFromFileURLs={true}
              allowUniversalAccessFromFileURLs={true}
              webviewDebuggingEnabled={true}
              ref={webview}
              style={{ backgroundColor:"transparent"}}
              source={{ html: content }}
              scrollEnabled={scrollEnabled}
              onError={() => setError(true)}
              injectedJavaScript={injectedJS}
              originWhitelist={[get_plugin_path()]}
              onMessage={(event): void => {
                let data = JSON.parse(event.nativeEvent.data);
                // CHANGE TITLE
                if (data.type == "title") {
                  if (data.title != "" && data.title != title)
                  {
                    setTitle?.(data.title);
                  }
                }

                // CONSOLE.LOG
                if (data.type == "log") {
                  console.log(`[ADDON][${addon.name}] Log : ${data.message}`);
                  let log = {
                    message: data.message,
                    type: "log",
                    date: new Date(get_iso_date())
                  } satisfies AddonLogs;
                  setLogs([...logs, log]);
                }
                if (data.type == "error") {
                  console.log(`[ADDON][${addon.name}] Error : ${data.message}`);
                  let log = {
                    message: data.message,
                    type: "error",
                    date: new Date(get_iso_date())
                  } satisfies AddonLogs;
                  setLogs([...logs, log]);
                }
                if (data.type == "warn") {
                  console.log(`[ADDON][${addon.name}] Warning : ${data.message}`);
                  let log = {
                    message: data.message,
                    type: "warn",
                    date: new Date(get_iso_date())
                  } satisfies AddonLogs;
                  setLogs([...logs, log]);
                }
                if (data.type == "info") {
                  console.log(`[ADDON][${addon.name}] Info : ${data.message}`);
                  let log = {
                    message: data.message,
                    type: "info",
                    date: new Date(get_iso_date())
                  } satisfies AddonLogs;
                  setLogs([...logs, log]);
                }

                if (data.type == "open_logs") {

                  navigation.navigate("AddonLogs", {
                    logs,
                    name: addon.name
                  });
                }

                if (data.type == "request_permission") {
                  setShowAuthorizations(true);
                }

                if (data.type == "navigation_navigate") {
                  requestNavigate?.(data.to, {addon, data: data.params});
                }

                if (data.type == "get_user_location") {
                  webview.current?.postMessage("Hello from React Native!");
                }
              }}
            />
          )
      }
    </Reanimated.View>
  );
};

export default AddonsWebview;
