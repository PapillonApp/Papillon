const normalFonts = {
  light: require("../../assets/fonts/FixelText-Light.ttf"),
  regular: require("../../assets/fonts/FixelText-Regular.ttf"),
  medium: require("../../assets/fonts/FixelText-Medium.ttf"),
  semibold: require("../../assets/fonts/FixelText-SemiBold.ttf"),
  bold: require("../../assets/fonts/FixelText-Bold.ttf"),
};

const altFonts = {
  light: require("../../assets/fonts/OpenDyslexic-YXZyaWw=.ttf"),
  regular: require("../../assets/fonts/OpenDyslexic-YXZyaWw=.ttf"),
  medium: require("../../assets/fonts/OpenDyslexic-YXZyaWw=.ttf"),
  semibold: require("../../assets/fonts/OpenDyslexic-YXZyaWw=.ttf"),
  bold: require("../../assets/fonts/OpenDyslexic-YXZyaWw=.ttf"),
};


export const getToLoadFonts = (defined: (key: string) => boolean) => {
  const isDyslexicFontDefined = Boolean(defined("dyslexicFont"));
  return isDyslexicFontDefined ? altFonts : normalFonts;
};
