import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import React from "react";
import { Modal, Platform, Pressable, Text, TouchableOpacity, View } from "react-native";

import { X } from "lucide-react-native";

import Reanimated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";

import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { animPapillon, PapillonContextEnter, PapillonContextExit } from "@/utils/ui/animations";
import useScreenDimensions from "@/hooks/useScreenDimensions";

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
  topOffset?: number,
  // NOTE: PagerRef is hard to type, may need help on this ?
  PagerRef?: React.RefObject<any>,
  getDateFromIndex?: (index: number) => Date
}

const LessonsDateModal: React.FC<LessonsDateModalProps> = ({
  showDatePicker,
  setShowDatePicker,
  onDateSelect,
  currentDate,
  topOffset
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [showModalPicker, setShowModalPicker] = React.useState(false);
  const { isTablet } = useScreenDimensions();

  React.useEffect(() => {
    if (showDatePicker) {
      setShowModalPicker(true);
    } else {
      setTimeout(() => {
        setShowModalPicker(false);
      }, 200);
    }
  }, [showDatePicker]);

  if (Platform.OS === "android" && showDatePicker) {
    return (
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
          setShowDatePicker(false);
          onDateSelect(selectedDate);
        }}
        onError={() => {
          setShowDatePicker(false);
        }}
      />
    );
  }

  return (
    <Modal
      transparent={true}
      visible={showModalPicker}
    >
      {showDatePicker && (
        <Reanimated.View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "center",
            backgroundColor: "#00000099",
            paddingBottom: insets.bottom + 10,
          }}
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
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
              style={[
                {
                  maxWidth: 400,
                  backgroundColor: colors.card,
                  overflow: "hidden",
                  borderRadius: 16,
                  borderCurve: "continuous",
                  transformOrigin: "bottom center",
                },
                topOffset ? {
                  position: "absolute",
                  top: topOffset,
                  left: 16 + (isTablet ? 320 : 0),
                  transformOrigin: "top left",
                } : null
              ]}
              entering={PapillonContextEnter}
              exiting={PapillonContextExit}
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
        </Reanimated.View>
      )}
    </Modal>
  );
};

export { HeaderCalendar, LessonsDateModal };
