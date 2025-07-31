import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";
import { log } from "@/utils/logger/logger";
export var useNewsStore = create()(persist(function (set) { return ({
    informations: [],
    updateInformations: function (informations) {
        log("updating store...", "news:updateInformations");
        set(function () { return ({ informations: informations }); });
        log("updated store.", "news:updateInformations");
    }
}); }, {
    name: "<default>-news-storage", // <default> will be replace to user id when using "switchTo"
    storage: createJSONStorage(function () { return AsyncStorage; })
}));
