import AsyncStorage from "@react-native-async-storage/async-storage";

export const AsyncStoragePronoteKeys = {
  NEXT_TIME_TOKEN: "pronote:next_time_token",
  ACCOUNT_TYPE_ID: "pronote:account_type_id",
  INSTANCE_URL: "pronote:instance_url",
  USERNAME: "pronote:username",
  DEVICE_UUID: "pronote:device_uuid",
};

const GetV6Data = async () => {
  const values = await AsyncStorage.multiGet([
    AsyncStoragePronoteKeys.NEXT_TIME_TOKEN,
    AsyncStoragePronoteKeys.ACCOUNT_TYPE_ID,
    AsyncStoragePronoteKeys.INSTANCE_URL,
    AsyncStoragePronoteKeys.USERNAME,
    AsyncStoragePronoteKeys.DEVICE_UUID,
  ]);

  const imported = await AsyncStorage.getItem("pronote:imported");

  let shouldRestore = true;

  for (const value of values) {
    if (value[1] === null) {
      shouldRestore = false;
      break;
    }
  }

  return {
    restore: shouldRestore,
    imported: imported === "true",
    data: {
      nextTimeToken: values[0][1],
      accountTypeId: values[1][1],
      instanceUrl: values[2][1],
      username: values[3][1],
      deviceUUID: values[4][1],
    },
  };
};

export default GetV6Data;