import InsetsBottomView from "@/components/Global/InsetsBottomView";
import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import InitialIndicator from "@/components/News/InitialIndicator";
import { Information } from "@/services/shared/Information";
import formatDate from "@/utils/format/format_date_complets";
import { useTheme } from "@react-navigation/native";
import {
  Eye,
  EyeOff,
  FileIcon,
  Link,
  MoreHorizontal,
} from "lucide-react-native";
import React, { useEffect, useLayoutEffect } from "react";
import {View, Dimensions, Linking, TouchableOpacity, type GestureResponderEvent} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import RenderHtml from "react-native-render-html";
import { PapillonModernHeader} from "@/components/Global/PapillonModernHeader";
import {LinearGradient} from "expo-linear-gradient";
import {setNewsRead} from "@/services/news";
import {useCurrentAccount} from "@/stores/account";
import PapillonPicker from "@/components/Global/PapillonPicker";
import {Screen} from "@/router/helpers/types";
import {AttachmentType} from "@/services/shared/Attachment";
import parse_initials from "@/utils/format/format_pronote_initials";
import { selectColorSeed } from "@/utils/format/select_color_seed";

const NewsItem: Screen<"NewsItem"> = ({ route, navigation }) => {
  let message = JSON.parse(route.params.message) as Information;
  const important = route.params.important;
  const isED = route.params.isED;
  const account = useCurrentAccount((store) => store.account!);

  const theme = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: message.title,
    });
  }, [navigation, message.title]);

  useEffect(() => {
    setNewsRead(account, message, true);
    message.read = true;
  }, [account.instance]);

  const tagsStyles = {
    body: {
      color: theme.colors.text,
    },
    a: {
      color: theme.colors.primary,
      textDecorationColor: theme.colors.primary,
    },
  };

  function onPress (event: GestureResponderEvent, href: string) {
    Linking.openURL(href);
  }

  const renderersProps = {
    a: {
      onPress: onPress
    }
  };

  return (
    <View style={{flex: 1}}>
      <PapillonModernHeader native height={110} outsideNav={true}>
        <View style={{flexDirection: "row", gap: 12, alignItems: "center"}}>
          <InitialIndicator
            initial={parse_initials(message.author)}
            color={selectColorSeed(message.author)}
          />
          <View style={{flex: 1, gap: 3}}>
            <NativeText variant="title" numberOfLines={1}>{message.title === "" ? message.author : message.title}</NativeText>
            <NativeText variant="subtitle" numberOfLines={1}>{message.title === "" ? formatDate(message.date.toDateString()) : message.author}</NativeText>
          </View>
          {isED && <PapillonPicker
            animated
            direction="right"
            delay={0}
            data={[
              {
                icon: message.read ? <EyeOff /> : <Eye />,
                label:  message.read ? "Marquer comme non lu" : "Marquer comme lu",
                onPress: () => {
                  setNewsRead(account, message, !message.read);
                  message.read = !message.read;
                }
              }
            ]}
          >
            <TouchableOpacity>
              <MoreHorizontal size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </PapillonPicker>}
        </View>
      </PapillonModernHeader>
      {important && (
        <LinearGradient
          colors={!theme.dark ? [theme.colors.card, "#BFF6EF"] : [theme.colors.card, "#2C2C2C"]}
          start={[0, 0]}
          end={[2, 2]}
          style={{
            flex: 1,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -1,
            opacity: 0.75,
          }}
        />
      )}
      <ScrollView
        style={{
          flex: 1,
        }}
        contentContainerStyle={{
          paddingBottom: 16,
          paddingTop: 106,
        }}
      >
        <View style={{paddingHorizontal: 16}}>
          <RenderHtml
            contentWidth={Dimensions.get("window").width - (16 * 2)}
            source={{
              html: message.content,
            }}
            tagsStyles={tagsStyles}
            renderersProps={renderersProps}
            ignoredStyles={["fontFamily", "fontSize"]}
            baseStyle={{
              fontFamily: "regular",
              fontSize: 16,
              color: theme.colors.text,
            }}
          />
        </View>

        {isED && <ScrollView horizontal={true} contentContainerStyle={{gap: 5, paddingHorizontal: 16}}>
          <View style={{
            padding: 4,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderRadius: 80,
            borderColor: theme.colors.border,
            marginTop: 16,
          }}>
            <NativeText>{message.category}</NativeText>
          </View>
          <View style={{
            padding: 4,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderRadius: 80,
            borderColor: theme.colors.border,
            marginTop: 16,
          }}>
            <NativeText>{formatDate(message.date.toDateString())}</NativeText>
          </View>
        </ScrollView>}

        {message.attachments.length > 0 && (
          <View style={{paddingHorizontal: 16}}>
            <NativeListHeader label="Pièces jointes" />
            <NativeList>
              {message.attachments.map((attachment, index) => (
                <NativeItem
                  key={index}
                  chevron={false}
                  onPress={() => Linking.openURL(attachment.url)}
                  icon={
                    attachment.type === AttachmentType.File ? (
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
    </View>
  );
};

export default NewsItem;
