import SwiftUI

struct emptyMessageNoAccount: View {
  var image : String?
  
  var body: some View {
    emptyMessage(
      image: image ?? "gear",
      title: "Aucun compte sélectionné",
      description: "Veuillez sélectionner un compte depuis les réglages du widget."
    )
  }
}

struct emptyNewsMessage: View {
  var body: some View {
    emptyMessage(
      image: "newspaper",
      title: "Aucune actualité",
      description: "Vous n'avez pas encore reçu d'actualités."
    )
  }
}

struct emptyTimetableMessage: View {
  var body: some View {
    emptyMessage(
      image: "calendar.badge.exclamationmark",
      title: "Aucun cours prochainement",
      description: "Vous n'avez pas de cours à l'horizon."
    )
  }
}

