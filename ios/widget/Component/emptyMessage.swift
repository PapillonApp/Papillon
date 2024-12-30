import SwiftUI

struct emptyMessage: View {
  
  var image: String
  var title: String
  var description: String
  
    var body: some View {
      Spacer()
      Image(systemName: image)
          .foregroundColor(.gray)
          .font(.title)
          .frame(maxWidth: .infinity, alignment: .center)
      Spacer()
              .frame(height: 6)
      Text(title)
          .font(.system(.headline, design: .rounded))
          .frame(maxWidth: .infinity, alignment: .center)
          .multilineTextAlignment(.center)
      Spacer()
              .frame(height: 2)
      Text(description)
          .foregroundColor(.gray)
          .font(.system(size: 15, design: .rounded))
          .frame(maxWidth: .infinity, alignment: .center)
          .multilineTextAlignment(.center)
      Spacer()
    }
}
