import { useTheme } from "@react-navigation/native";
import React from "react";
import { Dimensions, Modal, Platform, Pressable, Text, TouchableOpacity, View } from "react-native";

import { X } from "lucide-react-native";

import Reanimated, {
  FadeInDown,
  FadeOutDown,
  LinearTransition,
} from "react-native-reanimated";

import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {animPapillon} from "@/utils/ui/animations";

interface HeaderCalendarProps {
  index: number,
  changeIndex: (index: number) => unknown,
  getDateFromIndex: (index: number) => Date
  showPicker: () => void
}

const HeaderCalendar: React.FC<HeaderCalendarProps> = () => {
  return (
    <Reanimated.View
      style={[{
        zIndex: 100,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
      }]}
      layout={animPapillon(LinearTransition)}
    >
    </Reanimated.View>
  );
};

interface LessonsDateModalProps {
  showDatePicker: boolean,
  setShowDatePicker: (show: boolean) => unknown,
  onDateSelect: (date: Date | undefined) => unknown,
  currentPageIndex?: number,
  defaultDate?: Date,
  currentDate: Date,
  // NOTE: PagerRef is hard to type, may need help on this ?
  PagerRef?: React.RefObject<any>,
  getDateFromIndex?: (index: number) => Date
}

const LessonsDateModal: React.FC<LessonsDateModalProps> = ({
  showDatePicker,
  setShowDatePicker,
  onDateSelect,
  currentDate
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (Platform.OS === "android") {
    return (
      showDatePicker && (
        <RNDateTimePicker
          style={{
            marginHorizontal: 8,
            marginTop: -5,
            marginBottom: 10,
          }}
          value={new Date(currentDate)}
          display="calendar"
          mode="date"
          onChange={(_event, selectedDate) => {
            onDateSelect(selectedDate);
            setShowDatePicker(false);
          }}
          onError={() => {
            setShowDatePicker(false);
          }}
        />
      )
    );
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showDatePicker}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          alignItems: "center",
          backgroundColor: "#00000099",
          paddingBottom: insets.bottom + 10,
        }}
      >
        <Pressable
          style={{
            width: "100%",
            flex: 1,
          }}
          onPress={() => setShowDatePicker(false)}
        />

        {showDatePicker && (
          <Reanimated.View
            style={{
              width: Dimensions.get("window").width - 20,
              backgroundColor: colors.card,
              overflow: "hidden",
              borderRadius: 16,
              borderCurve: "continuous",
            }}
            entering={FadeInDown.mass(1).damping(20).stiffness(300)}
            exiting={FadeOutDown.mass(1).damping(20).stiffness(300)}
          >
            <View
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
                paddingHorizontal: 18,
                paddingVertical: 14,
                backgroundColor: colors.primary,
                gap: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "medium",
                  color: "#ffffff99",
                }}
              >
                Sélection de la date
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "semibold",
                  color: "#fff",
                }}
              >
                {new Date(currentDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
              </Text>

              <TouchableOpacity
                style={{
                  position: "absolute",
                  right: 12,
                  top: 12,
                  backgroundColor: "#ffffff39",
                  opacity: 0.7,
                  padding: 6,
                  borderRadius: 50,
                }}
                onPress={() => setShowDatePicker(false)}
              >
                <X
                  size={20}
                  strokeWidth={3}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
            <RNDateTimePicker
              style={{
                marginHorizontal: 8,
                marginTop: -5,
                marginBottom: 10,
              }}
              value={new Date(currentDate)}
              display="inline"
              mode="date"
              locale="fr-FR"
              accentColor={colors.primary}
              onChange={(_event, selectedDate) => {
                const newSelectedDate = selectedDate || currentDate;
                // set hours to 0
                newSelectedDate.setHours(0, 0, 0, 0);
                onDateSelect(newSelectedDate);
              }}
            />
          </Reanimated.View>
        )}
      </View>
    </Modal>
  );
};

export { HeaderCalendar, LessonsDateModal };
