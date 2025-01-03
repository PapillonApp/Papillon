import { useTheme } from "@react-navigation/native";
import React from "react";
import { TouchableOpacity } from "react-native";
import { Calendar } from "lucide-react-native";
import Reanimated, {
  Easing,
  LinearTransition,
  ZoomIn,
  ZoomOut
} from "react-native-reanimated";
import { epochWMToCalendarWeekNumber } from "@/utils/epochWeekNumber";
import useScreenDimensions from "@/hooks/useScreenDimensions";

const HeaderCalendar: React.FC<{ epochWeekNumber: number, oldPageIndex: number, showPicker: () => void, changeIndex: (index: number) => void }> = ({ epochWeekNumber, oldPageIndex, showPicker, changeIndex }) => {
  const { width, isTablet } = useScreenDimensions();

  const index = epochWeekNumber;

  return (
    <Reanimated.View
      style={{
        width: width - 50 - (isTablet ? 400 : 0),
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Reanimated.View
        style={{
          width: 1000,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        <HeaderWeekComponent
          epochWeekNumber={epochWeekNumber - 2}
          active={false}
          key={index - 2}
          location="left"
          onPress={() => changeIndex(epochWeekNumber - 2)}
        />
        <HeaderWeekComponent
          epochWeekNumber={epochWeekNumber - 1}
          active={false}
          key={index - 1}
          location="left"
          onPress={() => changeIndex(epochWeekNumber - 1)}
        />
        <HeaderWeekComponent
          epochWeekNumber={epochWeekNumber}
          active={true}
          key={index}
          onPress={showPicker}
        />
        <HeaderWeekComponent
          epochWeekNumber={epochWeekNumber + 1}
          active={false}
          key={index + 1}
          location="right"
          onPress={() => changeIndex(epochWeekNumber + 1)}
        />
        <HeaderWeekComponent
          epochWeekNumber={epochWeekNumber + 2}
          active={false}
          key={index + 2}
          location="right"
          onPress={() => changeIndex(epochWeekNumber + 2)}
        />
      </Reanimated.View>
    </Reanimated.View>
  );
};

const HeaderWeekComponent: React.FC<{ epochWeekNumber: number, active: boolean, location?: string, onPress?: () => void }> = ({ epochWeekNumber, active, location, onPress }) => {
  const { colors } = useTheme();

  return (
    <Reanimated.View
      layout={LinearTransition.duration(300).easing(Easing.bezier(0.5, 0, 0, 1).factory())}
    >
      <TouchableOpacity onPress={onPress}>
        <Reanimated.View
          style={[
            {
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              paddingVertical: 6,
              borderRadius: 10,
              borderCurve: "continuous",
              flexDirection: "row",
              paddingHorizontal: 10,
              overflow: "hidden",
            },
            active ? {} : {
              width: 120,
              opacity: 0.4,
            },
          ]}
        >
          {active &&
            <Reanimated.View
              layout={LinearTransition.springify().mass(1).damping(20).stiffness(300)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: colors.primary + "21",
              }}
              entering={ZoomIn.springify().mass(1).damping(20).stiffness(300)}
              exiting={ZoomOut.springify().mass(1).damping(20).stiffness(300)}
            />
          }

          {active &&
            <Reanimated.View
              layout={LinearTransition.springify().mass(1).damping(20).stiffness(300)}
              entering={ZoomIn.duration(200)}
              exiting={ZoomOut.duration(200)}
            >
              <Calendar
                size={20}
                color={colors.primary}
              />
            </Reanimated.View>
          }

          <Reanimated.Text
            numberOfLines={1}
            style={{
              fontSize: 16,
              fontFamily: "medium",
              color: !active ? colors.text : colors.primary,
            }}
            layout={LinearTransition.duration(200)}
          >
            Semaine {epochWMToCalendarWeekNumber(epochWeekNumber)}
          </Reanimated.Text>
        </Reanimated.View>
      </TouchableOpacity>
    </Reanimated.View>
  );
};

export { HeaderCalendar };