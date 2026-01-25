import { Papicons } from "@getpapillon/papicons";
import { MenuAction, MenuView } from '@react-native-menu/menu';
import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';
import React from "react";
import { Pressable } from "react-native";

import { PapillonAppearIn, PapillonAppearOut } from "../utils/Transition";
import { Dynamic } from "./Dynamic";
import Icon from "./Icon";
import Stack from "./Stack";
import Typography from "./Typography";

const ChipButton: React.FC<React.PropsWithChildren<{
  onPress?: () => void;
  icon?: string;
  chevron?: boolean;
  onPressAction?: ({ nativeEvent }: { nativeEvent: { event: string } }) => void;
  single?: boolean;
  actions?: MenuAction[];
}>> = ({ onPress, icon, children, chevron, onPressAction, single, actions = [] }) => {
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
        <MenuView onPressAction={onPressAction} actions={actions}>
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
        </MenuView>
      </Pressable>
    </LiquidGlassView>
  );
}

export default ChipButton;