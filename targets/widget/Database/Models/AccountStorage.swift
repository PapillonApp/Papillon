//
//  AccountStorage.swift
//  Papillon
//
//  Created by Rémy Godet on 01/02/2026.
//

struct AccountStorageSubjectCustomisationModel: Decodable {
  let emoji: String;
  let name: String;
  let color: String;
}

struct AccountStorageCustomisationModel: Decodable {
  let profilePicture: String;
  let subjects: [String: AccountStorageSubjectCustomisationModel]
}

struct AccountStorageAccountModel: Decodable {
  let id: String;
  let firstName: String;
  let lastName: String;
  let schoolName: String;
  let className: String;
  // Services data is ignored, not useful in our case and limit crash.
  let createdAt: String;
  let updatedAt: String;
  let customisation: AccountStorageCustomisationModel;
}

struct AccountStorageStateModel: Decodable {
  let lastUsedAccount: String;
  let accounts: [AccountStorageAccountModel];
  
}

struct AccountStorageModel: Decodable {
  let state: AccountStorageStateModel;
  let version: Int;
}
