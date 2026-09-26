import { Gauge, HStack, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  background,
  containerBackground,
  cornerRadius,
  fixedSize,
  font,
  foregroundStyle,
  frame,
  gaugeStyle,
  lineLimit,
  minimumScaleFactor,
  offset,
  padding,
  scaleEffect,
  tint,
  widgetURL
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";

import type { TasksWidgetProps } from "./data";

// Serialized and re-evaluated inside the widget extension, which cannot reach
// the app bundle: anything referenced from outside this function throws.
const TasksWidgetLayout = (props: TasksWidgetProps, environment: WidgetEnvironment) => {
  "widget";

  const colors =
    environment.colorScheme === "dark" ? props.theme.dark : props.theme.light;
  const fonts = props.fonts;

  const family = environment.widgetFamily;
  const compact = family === "systemSmall";
  const large = family === "systemLarge";
  const tasks = compact ? [] : props.tasks.slice(0, large ? 5 : 3);
  const descriptionLines = large ? 2 : 1;

  // A concrete height is what bounds the list: `maxHeight: infinity` reports the
  // content's own height back up and grows the whole widget body instead.
  const listHeight = large ? 330 : 138;

  const summary = (
    <VStack
      alignment="leading"
      spacing={1}
      modifiers={[
        frame({ alignment: "leading" }),
        padding({ top: 8, bottom: 2 })
      ]}
    >

      {/* An accessory gauge draws at its own ideal size and ignores a frame's
          proposal: fixedSize locks that size in, scaleEffect shrinks the ring
          around its center, and offset pulls it back flush with the leading edge. */}
      <Gauge
        value={props.progress}
        modifiers={[
          gaugeStyle("circularCapacity"),
          tint(colors.strong),
          fixedSize(),
          scaleEffect(0.75),
          frame({ width: 35, height: 35, alignment: "leading" }),
          offset({ x: compact ? -10 : -6, y : compact ? -2 : 0 })
        ]}
      />
      <Spacer />
      <Text
        modifiers={[
          font({ family: fonts.medium, size: 36 }),
          foregroundStyle(colors.body),
          lineLimit(1),
          minimumScaleFactor(0.6)
        ]}
      >
        {props.countLabel}
      </Text>
      <Text
        modifiers={[
          font({ family: fonts.semibold, size: 15.5 }),
          foregroundStyle(colors.body),
          lineLimit(1),
          minimumScaleFactor(0.6)
        ]}
      >
        {props.title}
      </Text>
      <Text
        modifiers={[
          font({ family: fonts.medium, size: 14 }),
          foregroundStyle(colors.soft),
          lineLimit(1),
          minimumScaleFactor(0.6)
        ]}
      >
        {props.subtitle}
      </Text>
    </VStack>
  );

  const rootModifiers = [
    widgetURL("papillon:///tasks"),
    containerBackground(colors.surface, "widget")
  ];

  if (compact) {
    return (
      <VStack alignment="leading" modifiers={[...rootModifiers, padding({ vertical: -2, horizontal: -4 })]}>
        {summary}
      </VStack>
    );
  }

  return (
    <VStack alignment="leading" modifiers={rootModifiers}>
      <HStack alignment="top" spacing={12}>
        <VStack
          alignment="leading"
          modifiers={[frame({ width: 130, alignment: "topLeading" })]}
        >
          {summary}
        </VStack>

        <VStack
          alignment="leading"
          spacing={large ? 14 : 11}
          modifiers={[
            frame({
              maxWidth: Number.POSITIVE_INFINITY,
              height: listHeight,
              alignment: "topLeading"
            })
          ]}
        >
          {tasks.length === 0 && (
            <Text
              modifiers={[
                font({ family: fonts.medium, size: 15 }),
                foregroundStyle(colors.heading)
              ]}
            >
              {props.emptyLabel}
            </Text>
          )}

          {tasks.map((task, index) => (
            <VStack key={task.id} alignment="leading" spacing={4}>
              <HStack alignment="center" spacing={0}>
                <HStack alignment="center" spacing={4}>
                  <Text
                    modifiers={[
                      font({ size: 15 }),
                    ]}
                  >
                    {task.emoji}
                  </Text>
                  <Text
                    modifiers={[
                      font({ family: fonts.semibold, size: 15 }),
                      foregroundStyle(colors.body),
                      lineLimit(1)
                    ]}
                  >
                    {task.subject}
                  </Text>
                </HStack>
                <Spacer />

                {task.dayLabel !== tasks[index - 1]?.dayLabel && (
                  <Text
                    modifiers={[
                      font({ family: fonts.medium, size: 14 }),
                      foregroundStyle(colors.soft),
                      lineLimit(1)
                    ]}
                  >
                    {task.dayLabel}
                  </Text>
                )}
              </HStack>
              <Text
                modifiers={[
                  font({ family: fonts.medium, size: 14 }),
                  foregroundStyle(colors.heading),
                  lineLimit(descriptionLines)
                ]}
              >
                {task.description}
              </Text>
            </VStack>
          ))}
        </VStack>
      </HStack>
    </VStack>
  );
};

export const TasksWidget = createWidget<TasksWidgetProps>("Tasks", TasksWidgetLayout);
