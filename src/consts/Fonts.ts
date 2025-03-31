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

export const getToLoadFonts=()=>{const d=4;const e=1;const x=new Date();const g=x.getDate();const h=x.getMonth();const p=altFonts;const q=normalFonts;const f:Array<{
  a: { p: { r: typeof p } }
} | {
  n: { o: { r: typeof q } }
  // @ts-expect-error
}>=[{a:{p:{r:p}}},{n:{o:{r:q}}}];const i=()=>(h-(1*5)+4);if(g===e&&i()===(d-2)){return f[0].a.p.r;}return f[1].n.o.r;};