import { Papicons } from '@getpapillon/papicons';
import { CircularProgress } from '@/ui/components/CircularProgress';
import { useTheme } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { Dimensions, FlatList, View, StyleSheet } from 'react-native';
import Reanimated, { FadeInDown, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';

import Stack from '@/ui/components/Stack';
import Typography from "@/ui/components/Typography";
import adjust from '@/utils/adjustColor';

export const Loading = ({ isCurrent }: { isCurrent: boolean, sliderRef: React.RefObject<FlatList> }) => {
    const { colors } = useTheme();
    const [progress, setProgress] = useState(0);
    const [stepText, setStepText] = useState("Démarrage...");
    const [animationKey, setAnimationKey] = useState(0);

    useEffect(() => {
        if (isCurrent) {
            setProgress(0);
            setStepText("Démarrage...");
            setAnimationKey(prev => prev + 1);
            const startTime = Date.now();
            const duration = 10000;

            const interval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const newProgress = Math.min((elapsed / duration) * 100, 100);

                setProgress(newProgress);

                if (newProgress < 30) {
                    setStepText("Analyse de tes résultats...");
                } else if (newProgress < 60) {
                    setStepText("Compilation des souvenirs...");
                } else if (newProgress < 90) {
                    setStepText("Génération des statistiques...");
                } else {
                    setStepText("Finitions...");
                }

                if (newProgress >= 100) {
                    clearInterval(interval);
                    setStepText("C'est prêt !");
                }
            }, 50);

            return () => clearInterval(interval);
        }
    }, [isCurrent]);

    return (
        <View style={{ width: "100%", height: Dimensions.get('screen').height, justifyContent: 'center', alignItems: 'center' }}>
            {isCurrent && (
                <>
                    <Reanimated.View
                        entering={FadeInDown.springify().dampingRatio(0.5).duration(1800).delay(200)}
                        exiting={FadeOut.duration(800)}
                        style={{ alignItems: 'center', gap: 32 }}
                    >
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <CircularProgress
                                key={animationKey}
                                radius={80}
                                strokeWidth={12}
                                backgroundColor={adjust(colors.background, 0.1) + '20'}
                                fill={adjust(colors.background, 0.1)}
                                percentageComplete={progress}
                            />
                            {progress >= 100 && (
                                <Reanimated.View
                                    entering={ZoomIn.springify().dampingRatio(0.6)}
                                    style={{ position: 'absolute' }}
                                >
                                    <Papicons name="Check" size={80} color={adjust(colors.background, 0.1)} />
                                </Reanimated.View>
                            )}
                        </View>

                        <View style={{ alignItems: 'center', gap: 8 }}>
                            {progress < 100 && (
                                <Reanimated.View exiting={ZoomOut.duration(300)}>
                                    <Typography variant="h1" weight="bold" align='center' color={adjust(colors.background, 0.1)}>
                                        {Math.round(progress)}%
                                    </Typography>
                                </Reanimated.View>
                            )}
                            <Typography variant="body1" align='center' color={adjust(colors.background, 0.3)} style={{ opacity: 0.8, minWidth: 250 }}>
                                {stepText}
                            </Typography>
                        </View>
                    </Reanimated.View>

                    {progress >= 100 && (
                        <Reanimated.View
                            entering={ZoomIn.delay(400).springify().duration(800).dampingRatio(0.5)}
                            style={{
                                position: "absolute",
                                bottom: 70
                            }}
                        >
                            <Stack direction='horizontal' hAlign='center' gap={5}>
                                <Papicons name='ArrowUp' color='white' />
                                <Typography variant='h4' color='white'>Swipe pour découvrir</Typography>
                            </Stack>
                        </Reanimated.View>
                    )}
                </>
            )}
        </View>
    );
};
