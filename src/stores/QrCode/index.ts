import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";
import { log } from "@/utils/logger/logger";
import { QrCode, QrCodeStore } from "./types";
import uuid from "@/utils/uuid-v4";

/**
 * Store for restaurant QR codes.
 * Every QR code got a id, a name, and a data
 */
export const useQrCodeStore = create<QrCodeStore>()(
  persist(
    (set, get) => ({
      codes: [],

      addQrCode: (name, data) => {
        const newQrCode: QrCode = {
          id: uuid(),
          name,
          data
        };

        log(`Ajout d'un nouveau QR code: ${name}`, "qrCode:addQrCode");

        set((state) => ({
          codes: [...state.codes, newQrCode]
        }));

        return newQrCode;
      },

      removeQrCode: (id) => {
        log(`Suppression du QR code avec l'ID: ${id}`, "qrCode:removeQrCode");

        set((state) => ({
          codes: state.codes.filter(code => code.id !== id)
        }));
      },

      getQrCode: (id) => {
        return get().codes.find(code => code.id === id);
      },

      getAllQrCodes: () => {
        return get().codes;
      }
    }),
    {
      name: "qrcode-storage",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);