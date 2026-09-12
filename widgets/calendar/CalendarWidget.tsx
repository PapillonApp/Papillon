import { Capsule, HStack, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  containerBackground,
  font,
  foregroundStyle,
  frame,
  kerning,
  lineLimit,
  padding,
  strikethrough,
  textCase,
  widgetURL
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";

import type { CalendarWidgetProps } from "./data";

// Serialized and re-evaluated inside the widget extension, which cannot reach
// the app bundle: anything referenced from outside this function throws.
const CalendarWidgetLayout = (
  props: CalendarWidgetProps,
  environment: WidgetEnvironment
) => {
  "widget";

  // Bare "primary"/"secondary" strings would be read as colour names and dropped.
  const primary = { type: "hierarchical", style: "primary" } as const;
  const secondary = { type: "hierarchical", style: "secondary" } as const;

  const fonts = props.fonts;

  const family = environment.widgetFamily;
  const compact = family === "systemSmall";
  const themeColors =
    environment.colorScheme === "dark" ? props.theme.dark : props.theme.light;
  const surface = themeColors.surface;

  const visibleCount = family === "systemLarge" ? 6 : family === "systemMedium" ? 3 : 1;
  const events = props.events.slice(0, visibleCount);

  const header = (
    <VStack alignment="leading" spacing={0}>
      <Text
        modifiers={[
          font({ family: fonts.bold, size: 13 }),
          foregroundStyle(themeColors.strong),
          textCase("uppercase"),
          kerning(1),
          lineLimit(1)
        ]}
      >
        {props.dayLabel}
      </Text>
      <Text
        modifiers={[
          font({ family: fonts.regular, size: 42 }),
          foregroundStyle(primary),
          lineLimit(1)
        ]}
      >
        {props.dayNumber}
      </Text>
    </VStack>
  );

  const empty = (
    <Text
      modifiers={[font({ family: fonts.regular, size: 13 }), foregroundStyle(secondary)]}
    >
      {props.emptyLabel}
    </Text>
  );

  const list = events.map((event) => {
    const spelled = compact && event.detail !== "";

    return (
      <HStack key={event.id} alignment="top" spacing={7}>

        <Capsule
          modifiers={[
            frame({ width: 3, height: spelled ? 54 : 38 }),
            foregroundStyle(event.color)
          ]}
        />
        <VStack alignment="leading" spacing={2}>
          <Text
            modifiers={[
              font({ family: spelled ? fonts.bold : fonts.semibold, size: spelled ? 15 : 16 }),
              foregroundStyle(primary),
              lineLimit(1),
              strikethrough({ isActive: event.canceled, pattern: "solid" })
            ]}
          >
            {event.subject}
          </Text>
          {spelled && (
            <Text
              modifiers={[
                font({ family: fonts.medium, size: 14 }),
                foregroundStyle(primary),
                lineLimit(1)
              ]}
            >
              {event.detail}
            </Text>
          )}
          <Text
            modifiers={[
              font({ family: fonts.medium, size: spelled ? 14 : 15 }),
              foregroundStyle(secondary),
              lineLimit(1)
            ]}
          >
            {spelled || event.detail === ""
              ? event.timeRange
              : `${event.timeRange} · ${event.detail}`}
          </Text>
        </VStack>
        <Spacer />
      </HStack>
    );
  });

  const rootModifiers = [
    padding(compact ? { top: 20, bottom: 0 } : { all: -5 }),
    widgetURL("papillon:///calendar"),
    containerBackground(surface, "widget")
  ];

  // A concrete height is what bounds the list: left at its intrinsic size it
  // reports its full height back up and grows the whole widget body.
  const listHeight = family === "systemLarge" ? 260 : family === "systemMedium" ? 110 : 60;

  if (family === "systemMedium") {
    return (
      <HStack alignment="top" spacing={8} modifiers={rootModifiers}>
        <VStack alignment="leading" modifiers={[frame({ width: 72, alignment: "topLeading" }), padding({ all: 6 })]}>
          {header}
          <Spacer />
        </VStack>

        <VStack
          alignment="leading"
          spacing={10}
          modifiers={[frame({ height: listHeight, alignment: "topLeading" })]}
        >
          {events.length === 0 && empty}
          {list}
          <Spacer />
        </VStack>
      </HStack>
    );
  }

  return (
    <VStack alignment="leading" spacing={compact ? 10 : 12} modifiers={[...rootModifiers, padding(compact ? { all: 0 } : { all: 6 })]}>
      <HStack alignment="top" spacing={0}>
        {header}
        <Spacer />
      </HStack>

      <VStack
        alignment="leading"
        spacing={10}
        modifiers={[frame({ height: listHeight, alignment: "topLeading" })]}
      >
        {events.length === 0 && empty}
        {list}
      </VStack>

      <Spacer />
    </VStack>
  );
};

export const CalendarWidget = createWidget<CalendarWidgetProps>(
  "Calendar",
  CalendarWidgetLayout
);
