import ExpoModulesCore
import ExpoUI

public class PapillonTipsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("PapillonTips")

    Constants([
      "isSupported": PapillonTipsRegistry.isSupported
    ])

    // Configuring is optional — the first tip that mounts configures TipKit with
    // defaults — but calling this at launch is what lets the app pick the
    // display frequency. Resolves `false` when TipKit was already configured.
    AsyncFunction("configure") { (displayFrequency: String?) -> Bool in
      return PapillonTipsRegistry.shared.configure(displayFrequency: displayFrequency)
    }

    AsyncFunction("invalidate") { (tipId: String, reason: String?) in
      PapillonTipsRegistry.shared.invalidate(id: tipId, reason: reason)
    }

    // Debug affordance: only takes effect before TipKit has been configured.
    AsyncFunction("resetDatastore") { () -> Bool in
      return PapillonTipsRegistry.shared.resetDatastore()
    }

    AsyncFunction("showAllTipsForTesting") {
      PapillonTipsRegistry.shared.showAllForTesting()
    }

    AsyncFunction("hideAllTipsForTesting") {
      PapillonTipsRegistry.shared.hideAllForTesting()
    }

    ExpoUIView(PapillonTipView.self)
  }
}
