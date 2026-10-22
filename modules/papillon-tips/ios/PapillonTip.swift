import SwiftUI

#if canImport(TipKit)
import TipKit

/**
 One tip, described entirely by its props rather than by its Swift type.

 TipKit normally expects a type per tip and derives the persistence key from the
 type name. Everything here is driven from JavaScript instead, so the key has to
 come from the outside: `id` overrides the protocol's default and is what TipKit
 remembers a dismissal under. Two tips sharing an id are the same tip as far as
 the datastore is concerned, which is exactly what lets a tip survive the view
 being unmounted and remounted.
 */
@available(iOS 17.0, *)
struct PapillonTip: Tip {
  let id: String
  let titleText: String
  let messageText: String?
  let systemImage: String?
  let tipActions: [Tip.Action]

  var title: Text {
    Text(titleText)
  }

  var message: Text? {
    guard let messageText, !messageText.isEmpty else {
      return nil
    }
    return Text(messageText)
  }

  var image: Image? {
    guard let systemImage, !systemImage.isEmpty else {
      return nil
    }
    return Image(systemName: systemImage)
  }

  var actions: [Tip.Action] {
    tipActions
  }
}
#endif
