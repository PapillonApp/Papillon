import Foundation
import SwiftUI

#if canImport(TipKit)
import TipKit
#endif

/**
 The one place that talks to TipKit.

 `Tips.configure()` may be called exactly once per process and has to happen
 before any tip is asked for its status, so configuration is latched here and
 every entry point goes through `ensureConfigured()`. A tip's identity also has
 to outlive the SwiftUI view that shows it — the view is remounted on every week
 change — so instances are kept by id.

 Everything degrades to a no-op below iOS 17, where TipKit does not exist.
 */
final class PapillonTipsRegistry {
  static let shared = PapillonTipsRegistry()

  private let lock = NSLock()
  private var configured = false
  // `PapillonTip` is iOS 17-only, so the box that holds them cannot name it.
  private var tips: [String: Any] = [:]

  static var isSupported: Bool {
    if #available(iOS 17.0, *) {
#if canImport(TipKit)
      return true
#else
      return false
#endif
    }
    return false
  }

  // MARK: - Configuration

  /// Returns `true` when this call is the one that configured TipKit.
  @discardableResult
  func configure(displayFrequency: String?) -> Bool {
#if canImport(TipKit)
    guard #available(iOS 17.0, *) else {
      return false
    }

    lock.lock()
    if configured {
      lock.unlock()
      return false
    }
    configured = true
    lock.unlock()

    do {
      try Tips.configure([
        .displayFrequency(Self.frequency(from: displayFrequency)),
        .datastoreLocation(.applicationDefault)
      ])
      return true
    } catch {
      // Worth shouting about: an unconfigured TipKit still draws tips but
      // remembers nothing, so every dismissal comes undone on the next redraw.
      NSLog("[PapillonTips] Tips.configure failed: \(error)")
      return false
    }
#else
    return false
#endif
  }

  private func ensureConfigured() {
    configure(displayFrequency: nil)
  }

  /// Wipes every remembered dismissal. Only valid before TipKit is configured,
  /// so it is meant for a debug menu at launch, not for mid-session use.
  @discardableResult
  func resetDatastore() -> Bool {
#if canImport(TipKit)
    guard #available(iOS 17.0, *) else {
      return false
    }
    do {
      try Tips.resetDatastore()
      return true
    } catch {
      NSLog("[PapillonTips] Tips.resetDatastore failed: \(error)")
      return false
    }
#else
    return false
#endif
  }

  // MARK: - Tips

#if canImport(TipKit)
  @available(iOS 17.0, *)
  func tip(
    id: String,
    title: String,
    message: String?,
    systemImage: String?,
    actions: [Tip.Action]
  ) -> PapillonTip {
    ensureConfigured()

    let tip = PapillonTip(
      id: id,
      titleText: title,
      messageText: message,
      systemImage: systemImage,
      tipActions: actions
    )

    lock.lock()
    tips[id] = tip
    lock.unlock()

    return tip
  }
#endif

  /// Dismisses a tip for good. The tip does not have to be on screen — an id is
  /// all TipKit needs — so this also works as "the user already learned this".
  func invalidate(id: String, reason: String?) {
#if canImport(TipKit)
    guard #available(iOS 17.0, *) else {
      return
    }
    ensureConfigured()

    lock.lock()
    let known = tips[id] as? PapillonTip
    lock.unlock()

    let tip = known ?? PapillonTip(
      id: id,
      titleText: "",
      messageText: nil,
      systemImage: nil,
      tipActions: []
    )

    let invalidationReason = Self.invalidationReason(from: reason)
    Task { @MainActor in
      tip.invalidate(reason: invalidationReason)
    }
#endif
  }

  // MARK: - Testing overrides

  /// Puts every tip back on screen, ignoring both its rules and any dismissal
  /// already on file. Survives until `hideAllForTesting()` — or the process
  /// ends — and is meant for a debug menu, not for shipping behaviour.
  func showAllForTesting() {
#if canImport(TipKit)
    guard #available(iOS 17.0, *) else {
      return
    }
    ensureConfigured()
    Tips.showAllTipsForTesting()
#endif
  }

  /// Lifts `showAllForTesting()` and puts every tip away again.
  func hideAllForTesting() {
#if canImport(TipKit)
    guard #available(iOS 17.0, *) else {
      return
    }
    ensureConfigured()
    Tips.hideAllTipsForTesting()
#endif
  }

  // MARK: - Option mapping

#if canImport(TipKit)
  @available(iOS 17.0, *)
  private static func frequency(from raw: String?) -> Tips.ConfigurationOption.DisplayFrequency {
    switch raw {
    case "hourly": return .hourly
    case "daily": return .daily
    case "weekly": return .weekly
    case "monthly": return .monthly
    default: return .immediate
    }
  }

  @available(iOS 17.0, *)
  private static func invalidationReason(from raw: String?) -> Tip.InvalidationReason {
    switch raw {
    case "tipClosed": return .tipClosed
    case "displayCountExceeded": return .displayCountExceeded
    default: return .actionPerformed
    }
  }
#endif
}
