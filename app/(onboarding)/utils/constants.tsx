import { Services } from '@/stores/account/types';
import * as Papicons from '@getpapillon/papicons';
import { useTheme } from '@react-navigation/native';

export interface SupportedService {
    name: string;
    title: string;
    type: string;
    image?: any;
    onPress: () => void;
    variant: string;
    color?: string;
    icon?: React.ReactNode;
    style?: { [key: string]: any }
}

export function getSupportedServices(redirect: (path: { pathname: string }) => void): SupportedService[] {
    const theme = useTheme();
    const { colors } = theme;

    return [
        {
            name: "pronote",
            title: "PRONOTE",
            type: "main",
            image: require("@/assets/images/service_pronote.png"),
            onPress: () => {
                redirect({ pathname: './pronote/method' });
            },
            variant: 'service' as const,
            color: 'light' as const,
        },
        {
            name: "ed",
            title: "ÉcoleDirecte",
            type: "main",
            image: require("@/assets/images/service_ed.png"),
            onPress: () => {

            },
            variant: 'service' as const,
            color: 'light' as const,
        },
        {
            name: "skolengo",
            title: "Skolengo",
            type: "main",
            image: require("@/assets/images/service_skolengo.png"),
            onPress: () => {

            },
            variant: 'service' as const,
            color: 'light' as const,
        },
        {
            name: "separator",
            title: "separator",
            type: "separator",
            image: require("@/assets/images/service_skolengo.png"),
            onPress: () => {

            },
            variant: 'service' as const,
            color: 'light' as const,
        },
        {
            name: "university",
            title: "Service universitaire",
            type: "other",
            icon: <Papicons.University />,
            onPress: () => {
                redirect({ pathname: './university/method' });

            },
            variant: 'primary' as const,
            style: { backgroundColor: theme.dark ? colors.border : "black" },
        },
        {
            name: "university",
            title: "Service restauratif",
            type: "other",
            icon: <Papicons.Cutlery />,
            onPress: () => {
                redirect({ pathname: './university/method' });

            },
            variant: 'primary' as const,
            color: 'light' as const
        }
    ]
}

export interface SupportedUniversity {
    name: string;
    title: string;
    hasLimitedSupport: boolean;
    image: any;
    type: string;
    onPress: () => void;
}

export function getSupportedUniversities(redirect: (path: { pathname: string }) => void): SupportedUniversity[] {
    return [
        {
            name: "univ-lorraine",
            title: "Université de Lorraine",
            hasLimitedSupport: false,
            image: require("@/assets/images/univ_lorraine.png"),
            type: "main",
            onPress: () => { }
        },
        {
            name: "univ-nimes",
            title: "Université de Nîmes",
            hasLimitedSupport: false,
            image: require("@/assets/images/univ_nimes.png"),
            type: "main",
            onPress: () => { }
        },
        {
            name: "univ-uphf",
            title: "Université Polytechnique Hauts-de-France",
            hasLimitedSupport: false,
            image: require("@/assets/images/univ_uphf.png"),
            type: "main",
            onPress: () => { }
        },
        {
            name: "iut-lannion",
            title: "IUT de Lannion",
            hasLimitedSupport: false,
            image: require("@/assets/images/univ_lannion.png"),
            type: "main",
            onPress: () => { }
        },
        {
            name: "limited-functions",
            title: "Fonctionnalités limitées",
            hasLimitedSupport: true,
            image: require("@/assets/images/univ_lannion.png"),
            type: "separator",
            onPress: () => { }
        },
        {
            name: "univ-rennes-1",
            title: "Université de Rennes 1",
            hasLimitedSupport: true,
            image: require("@/assets/images/univ_rennes1.png"),
            type: "main",
            onPress: () => { }
        },
        {
            name: "univ-rennes-2",
            title: "Université de Rennes 2",
            hasLimitedSupport: true,
            image: require("@/assets/images/univ_rennes2.png"),
            type: "main",
            onPress: () => { }
        },
        {
            name: "univ-limoges",
            title: "Université de Limoges",
            type: "main",
            hasLimitedSupport: true,
            image: require("@/assets/images/univ_limoges.png"),
            onPress: () => { }
        },
        {
            name: "univ_paris_sorbonne",
            title: "Université de Sorbonne Paris Nord",
            hasLimitedSupport: true,
            image: require("@/assets/images/univ_paris_sorbonne.png"),
            type: "main",
            onPress: () => { }
        }
    ]
}

export interface LoginMethod {
    id: string,
    availableFor: Array<Services>,
    description: string,
    icon: React.ReactNode,
    onPress: () => void;
}

export function getLoginMethods(redirect: (path: { pathname: string }) => void): LoginMethod[] {
    return [
        {
            id: "map",
            availableFor: [Services.PRONOTE],
            description: "Utiliser ma position",
            icon: <Papicons.MapPin />,
            onPress: async () => {
                redirect({ pathname: './location' });
            }
        },
        {
            id: "search",
            availableFor: [Services.PRONOTE],
            description: "Rechercher une ville",
            icon: <Papicons.Search />,
            onPress: () => {
                console.log("search pressed")
            }
        },
        {
            id: "qrcode",
            availableFor: [Services.PRONOTE],
            description: "J'ai un QR-Code",
            icon: <Papicons.QrCode />,
            onPress: () => {
                console.log("qrcode pressed")
            }
        },
        {
            id: "url",
            availableFor: [Services.PRONOTE],
            description: "J'ai une URL de connexion",
            icon: <Papicons.Link />,
            onPress: () => {
                redirect({ pathname: './url' });
            }
        }
    ]
}