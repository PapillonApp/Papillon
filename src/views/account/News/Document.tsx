import InsetsBottomView from "@/components/Global/InsetsBottomView";
import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import InitialIndicator from "@/components/News/InitialIndicator";
import { Information } from "@/services/shared/Information";
import formatDate from "@/utils/format/format_date_complets";
import { useTheme } from "@react-navigation/native";
import { FileIcon, Link, Sun, Moon } from "lucide-react-native";
import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import { View, Text, FlatList, ActivityIndicator, Dimensions, Linking, Animated } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { TouchableOpacity } from "react-native";

import RenderHtml from "react-native-render-html";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NewsItem = ({route, navigation}) => {
  const message = route.params.message && JSON.parse(route.params.message) as Information;
  const important = route.params.important;

  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [isWhiteBackground, setIsWhiteBackground] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggleBackground = () => {
    setIsWhiteBackground(prev => !prev);
    Animated.timing(rotateAnim, {
      toValue: isWhiteBackground ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: message.title,
      headerRight: () => {
        if (theme.dark) {
          return (
            <TouchableOpacity onPress={toggleBackground} style={{ width: 24, height: 24 }}>
              <Animated.View style={{
                position: "absolute",
                opacity: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
                transform: [{
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "90deg"],
                  })
                }]
              }}>
                <Sun color={theme.colors.text} size={24} />
              </Animated.View>
              <Animated.View style={{
                position: "absolute",
                opacity: rotateAnim,
                transform: [{
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["-90deg", "0deg"],
                  })
                }]
              }}>
                <Moon color={theme.colors.text} size={24} />
              </Animated.View>
            </TouchableOpacity>
          );
        }
        return null;
      },
    });
  }, [navigation, message.title, isWhiteBackground, theme.colors.text, theme.dark, rotateAnim]);

  const tagsStyles = {
    body: {
      color: theme.colors.text,
    },
    a: {
      color: theme.colors.primary,
      textDecorationColor: theme.colors.primary,
    },
  };

  const onPress = (event, href) => {
    Linking.openURL(href);
  };

  const renderersProps = {
    a: {
      onPress
    }
  };

  const styles = {
    scrollView: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      padding: 16,
      paddingTop: 0,
    },
    htmlContent: {
      backgroundColor: isWhiteBackground ? "white" : theme.colors.background,
    },
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
    >
      <NativeList inline>
        <NativeItem
          leading={
            <InitialIndicator
              initial={message.author}
              color={theme.colors.primary}
            />
          }
        >
          <NativeText variant="title">
            {message.author}
          </NativeText>
          <NativeText variant="subtitle">
            {formatDate(message.date)} — {message.category}
          </NativeText>
        </NativeItem>
      </NativeList>

      <View style={styles.htmlContent}>
        <RenderHtml
          contentWidth={Dimensions.get("window").width - (16 * 2)}
          source={{
            html: message.content,
          }}
          tagsStyles={tagsStyles}
          renderersProps={renderersProps}
          ignoredStyles={["fontFamily", "fontSize"]}
          baseStyle={{
            fontFamily: "medium",
            fontSize: 16,
            color: theme.colors.text,
          }}
        />
      </View>

      {message.attachments.length > 0 && (
        <View>
          <NativeListHeader label="Pièces jointes" />

          <NativeList>
            {message.attachments.map((attachment, index) => (
              <NativeItem
                key={index}
                chevron={false}
                onPress={() => Linking.openURL(attachment.url)}
                icon={
                  typeof attachment.type === "file" ? (
                    <FileIcon />
                  ) : (
                    <Link />
                  )
                }
              >
                <NativeText variant="title" numberOfLines={1}>
                  {attachment.name}
                </NativeText>
                <NativeText variant="subtitle" numberOfLines={1}>
                  {attachment.url}
                </NativeText>
              </NativeItem>
            ))}
          </NativeList>
        </View>
      )}

      <InsetsBottomView />
    </ScrollView>
  );
};

export default NewsItem;