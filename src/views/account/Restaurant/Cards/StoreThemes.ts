
export interface StoreTheme {
  id: string;
  name: string;
  colors: {
    text: string;
    background: string;
    accent: string;
  };
  background: any;
  links?: [
    {
      label: string;
      subtitle?: string;
      sfSymbol?: string;
      url: string;
    }
  ];
}

export const STORE_THEMES = [
  {
    id: "unknown",
    name: "Service de cantine",
    colors: {
      text: "#FFFFFF",
      background: "#29947A",
      accent: "#134438",
    },
    background: require("../../../../../assets/images/cards/Carte_Cover_Unknown.png"),
  },
  {
    id: "Izly",
    name: "Izly by Crous",
    colors: {
      text: "#FFFFFF",
      background: "#2E174F",
      accent: "#DD1314",
    },
    background: require("../../../../../assets/images/cards/Carte_Cover_Izly.png"),
    links: [
      {
        label: "Recharger ou gérer ma carte",
        subtitle: "Mon Espace Izly",
        sfSymbol: "arrow.up.forward.app",
        url: "https://mon-espace.izly.fr/",
      },
    ],
  },
  {
    id: "Turboself",
    name: "TurboSelf",
    colors: {
      text: "#FFFFFF",
      background: "#840016",
      accent: "#DD1314",
    },
    background: require("../../../../../assets/images/cards/Carte_Cover_Turboself.png"),
  },
  {
    id: "ARD",
    name: "ARD",
    colors: {
      text: "#FFFFFF",
      background: "#295888",
      accent: "#3DB7A5",
    },
    background: require("../../../../../assets/images/cards/Carte_Cover_ARD.png"),
  },
  {
    id: "Alise",
    name: "Alise",
    colors: {
      text: "#FFFFFF",
      background: "#339DD7",
      accent: "#AFDEF8",
    },
    background: require("../../../../../assets/images/cards/Carte_Cover_Alise.png"),
  },
];