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

// Everything this layout needs has to live inside the function: it is
// serialized and re-evaluated by the widget extension, which has no access to
// the app bundle, so a reference to anything outside throws at render time.
// That is why the sizes and the colours arrive as props — see `sizes.ts` and
// `appearance.ts`, which is where they are meant to be edited.
const CourseLiveActivityLayout = (
  props: CourseLiveActivityProps,
  _environment: LiveActivityEnvironment
) => {
  "widget";

  const fonts = props.fonts;
  const ink = props.appearance.ink;
  const sizes = props.sizes;

  // The extension evaluates this at render time, so the course can move from
  // "about to start" to "under way" on its own — the app does not have to be
  // running for the switch. The staleDate the app hands to ActivityKit is the
  // moment of that switch, which is what gets the system to re-render here.
  const now = Date.now();
  const ongoing = now >= props.startsAt;
  const ended = now >= props.endsAt;

  const countsTo = new Date(ongoing ? props.endsAt : props.startsAt);
  // A timer needs an interval, not just a target: before the course starts the
  // interval opens at the moment this content was built, so what it counts down
  // is the wait the user is actually in.
  const countsFrom = new Date(
    ongoing ? props.startsAt : Math.min(props.referenceAt, props.startsAt)
  );
  const targetTime = ongoing ? props.endTime : props.startTime;

  // The roll only lands on the slower positions: the minutes and hours change
  // through a view update the transition can animate, while the seconds are
  // ticked by the system's own timer-text renderer, which redraws them without
  // going through SwiftUI at all. `monospacedDigit` is what keeps the digits
  // from shifting sideways either way.
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

  // A running clock reserves the room of the widest one it could ever show
  // rather than the one it is showing, which is what holds the island open and
  // pulls a trailing clock off its edge. What it needs is known here: a
  // countdown only ever runs down from what is left of it.
  const longCountdown = countsTo.getTime() - now >= 60 * 60 * 1000;
  const timerWidth = (size: number) =>
    Math.ceil(size * (longCountdown ? sizes.timerBox.long : sizes.timerBox.short));

  // The one thing that does move every second: the system runs this
  // continuously rather than a step at a time, which is what the digits cannot
  // do. It fills through a course under way and empties through the wait for
  // one about to start, so the bar always reads as "how far along are we".
  // `labelsHidden` drops the remaining time it would otherwise write next to
  // itself — the countdown above already says it.
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

  // The Lock Screen banner and the expanded island are built out of the same two
  // blocks, so moving between them reads as one thing growing rather than two
  // layouts swapping over.
  const schedule = (timerSize: number) => (
    <VStack alignment="trailing" spacing={0}>
      {!ended && (
        <Text
          modifiers={[
            font({ family: fonts.semibold, size: sizes.schedule.label }),
            foregroundStyle(ink.detail),
            lineLimit(1),
            // "Se termine dans" all but fills the trailing region: better it
            // gives up a point of size than an end of the word.
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

  // The hour the countdown runs to joins the room and the teacher, since the
  // countdown itself has the trailing block to itself.
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
    // The timer carries no padding of its own — the frame it needs for its
    // width would swallow it — so the inset goes on a wrapper instead.
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
    // The course goes in the bottom region rather than beside the badge: the
    // leading region is a third of the width, which is not enough for a subject
    // name and a room.
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
