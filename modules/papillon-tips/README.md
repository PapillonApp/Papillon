# papillon-tips

Apple [TipKit](https://developer.apple.com/documentation/tipkit) exposed as an
[Expo UI](https://docs.expo.dev/guides/expo-ui-swift-ui/extending/) SwiftUI
component, plus a small imperative API.

iOS 17 and up. On Android, and on iOS 16, the view renders nothing and every
function is a no-op — callers do not need to branch.

## Rebuilding

This is a native module, so it needs a new development build:

```bash
npx expo prebuild -p ios
```

## Usage

The view has to live inside an `@expo/ui` `Host`:

```tsx
import { Host } from "@expo/ui/swift-ui";
import { PapillonTipView } from "@/modules/papillon-tips";

<Host style={{ width: 160, height: 1 }} matchContents={false}>
  <PapillonTipView
    tipId="tasks.week-scroll"
    title="Swipe to change week"
    message="Swipe the list left or right to move from one week to the next."
    systemImage="hand.draw"
    presentation="popover"
    arrowEdge="top"
    anchorWidth={160}
  />
</Host>;
```

`presentation="popover"` points a callout at the view — give it an invisible
anchor of roughly the size of whatever it should point at, since SwiftUI centers
the arrow on it. `presentation="inline"` lays a card out in the flow instead, and
then the view takes up real room.

`tintColor` recolors the tip's symbol and its action buttons — TipKit draws them
in the accent color, so it tints the whole tip rather than one element.

Mount the view unconditionally. TipKit decides whether the tip is shown and
remembers a dismissal across launches, so there is no "have they seen it" flag to
keep on the JavaScript side.

In the app, reach for `ui/components/Tip` rather than this view directly: it adds
the theme tint, the appear delay, and the progressive-discovery gate described in
`constants/Tips.ts`.

## Retiring a tip

When the user does the thing the tip was teaching, put it away rather than
waiting for them to close it by hand:

```ts
import { retireTip } from "@/stores/tips";

retireTip(TipIds.tasksWeekScroll);
```

`retireTip` is the one to call in the app: it invalidates the tip in TipKit *and*
records it on our side. The second half is what actually decides, because
TipKit only files a dismissal when its close button is used — tapping outside a
callout takes the popover away and leaves the tip eligible, so it returns on the
next redraw of the screen behind it. `invalidateTip` on its own is the raw
TipKit call.

`tipId` is the persistence key for as long as the app is installed. Never reuse
one for a different hint, and only change one when the tip is meant to come back
for everybody.

## Configuration

`configureTips(frequency)` runs once at launch from `useAppInitialization`. It is
optional — the first tip that mounts configures TipKit with defaults — but it is
the only place the display frequency can be chosen. `resetTipsDatastore()` forgets
every dismissal, and TipKit only allows that before it has been configured, so it
is a launch-time debug affordance and nothing else.

## Debugging

`showAllTips()` puts every tip back on screen, ignoring both its own rules and
any dismissal on file; `hideAllTips()` lifts that. Neither touches the datastore,
so they are reversible and last only until the next launch.

`resetTipsDatastore()` is the real reset, and TipKit only allows it *before*
`Tips.configure()` — which has already run by the time anyone can reach a debug
menu. So the debug action records the request and `useAppInitialization` carries
it out on the next launch, before configuring.

Both are wired up under "Astuces" in the developer settings screen.
