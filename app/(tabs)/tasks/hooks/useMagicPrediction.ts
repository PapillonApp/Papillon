import { useState, useEffect } from 'react';
import { useSettingsStore } from "@/stores/settings";
import { predictHomework } from "@/utils/magic/prediction";
import { MAGIC_AVAILABLE } from "@/utils/magic/tflite";
import { error } from '@/utils/logger/logger';

export const useMagicPrediction = (content: string) => {
  const [magic, setMagic] = useState<string | undefined>(undefined);
  const magicEnabled = useSettingsStore(state => state.personalization.magicEnabled);

  useEffect(() => {
    let isCancelled = false;
    if (MAGIC_AVAILABLE && content && magicEnabled) {
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
