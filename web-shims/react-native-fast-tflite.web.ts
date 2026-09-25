// Shim web/desktop pour `react-native-fast-tflite`.
//
// Ce module n'existe qu'en natif (iOS/Android) : il n'y a pas de runtime TFLite
// sur le web/Electron/Tauri. `ModelManager` (utils/magic/ModelManager.ts) gère
// déjà très proprement l'échec d'initialisation du modèle (try/catch + retour
// `{ success: false, error }`), donc on se contente ici de rejeter poliment au
// lieu de planter le bundling. La fonctionnalité "Magic" est simplement
// indisponible sur PC — comme demandé.

export type TensorflowModel = {
  run: (inputs: unknown[]) => Promise<unknown[]>;
};

export function loadTensorflowModel(): Promise<TensorflowModel> {
  return Promise.reject(
    new Error("react-native-fast-tflite n'est pas disponible sur cette plateforme (web/desktop).")
  );
}

export default { loadTensorflowModel };
