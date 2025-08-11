import { Services } from '@/stores/account/types';
import Icon from '@/ui/components/Icon';
import { log } from '@/utils/logger/logger';
import * as Papicons from '@getpapillon/papicons';
import { useTheme } from '@react-navigation/native';
import { Image } from "react-native"

export function getSupportedServices(handleStepChange: (newStep: number, newText: string, duration?: number, heightMultiplierRaw?: number, newStepId?: string) => void, setBackgroundColor: (color: string) => void, setSelectedService: (service: Services) => void) {
    const theme = useTheme();
    const { colors } = theme;

    return [
        {
            name: "pronote",
            title: "PRONOTE",
            type: "main",
            image: <Image source={require("@/assets/images/service_pronote.png")} style={{ width: 32, height: 32 }} />,
            onPress: () => {
                handleStepChange(2, "Comment souhaites-tu te connecter ?", 600, 0.60, "select-method");
                setBackgroundColor("#E37900");
                setSelectedService(Services.PRONOTE)
            },
            variant: 'service' as const,
            color: 'light' as const,
        },
        {
            name: "ed",
            title: "ÉcoleDirecte",
            type: "main",
            image: <Image source={require("@/assets/images/service_ed.png")} style={{ width: 32, height: 32 }} />,
            onPress: () => {
                handleStepChange(2, "Comment souhaites-tu te connecter ?");
                setBackgroundColor("#E37900");
                setSelectedService(Services.ECOLEDIRECTE)
            },
            variant: 'service' as const,
            color: 'light' as const,
        },
        {
            name: "skolengo",
            title: "Skolengo",
            type: "main",
            image: <Image source={require("@/assets/images/service_skolengo.png")} style={{ width: 32, height: 32 }} />,
            onPress: () => {
                setBackgroundColor("#E37900");
                log("Skolengo login");
            },
            variant: 'service' as const,
            color: 'light' as const,
        },
        {
            name: "university",
            title: "Service universitaire",
            type: "other",
            image: (
                <Icon papicon size={24} fill={"white"} style={{ backgroundColor: "transparent" }}>
                    <Papicons.University />
                </Icon>
            ),
            onPress: () => {
                handleStepChange(1, "Sélectionne ton service universitaire", undefined, undefined, "select-univ-service");
                setBackgroundColor("#000000");
                log("University login");
            },
            variant: 'primary' as const,
            style: { backgroundColor: theme.dark ? colors.border : "black" },
        },
    ]
}

export function getLoginMethods(handleStepChange: (newStep: number, newText: string, duration?: number, heightMultiplierRaw?: number, newStepId?: string) => void, setBackgroundColor: (color: string) => void) {
    return [
        {
            id: "map",
            availableFor: [Services.PRONOTE],
            description: "Utiliser ma position",
            icon: (
                <Icon papicon size={24} fill={"#5B5B5B"} style={{ backgroundColor: "transparent" }}>
                    <Papicons.MapPin />
                </Icon>
            ),
            onPress: () => {
                console.log("map pressed")
            }
        },
        {
            id: "search",
            availableFor: [Services.PRONOTE],
            description: "Rechercher une ville",
            icon: (
                <Icon papicon size={24} fill={"#5B5B5B"} style={{ backgroundColor: "transparent" }}>
                    <Papicons.Search />
                </Icon>
            ),
            onPress: () => {
                console.log("search pressed")
            }
        },
        {
            id: "qrcode",
            availableFor: [Services.PRONOTE],
            description: "J'ai un QR-Code",
            icon: (
                <Icon papicon size={24} fill={"#5B5B5B"} style={{ backgroundColor: "transparent" }}>
                    <Papicons.QrCode />
                </Icon>
            ),
            onPress: () => {
                console.log("qrcode pressed")
            }
        },
        {
            id: "url",
            availableFor: [Services.PRONOTE],
            description: "J'ai une URL de connexion",
            icon: (
                <Icon papicon size={24} fill={"#5B5B5B"} style={{ backgroundColor: "transparent" }}>
                    <Papicons.Link />
                </Icon>
            ),
            onPress: () => {
                handleStepChange(2, "Indique l'adresse URL de ton établissement", undefined, 0.8, "enter-url")
                setBackgroundColor("#C6C6C6C6")
            }
        }
    ]
}