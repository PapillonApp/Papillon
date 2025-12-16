import { ScrollView, View, Dimensions } from 'react-native';
import React from 'react';
import Typography from '@/ui/components/Typography';
import { useWrappedStats } from '@/database/useWrappedStats';

export const StatsDev = ({ isCurrent }: { isCurrent: boolean }) => {
    const { topSubject, topTeacher, topRoom, totalHours } = useWrappedStats();

    return (
        <View style={{ width: "100%", height: Dimensions.get('screen').height }}>
            {isCurrent && (
                <ScrollView style={{ flex: 1, backgroundColor: '#000000', paddingTop: 100, paddingHorizontal: 20 }}>
                    <View style={{ gap: 15 }}>
                        <View>
                            <Typography variant="body1" color="#FFFFFF" style={{ opacity: 0.7 }}>Matière préférée</Typography>
                            <Typography variant="h4" color="#FFFFFF">{topSubject || "N/A"}</Typography>
                        </View>
                        <View>
                            <Typography variant="body1" color="#FFFFFF" style={{ opacity: 0.7 }}>Prof préféré</Typography>
                            <Typography variant="h4" color="#FFFFFF">{topTeacher || "N/A"}</Typography>
                        </View>
                        <View>
                            <Typography variant="body1" color="#FFFFFF" style={{ opacity: 0.7 }}>Salle préférée</Typography>
                            <Typography variant="h4" color="#FFFFFF">{topRoom || "N/A"}</Typography>
                        </View>
                        <View>
                            <Typography variant="body1" color="#FFFFFF" style={{ opacity: 0.7 }}>Heures de cours</Typography>
                            <Typography variant="h4" color="#FFFFFF">{totalHours ? `${totalHours}h` : "0h"}</Typography>
                        </View>
                    </View>
                </ScrollView>
            )}
        </View>
    );
};
