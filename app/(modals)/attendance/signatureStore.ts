let tempSignature: string | null = null;

export const setTempSignature = (sig: string | null) => {
  tempSignature = sig;
};

export const getTempSignature = () => {
  return tempSignature;
};
