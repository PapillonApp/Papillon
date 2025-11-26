import React from "react";
import AnimatedPressable from "./AnimatedPressable";
import Typography from "./Typography";
import Stack from "./Stack";
import Icon from "./Icon";
import { Papicons } from "@getpapillon/papicons";
import { Dynamic } from "./Dynamic";
import { PapillonAppearIn, PapillonAppearOut } from "../utils/Transition";
import { Animation } from "../utils/Animation";
import { LinearTransition } from "react-native-reanimated";

import { MenuAction, MenuView } from '@react-native-menu/menu';
import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';

const ChipButton: React.FC<React.PropsWithChildren<{
  onPress?: () => void;
  icon?: string;
  chevron?: boolean;
  onPressAction?: ({ nativeEvent }: { nativeEvent: { event: string } }) => void;
  actions: MenuAction[];
}>> = ({ onPress, icon, children, chevron, onPressAction, actions }) => {
  return (
    <LiquidGlassView
      glassType="regular"
      isInteractive={true}
      glassTintColor="transparent"
      glassOpacity={0}
      style={{
        borderRadius: 300,
        zIndex: 999999,
      }}
    >
      <MenuView onPressAction={onPressAction} actions={actions}>
        <Stack animated direction="horizontal" hAlign="center" gap={8} padding={[12, 6]} radius={200} inline>
          {icon &&
            <Dynamic animated>
              <Icon style={{ marginLeft: -2 }} size={24}>
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
    </LiquidGlassView>
  );
}

export default ChipButton;