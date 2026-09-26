import ExpoModulesCore
import ExpoUI
import SwiftUI

#if canImport(TipKit)
import TipKit
#endif

internal struct TipActionRecord: Record {
  @Field var id: String = ""
  @Field var title: String = ""
}

internal enum TipPresentationOption: String, Enumerable {
  /// A callout hanging off the view, with an arrow pointing back at it.
  case popover
  /// A card laid out in the flow, taking up room like any other view.
  case inline
}

internal enum TipArrowEdgeOption: String, Enumerable {
  case top
  case bottom
  case leading
  case trailing

  var edge: Edge {
    switch self {
    case .top: return .top
    case .bottom: return .bottom
    case .leading: return .leading
    case .trailing: return .trailing
    }
  }
}

internal final class PapillonTipViewProps: UIBaseViewProps {
  /// Stable across launches: TipKit remembers dismissals under this key.
  @Field var tipId: String = ""
  @Field var title: String = ""
  @Field var message: String?
  @Field var systemImage: String?
  @Field var presentation: TipPresentationOption = .popover
  /// Which side of the anchor the arrow leaves from. `top` points upwards.
  @Field var arrowEdge: TipArrowEdgeOption?
  @Field var actions: [TipActionRecord] = []
  /// Recolors the tip's symbol and its action buttons. TipKit draws them in the
  /// accent color, so this is a `tint` rather than a per-element style.
  @Field var tintColor: Color?
  /// Size of the invisible anchor a popover tip attaches to. SwiftUI centers
  /// the arrow on it, so it should roughly match the control being pointed at.
  @Field var anchorWidth: Double = 1
  @Field var anchorHeight: Double = 1

  var onAction = EventDispatcher()
  var onStatusChange = EventDispatcher()
}

/**
 A TipKit tip, in either of the two shapes TipKit offers.

 Whether the tip is actually drawn is TipKit's call, not ours: mounting this view
 only makes the tip eligible. Once dismissed it stays dismissed, across launches,
 so there is no need to gate the mount on anything from the JavaScript side.
 */
internal struct PapillonTipView: ExpoSwiftUI.View {
  @ObservedObject var props: PapillonTipViewProps

  var body: some View {
#if canImport(TipKit)
    if #available(iOS 17.0, *) {
      tipContent
    } else {
      anchor
    }
#else
    anchor
#endif
  }

  /// What a popover hangs off — the children if any were given, otherwise an
  /// invisible box of the requested size.
  @ViewBuilder
  private var anchor: some View {
    if let children = props.children, !children.isEmpty {
      Children()
    } else {
      Color.clear
        .frame(width: CGFloat(props.anchorWidth), height: CGFloat(props.anchorHeight))
        .allowsHitTesting(false)
    }
  }

#if canImport(TipKit)
  @available(iOS 17.0, *)
  @ViewBuilder
  private var tipContent: some View {
    let tip = PapillonTipsRegistry.shared.tip(
      id: props.tipId,
      title: props.title,
      message: props.message,
      systemImage: props.systemImage,
      actions: props.actions.map { Tip.Action(id: $0.id, title: $0.title) }
    )

    Group {
      switch props.presentation {
      case .popover:
        anchor.popoverTip(tip, arrowEdge: props.arrowEdge?.edge ?? .top) { action in
          props.onAction(["id": action.id])
        }
      case .inline:
        inline(tip)
      }
    }
    // Set on the presenting view rather than inside: a popover inherits the
    // environment it was presented from, which is the only handle we have on
    // content TipKit builds itself.
    .tint(props.tintColor)
    .task(id: props.tipId) {
      for await status in tip.statusUpdates {
        props.onStatusChange(Self.payload(for: status))
      }
    }
  }

  @available(iOS 17.0, *)
  @ViewBuilder
  private func inline(_ tip: PapillonTip) -> some View {
    // The arrow-less overload is a different initializer, not a `nil` argument.
    if let edge = props.arrowEdge?.edge {
      TipKit.TipView(tip, arrowEdge: edge) { action in
        props.onAction(["id": action.id])
      }
    } else {
      TipKit.TipView(tip) { action in
        props.onAction(["id": action.id])
      }
    }
  }

  @available(iOS 17.0, *)
  private static func payload(for status: Tips.Status) -> [String: Any] {
    switch status {
    case .available:
      return ["status": "available"]
    case .pending:
      return ["status": "pending"]
    case .invalidated(let reason):
      return ["status": "invalidated", "reason": String(describing: reason)]
    @unknown default:
      return ["status": "unknown"]
    }
  }
#endif
}
