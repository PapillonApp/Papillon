import { router } from 'expo-router';
import { useEffect } from 'react';

export default function NotFoundScreen() {
  useEffect(() => {
    // Route inconnue (ex: lien profond invalide) : on ferme tous les modaux
    // ouverts et on repart sur l'accueil, comme si l'app venait d'être relancée.
    router.dismissAll();
    router.replace('/');
  }, []);

  return null;
}
