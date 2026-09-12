import { HStack, ProgressView, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  activityBackgroundTint,
  contentTransition,
  font,
  foregroundStyle,
  frame,
  kerning,
  labelsHidden,
  lineLimit,
  minimumScaleFactor,
  monospacedDigit,
  multilineTextAlignment,
  padding,
  progressViewStyle,
  tint
} from "@expo/ui/swift-ui/modifiers";
import { createLiveActivity, type LiveActivityEnvironment } from "expo-widgets";

import type { CourseLiveActivityProps } from "./content";

// Serialized and re-evaluated inside the widget extension, which cannot reach
// the app bundle: anything referenced from outside this function throws.
// Sizes and colours therefore arrive as props — see `sizes.ts` and `appearance.ts`.
const CourseLiveActivityLayout = (
  props: CourseLiveActivityProps,
  _environment: LiveActivityEnvironment
) => {
  "widget";

  const fonts = props.fonts;
  const ink = props.appearance.ink;
  const sizes = props.sizes;

  const now = Date.now();
  const ongoing = now >= props.startsAt;
  const ended = now >= props.endsAt;

  const countsTo = new Date(ongoing ? props.endsAt : props.startsAt);
  const countsFrom = new Date(
    ongoing ? props.startsAt : Math.min(props.referenceAt, props.startsAt)
  );
  const targetTime = ongoing ? props.endTime : props.startTime;

  const timer = (
    size: number,
    color: string,
    options?: {
      width?: number;
      align?: "leading" | "trailing";
      weight?: "regular" | "medium" | "semibold" | "bold";
    }
  ) => (
    <Text
      timerInterval={{ lower: countsFrom, upper: countsTo }}
      countsDown
      modifiers={[
        font({ size, design: "rounded", weight: options?.weight ?? "semibold" }),
        foregroundStyle(color),
        monospacedDigit(),
        contentTransition("numericText", { countsDown: true }),
        kerning(-0.25),
        lineLimit(1),
        ...(options?.align === undefined
          ? []
          : [multilineTextAlignment(options.align)]),
        ...(options?.width === undefined
          ? []
          : [frame({ width: options.width, alignment: options.align ?? "center" })])
      ]}
    />
  );

  const longCountdown = countsTo.getTime() - now >= 60 * 60 * 1000;
  const timerWidth = (size: number) =>
    Math.ceil(size * (longCountdown ? sizes.timerBox.long : sizes.timerBox.short));

  const progress = (
    <ProgressView
      timerInterval={{ lower: countsFrom, upper: countsTo }}
      countsDown={!ongoing}
      modifiers={[progressViewStyle("linear"), labelsHidden(), tint(ink.accent)]}
    />
  );

  const endedText = (size: number, color: string) => (
    <Text
      modifiers={[
        font({ family: fonts.medium, size }),
        foregroundStyle(color),
        lineLimit(1)
      ]}
    >
      {props.endedLabel}
    </Text>
  );

  const badge = (size: number) => (
    <Text modifiers={[font({ size })]}>{props.emoji}</Text>
  );

  const schedule = (timerSize: number) => (
    <VStack alignment="trailing" spacing={0}>
      {!ended && (
        <Text
          modifiers={[
            font({ family: fonts.semibold, size: sizes.schedule.label }),
            foregroundStyle(ink.detail),
            lineLimit(1),
            minimumScaleFactor(0.7)
          ]}
        >
          {ongoing ? props.endingLabel : props.startingLabel}
        </Text>
      )}
      {ended ? (
        <Text
          modifiers={[
            font({ family: fonts.bold, size: sizes.schedule.ended }),
            foregroundStyle(ink.accent),
            lineLimit(1)
          ]}
        >
          {props.endedLabel}
        </Text>
      ) : (
        timer(timerSize, ink.accent, {
          width: timerWidth(timerSize),
          align: "trailing"
        })
      )}
    </VStack>
  );

  const course = (
    <VStack alignment="leading" spacing={sizes.course.gap}>
      <Spacer modifiers={[frame({ height: sizes.course.lead })]} />
      <Text
        modifiers={[
          font({ family: fonts.bold, size: sizes.course.subject }),
          foregroundStyle(ink.title),
          lineLimit(1)
        ]}
      >
        {props.subject}
      </Text>
      <Text
        modifiers={[
          font({ family: fonts.medium, size: sizes.course.detail }),
          foregroundStyle(ink.detail),
          lineLimit(1)
        ]}
      >
        {props.detail === "" ? targetTime : `${props.detail} · ${targetTime}`}
      </Text>
    </VStack>
  );

  const banner = (
    <VStack
      alignment="leading"
      spacing={sizes.banner.gap}
      modifiers={[
        padding({ all: sizes.banner.padding }),
        activityBackgroundTint(props.appearance.surface.banner)
      ]}
    >
      <HStack alignment="top" spacing={sizes.banner.row}>
        {badge(sizes.banner.badge)}
        <Spacer />
        {schedule(sizes.banner.timer)}
      </HStack>
      {course}
      {!ended && progress}
    </VStack>
  );

  const bannerSmall = (
    <HStack
      alignment="center"
      spacing={sizes.watch.gap}
      modifiers={[
        padding(sizes.watch.padding),
        activityBackgroundTint(props.appearance.surface.watch)
      ]}
    >
      {badge(sizes.watch.badge)}
      <Text
        modifiers={[
          font({ family: fonts.bold, size: sizes.watch.subject }),
          foregroundStyle(ink.title),
          lineLimit(1)
        ]}
      >
        {props.subject}
      </Text>
      <Spacer />
      {ended
        ? endedText(sizes.watch.ended, ink.detail)
        : timer(sizes.watch.timer, ink.accent, { weight: "bold" })}
    </HStack>
  );

  return {
    banner,
    bannerSmall,
    compactLeading: (
      <Text
        modifiers={[
          font({ size: sizes.island.compact.emoji }),
          padding({ leading: sizes.island.compact.leading })
        ]}
      >
        {props.emoji}
      </Text>
    ),
    compactTrailing: (
      <HStack modifiers={[padding({ trailing: sizes.island.compact.trailing })]}>
        {ended ? (
          <Text
            modifiers={[
              font({ family: fonts.medium, size: sizes.island.compact.ended }),
              foregroundStyle(ink.accent)
            ]}
          >
            {targetTime}
          </Text>
        ) : (
          timer(sizes.island.compact.timer, ink.accent, {
            width: timerWidth(sizes.island.compact.timerBox),
            align: "trailing"
          })
        )}
      </HStack>
    ),
    minimal: <Text modifiers={[font({ size: sizes.island.minimal })]}>{props.emoji}</Text>,
    expandedLeading: (
      <HStack
        modifiers={[
          padding({ leading: sizes.island.expanded.inset, top: sizes.island.expanded.top })
        ]}
      >
        {badge(sizes.island.expanded.badge)}
        <Spacer />
      </HStack>
    ),
    expandedTrailing: (
      <VStack
        alignment="trailing"
        modifiers={[
          padding({ trailing: sizes.island.expanded.inset, top: sizes.island.expanded.top })
        ]}
      >
        {schedule(sizes.island.expanded.timer)}
      </VStack>
    ),
    expandedBottom: (
      <VStack
        alignment="leading"
        spacing={sizes.island.expanded.gap}
        modifiers={[
          padding({
            leading: sizes.island.expanded.inset,
            trailing: sizes.island.expanded.inset
          })
        ]}
      >
        {course}
        {!ended && progress}
      </VStack>
    )
  };
};

export const CourseLiveActivity = createLiveActivity<CourseLiveActivityProps>(
  "Course",
  CourseLiveActivityLayout
);
