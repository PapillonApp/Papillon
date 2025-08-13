import { Services } from '@/stores/account/types';
import { useAlert } from '@/ui/components/AlertProvider';
import Icon from '@/ui/components/Icon';
import { log } from '@/utils/logger/logger';
import { getCurrentPosition } from '@/utils/native/position';
import * as Papicons from '@getpapillon/papicons';
import { useTheme } from '@react-navigation/native';
import { Image } from "react-native"

export function getSupportedServices(redirect: (path: string) => void) {
    const theme = useTheme();
    const { colors } = theme;

    return [
        {
            name: "pronote",
            title: "PRONOTE",
            type: "main",
            image: require("@/assets/images/service_pronote.png"),
            onPress: () => {
                redirect('./pronote/method');
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
            type: "separator"
        },
        {
            name: "university",
            title: "Service universitaire",
            type: "other",
            icon: <Papicons.University />,
            onPress: () => {
                redirect('./university/method');

            },
            variant: 'primary' as const,
            style: { backgroundColor: theme.dark ? colors.border : "black" },
        },
    ]
}

export function getSupportedUniversities(handleStepChange: (newStep: number, newText: string, duration?: number, heightMultiplierRaw?: number, newStepId?: string) => void, setBackgroundColor: (color: string) => void, setSelectedService: (service: Services) => void) {
    return [
        {
            name: "univ-lorraine",
            title: "Université de Lorraine",
            hasLimitedSupport: false,
            image: require("@/assets/images/univ_lorraine.png"),
            onPress: () => { }
        },
        {
            name: "univ-nimes",
            title: "Université de Nîmes",
            hasLimitedSupport: false,
            image: require("@/assets/images/univ_nimes.png"),
            onPress: () => { }
        },
        {
            name: "univ-uphf",
            title: "Université Polytechnique Hauts-de-France",
            hasLimitedSupport: false,
            image: require("@/assets/images/univ_uphf.png"),
            onPress: () => { }
        },
        {
            name: "iut-lannion",
            title: "IUT de Lannion",
            hasLimitedSupport: false,
            image: require("@/assets/images/univ_lannion.png"),
            onPress: () => { }
        },
        {
            name: "univ-rennes-1",
            title: "Université de Rennes 1",
            hasLimitedSupport: true,
            image: require("@/assets/images/univ_rennes1.png"),
            onPress: () => { }
        },
        {
            name: "univ-rennes-2",
            title: "Université de Rennes 2",
            hasLimitedSupport: true,
            image: require("@/assets/images/univ_rennes2.png"),
            onPress: () => { }
        },
        {
            name: "univ-limoges",
            title: "Université de Limoges",
            hasLimitedSupport: true,
            image: require("@/assets/images/univ_limoges.png"),
            onPress: () => { }
        },
        {
            name: "univ_paris_sorbonne",
            title: "Université de Sorbonne Paris Nord",
            hasLimitedSupport: true,
            image: require("@/assets/images/univ_paris_sorbonne.png"),
            onPress: () => { }
        }
    ]
}

export function getLoginMethods(redirect: (path: string) => void) {
    const alert = useAlert()

    return [
        {
            id: "map",
            availableFor: [Services.PRONOTE],
            description: "Utiliser ma position",
            icon: <Papicons.MapPin />,
            onPress: async () => {
                redirect('./location');
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
                redirect('./url');
            }
        }
    ]
}