import { useTheme } from 'expo-router/react-navigation';
import React, { memo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import SkeletonView from '@/ui/components/SkeletonView';

const SKELETON_SECTIONS = [3, 2, 4];

/** Placeholder subjects shown while the period's grades are still loading. */
const GradesLoading = memo(() => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {SKELETON_SECTIONS.map((rows, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <View style={styles.sectionTitle}>
            <SkeletonView style={styles.emoji} />
            <SkeletonView style={[styles.subjectName, { width: 120 + sectionIndex * 30 }]} />
            <View style={styles.spacer} />
            <SkeletonView style={styles.subjectAverage} />
          </View>

          {Array.from({ length: rows }).map((_, rowIndex) => {
            const isFirst = rowIndex === 0;
            const isLast = rowIndex === rows - 1;

            return (
              <View
                key={rowIndex}
                style={[
                  styles.row,
                  {
                    backgroundColor: colors.item,
                    borderTopLeftRadius: isFirst ? 20 : 8,
                    borderTopRightRadius: isFirst ? 20 : 8,
                    borderBottomLeftRadius: isLast ? 20 : 8,
                    borderBottomRightRadius: isLast ? 20 : 8,
                    marginBottom: Platform.OS === 'android' && !isLast ? 4 : 0,
                  },
                ]}
              >
                <View style={styles.rowBody}>
                  <SkeletonView style={[styles.description, { width: `${60 - rowIndex * 8}%` }]} />
                  <SkeletonView style={styles.date} />
                </View>
                <SkeletonView style={styles.score} />
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
});
GradesLoading.displayName = 'GradesLoading';

const styles = StyleSheet.create({
  container: {
    gap: 20,
    width: '100%',
  },
  section: {
    width: '100%',
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  spacer: {
    flex: 1,
  },
  emoji: {
    width: 22,
    height: 22,
    borderRadius: 6,
  },
  subjectName: {
    height: 17,
    borderRadius: 4,
  },
  subjectAverage: {
    width: 48,
    height: 17,
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    overflow: 'hidden',
  },
  rowBody: {
    flex: 1,
    gap: 6,
  },
  description: {
    height: 15,
    borderRadius: 4,
  },
  date: {
    width: '35%',
    height: 12,
    borderRadius: 4,
  },
  score: {
    width: 52,
    height: 20,
    borderRadius: 4,
  },
});

export default GradesLoading;
