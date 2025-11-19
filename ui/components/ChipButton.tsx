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

const ChipButton: React.FC<React.PropsWithChildren<{
  onPress?: () => void;
  icon?: string;
  chevron?: boolean;
}>> = ({ onPress, icon, children, chevron }) => {
  return (
    <AnimatedPressable animated onPress={onPress}>
      <Stack animated card direction="horizontal" hAlign="center" gap={8} padding={[12, 6]} radius={200} inline>
        {icon &&
          <Dynamic animated>
            <Icon style={{ marginLeft: -2 }} size={24}>
              <Papicons name={icon} />
            </Icon>
          </Dynamic>
        }

        <Dynamic animated entering={PapillonAppearIn} exiting={PapillonAppearOut} key={"chip-text:" + children?.toString()}>
          <Typography>
            {children}
          </Typography>
        </Dynamic>

        {chevron &&
          <Dynamic animated>
            <Icon size={20} opacity={0.5}>
              <Papicons name="chevrondown" />
            </Icon>
          </Dynamic>
        }
      </Stack>
    </AnimatedPressable>
  );
}

export default ChipButton;