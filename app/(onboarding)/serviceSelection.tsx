import React from 'react';
import { View, StyleSheet, Image, Dimensions, FlatList, Pressable } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { RelativePathString, router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';

import Typography from '@/ui/components/Typography';
import Stack from '@/ui/components/Stack';

import * as Papicons from '@getpapillon/papicons';
import Icon from '@/ui/components/Icon';
import ViewContainer from '@/ui/components/ViewContainer';
import { getSupportedServices, SupportedService } from './utils/constants';
import AnimatedPressable from '@/ui/components/AnimatedPressable';
import Reanimated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const height = 480;

export default function WelcomeScreen() {
    const theme = useTheme();
    const { colors } = theme;
    const insets = useSafeAreaInsets();
    const animation = React.useRef<LottieView>(null);

    const services = getSupportedServices((path: { pathname: string }) => {
        router.push(path.pathname as unknown as RelativePathString);
    });

    useFocusEffect(
        React.useCallback(() => {
            if (animation.current) {
                animation.current.reset();
                animation.current.play();
            }
        }, [])
    );

    return (
        <ViewContainer>
            <Stack
                padding={32}
                backgroundColor='#D51A67'
                gap={20}
                style={{
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    borderBottomLeftRadius: 42,
                    borderBottomRightRadius: 42,
                    paddingBottom: 34,
                    borderCurve: "continuous",
                    height: height,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 2,
                }}
            >
                <LottieView
                    autoPlay
                    loop={false}
                    style={{ width: 230, height: 230 }}
                    source={require('@/assets/lotties/school-services.json')}
                />
                <Stack
                    vAlign='start'
                    hAlign='start'
                    width="100%"
                    gap={12}
                >
                    <Typography
                        variant="h5"
                        style={{ color: "#FFFFFF80", lineHeight: 22, fontSize: 18 }}
                    >
                        Étape 1 sur 3
                    </Typography>
                    <Typography
                        variant="h1"
                        style={{ color: "white", fontSize: 32, lineHeight: 34 }}
                    >
                        Sélectionne ton
                        service scolaire
                    </Typography>
                </Stack>
            </Stack>

            <FlatList
                showsVerticalScrollIndicator={false}
                data={services}
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingTop: height + 16,
                    paddingHorizontal: 16,
                    paddingBottom: insets.bottom + 16,
                    gap: 9,
                }}
                renderItem={({ item, index }) =>
                    item.type === 'separator' ? (
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 18,
                                marginVertical: 6,
                                opacity: 0.4,
                                marginHorizontal: 32,
                            }}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    height: 2,
                                    borderRadius: 4,
                                    backgroundColor: colors.text,
                                    opacity: 0.5
                                }}
                            />
                            <Typography variant='title' inline>ou</Typography>
                            <View
                                style={{
                                    flex: 1,
                                    height: 2,
                                    borderRadius: 4,
                                    backgroundColor: colors.text,
                                    opacity: 0.5
                                }}
                            />
                        </View>
                    ) :
                        (
                            <Reanimated.View
                                entering={FadeInDown.springify().duration(400).delay(index * 80 + 150)}

                            >
                                <AnimatedPressable
                                    onPress={() => {
                                        requestAnimationFrame(() => {
                                            (item as SupportedService).onPress();
                                        });
                                    }}
                                    style={[
                                        {
                                            paddingHorizontal: 18,
                                            paddingVertical: 14,
                                            borderColor: colors.border,
                                            borderWidth: 1.5,
                                            borderRadius: 80,
                                            borderCurve: "continuous",
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            display: 'flex',
                                            gap: 16,
                                        },
                                        item.type == "other" && {
                                            backgroundColor: colors.text,
                                            borderColor: colors.text,
                                        }
                                    ]}
                                >
                                    <View style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                                        {(item as SupportedService).icon ?
                                            <Icon size={28} papicon fill={item.type == "other" ? colors.background : undefined}>
                                                {item.icon}
                                            </Icon>
                                            :
                                            <Image
                                                source={item.image}
                                                style={{ width: 32, height: 32 }}
                                                resizeMode="cover"
                                            />
                                        }
                                    </View>
                                    <Typography style={{ flex: 1 }} numberOfLines={1} variant='title' color={item.type == "other" ? colors.background : undefined}>
                                        {item.title}
                                    </Typography>
                                </AnimatedPressable>
                            </Reanimated.View>
                        )}
            />

            <Pressable
                onPress={() => router.back()}
                style={{
                    position: 'absolute',
                    left: 16,
                    top: insets.top + 4,
                    zIndex: 200,
                    backgroundColor: '#ffffff42',
                    padding: 10,
                    borderRadius: 100,
                }}
            >
                <Icon size={26} fill={"#fff"} papicon>
                    <Papicons.Back />
                </Icon>
            </Pressable>
        </ViewContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
    },
});
