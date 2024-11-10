import * as Device from "expo-device";

const defaultRadius = 5.0;

const radiuses = [
  {
    devices: "X, Xs, Xs max, 11 pron 11 pro max",
    radius: 39.0,
  },
  {
    devices: "Xr, 11",
    radius: 41.5,
  },
  {
    devices: "12 mini, 13 mini",
    radius: 45.0,
  },
  {
    devices: "12, 12 pro, 13, 13 pro, 14",
    radius: 47.33,
  },
  {
    devices: "12 pro max, 13 pro max, 14 plus",
    radius: 53.33,
  },
  {
    devices: "14 pro, 14 pro max, 15, 15 plus, 15 pro, 15 pro max",
    radius: 55.0,
  },
  {
    devices: "16, 16 pro, 16 pro max, 16 plus",
    radius: 59.0,
  },
  {
    devices: "pixel 3",
    radius: 20.0,
  },
  {
    devices: "ipad (10th generation)",
    radius: 22.0,
  },
];

const getCorners = (): number => {
  let modelName = Device.modelName;

  if (!modelName || modelName.toLowerCase().includes("simulator")) {
    modelName = Device.deviceName?.toLowerCase() || null;
  }

  if (!modelName) return defaultRadius;

  // make device name lowercase
  let device = modelName.toLowerCase();

  // if device starts with "iphone" remove it
  device = device.replace("iphone", "");
  device = device.trim();

  const corner =
    device.length > 0 && radiuses.find((r) => r.devices.includes(device));
  return corner ? corner.radius : defaultRadius;
};

export default getCorners;
