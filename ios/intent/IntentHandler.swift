import Intents

// Modify the function to return an array of IntentAccount, which is the expected type.
func retrieveAccountsData() -> [IntentAccount]? {
    let sharedDefaults = UserDefaults(suiteName: "group.xyz.getpapillon.ios")
    
    // Check if we have a valid JSON string from UserDefaults
    if let jsonString = sharedDefaults?.string(forKey: "accounts"),
       let jsonData = jsonString.data(using: .utf8) {
        
        do {
            // Parse the JSON data into an array of dictionaries
            if let jsonArray = try JSONSerialization.jsonObject(with: jsonData, options: []) as? [[String: Any]] {
                var accounts = [IntentAccount]()
                
                // Iterate through each dictionary in the JSON array
                for schoolDict in jsonArray {
                    if let name = schoolDict["name"] as? String,
                       let schoolName = schoolDict["schoolName"] as? String,
                       let localID = schoolDict["localID"] as? String{
                        
                        // Create an IntentAccount object from the dictionary
                        let account = IntentAccount(identifier: localID, display: name + " - " + schoolName)
                        
                        // Append it to the array
                        accounts.append(account)
                    }
                }
                print(accounts)
                return accounts
            }
        } catch {
            print("Error decoding JSON: \(error)")
        }
    }
    
    // Return nil if no data was found or an error occurred
    return nil
}

// Define the IntentHandler class which will handle the SelectAccountIntent
class IntentHandler: INExtension, SelectAccountIntentHandling {
    
    // Implement the provideSelectedOptionsCollection method to return a collection of accounts
    func provideSelectedOptionsCollection(for intent: SelectAccountIntent) async throws -> INObjectCollection<IntentAccount> {
        // Retrieve the accounts data
        if let accounts = retrieveAccountsData() {
            // Create and return the collection of IntentAccount objects
            print(accounts)
            return INObjectCollection(items: accounts)
          
        } else {
            // Return an empty collection if no data is found
          print("No accounts found")
            return INObjectCollection(items: [])
        }
    }
    
    // Default handler for all intents
    override func handler(for intent: INIntent) -> Any {
        return self
    }
}
