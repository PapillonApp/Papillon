import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, Clipboard } from "react-native";
import { Check, ChevronDown, ChevronUp, Link2Icon } from "lucide-react-native";
import parse_homeworks from "@/utils/format/format_pronote_homeworks";
import { getSubjectData } from "@/services/shared/Subject";
import { useTheme } from "@react-navigation/native";
import type { Homework } from "@/services/shared/Homework";
import { NativeItem, NativeText } from "@/components/Global/NativeComponents";
import PapillonCheckbox from "@/components/Global/PapillonCheckbox";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import * as WebBrowser from "expo-web-browser";

const HomeworkItem = React.memo(({ homework, onDonePressHandler, index, total }: {
  homework: Homework,
  onDonePressHandler: () => unknown,
  index: number,
  total: number
}) => {
  const theme = useTheme();
  const { colors } = theme;
  const [subjectData, setSubjectData] = useState(getSubjectData(homework.subject));

  const openUrl = async (url: string) => {
    await WebBrowser.openBrowserAsync(url, {
      controlsColor: colors.primary,
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    });
  };

  useEffect(() => {
    const data = getSubjectData(homework.subject);
    setSubjectData(data);
  }, [homework.subject]);

  const [isLoading, setIsLoading] = useState(false);

  const handlePress = useCallback(() => {
    setIsLoading(true);
    onDonePressHandler();
  }, [onDonePressHandler]);

  const [mainLoaded, setMainLoaded] = useState(false);

  useEffect(() => {
    setIsLoading(false);
    setMainLoaded(true);
  }, [homework.done]);

  var parsedContent = useMemo(() => parse_homeworks(homework.content), [homework.content]);

  const [expanded, setExpanded] = useState(false);

  const rotateStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: withTiming(expanded ? "0deg" : "180deg") }],
    };
  });
  const extractUrls = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let urls: any = text.match(urlRegex);
    if (urls) {
      urls = urls.map((url:string) => url.replace(/<br>/g, "").replace(/<\/?div>/g, ""));
    }
    return urls || [];
  };

  const urls: string[] = extractUrls(homework.content);
  const contentWithoutUrls = useMemo(() => homework.content.replace(/https?:\/\/[^\s]+/g, ""), [homework.content]);
  parsedContent = useMemo(() => parse_homeworks(contentWithoutUrls), [contentWithoutUrls]);
  const [needsExpansion, setNeedsExpansion] = useState(false);

  const onTextLayout = useCallback((e:any) => {
    const linesNumber = e.nativeEvent.lines.length;
    setNeedsExpansion(linesNumber > 3 || urls.length > 0);
  }, []);

  return (
    <NativeItem
      separator={index !== total - 1}
      onPress={() => setExpanded(!expanded)}
      chevron={false}
      leading={
        <PapillonCheckbox
          checked={homework.done}
          loading={isLoading}
          onPress={handlePress}
          style={{ marginRight: 1 }}
          color={subjectData.color}
          loaded={mainLoaded}
        />
      }
    >
      <TouchableOpacity
        onPress={() => needsExpansion && setExpanded(!expanded)}
        style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
      >
        <View style={{ flex: 1 }}>
          <NativeText variant="overtitle" style={{ color: subjectData.color }} numberOfLines={1}>
            {subjectData.pretty}
          </NativeText>
          <NativeText
            variant="default"
            numberOfLines={expanded ? undefined : 3}
            onTextLayout={onTextLayout}
            style={{
              textAlign: "left",
            }}
          >
            {parsedContent}
          </NativeText>
          {urls.length > 0 && expanded && (
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {urls.map((url, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => openUrl(url)}
                  onLongPress={() => Clipboard.setString(url)}
                  style={{
                    flexDirection: "row",
                    width: "95%",
                    alignItems: "center",
                    marginRight: 8,
                  }}
                >
                  <Link2Icon size={15} color={colors.primary} />
                  <Text
                    style={{
                      color: colors.primary,
                      marginLeft: 5,
                      width: "100%",
                    }}
                    numberOfLines={1}
                  >
                    {url}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        {needsExpansion && (
          <Animated.View style={[{ marginLeft: 8 }, rotateStyle]}>
            <ChevronUp size={20} color={theme.colors.text} />
          </Animated.View>
        )}
      </TouchableOpacity>
    </NativeItem>
  );
}, (prevProps, nextProps) => prevProps.index === nextProps.index);

export default HomeworkItem;