import { Papicons } from "@getpapillon/papicons";
import { MenuAction, MenuView } from '@react-native-menu/menu';
import { useTheme } from "@react-navigation/native";
import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';
import React from "react";
import { Platform, Pressable, TouchableNativeFeedback, TouchableOpacity, View } from "react-native";

import { runsIOS26 } from "../utils/IsLiquidGlass";
import { PapillonAppearIn, PapillonAppearOut } from "../utils/Transition";
import { Dynamic } from "./Dynamic";
import Icon from "./Icon";
import Stack from "./Stack";
import Typography from "./Typography";
import ActionMenu from "./ActionMenu";

const ChipButton: React.FC<React.PropsWithChildren<{
  onPress?: () => void;
  icon?: string;
  chevron?: boolean;
  onPressAction?: ({ nativeEvent }: { nativeEvent: { event: string } }) => void;
  single?: boolean;
  actions?: MenuAction[];
}>> = ({ onPress, icon, children, chevron, onPressAction, single, actions = [] }) => {
  const { colors } = useTheme()

  if (runsIOS26) {
    return (
      <LiquidGlassView
        glassType="regular"
        isInteractive={true}
        glassTintColor="transparent"
        glassOpacity={0}
        style={[
          {
            borderRadius: 300,
            zIndex: 999999,
          },
          single && {
            width: 46,
            height: 46,
            justifyContent: "center",
            alignItems: "center",
          }
        ]}
      >
        <Pressable onPress={onPress}>
          <ActionMenu onPressAction={onPressAction} actions={actions}>
            <Stack animated direction="horizontal" hAlign="center" gap={8} padding={single ? 0 : [12, 6]} radius={200} inline vAlign="center">
              {icon &&
                <Dynamic animated>
                  <Icon style={{ marginLeft: single ? 0 : -2 }} size={24}>
                    <Papicons name={icon} />
                  </Icon>
                </Dynamic>
              }

              {children &&
                <Dynamic animated entering={PapillonAppearIn} exiting={PapillonAppearOut} key={"chip-text:" + children?.toString()}>
                  <Typography>
                    {children}
                  </Typography>
                </Dynamic>
              }

              {chevron &&
                <Dynamic animated>
                  <Icon size={20} opacity={0.5}>
                    <Papicons name="chevrondown" />
                  </Icon>
                </Dynamic>
              }
            </Stack>
          </ActionMenu>
        </Pressable>
      </LiquidGlassView>
    );
  }

  return (
    <FallBackTouchable
      style={[
        {
          borderRadius: 300,
          zIndex: 999999,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          elevation: 1,
        overflow: 'hidden',
        },
        single && {
          width: 46,
          height: 46,
          justifyContent: "center",
          alignItems: "center",
        }
      ]}
      contentContainerStyle={{
        borderRadius: 300,
        overflow: 'hidden',
      }}
      onPress={onPress}
    >
      <ActionMenu onPressAction={onPressAction} actions={actions}>
        <Stack animated direction="horizontal" hAlign="center" gap={8} padding={single ? 0 : [12, 6]} radius={200} inline vAlign="center">
          {icon &&
            <Dynamic animated>
              <Icon style={{ marginLeft: single ? 0 : -2 }} size={24}>
                <Papicons name={icon} />
              </Icon>
            </Dynamic>
          }

          {children &&
            <Dynamic animated entering={PapillonAppearIn} exiting={PapillonAppearOut} key={"chip-text:" + children?.toString()}>
              <Typography>
                {children}
              </Typography>
            </Dynamic>
          }

          {chevron &&
            <Dynamic animated>
              <Icon size={20} opacity={0.5}>
                <Papicons name="chevrondown" />
              </Icon>
            </Dynamic>
          }
        </Stack>
      </ActionMenu>
    </FallBackTouchable>
  );

}

const FallBackTouchable = ({ ...props }: React.ComponentProps<typeof TouchableOpacity>) => {
  if(Platform.OS === 'android') {
    return (
      <TouchableNativeFeedback
        onPress={props.onPress}
        useForeground
        style={props.contentContainerStyle}
      >
        <View {...props}>
          {props.children}
        </View>
      </TouchableNativeFeedback>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.5} {...props} />
  )
}

export default ChipButton;