import { useState, useEffect } from 'react';
import { useSettingsStore } from "@/stores/settings";
import { predictHomework } from "@/utils/magic/prediction";
import { error } from '@/utils/logger/logger';

export const useMagicPrediction = (content: string) => {
  const [magic, setMagic] = useState<string | undefined>(undefined);
  const magicEnabled = useSettingsStore(state => state.personalization.magicEnabled);

  useEffect(() => {
    let isCancelled = false;
    if (content && magicEnabled) {
      predictHomework(content, magicEnabled)
        .then(p => !isCancelled && setMagic(p))
        .catch(e => !isCancelled && error(e));
    } else {
      setMagic(undefined);
    }
    return () => {
      isCancelled = true;
    };
  }, [content, magicEnabled]);

  return magic;
};
