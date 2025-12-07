import { SkeletonAvatar } from '@/shared/ui/Skeleton/SkeletonAvatar';
import { SkeletonCard } from '@/shared/ui/Skeleton/SkeletonCard';
import { SkeletonText } from '@/shared/ui/Skeleton/SkeletonText';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface CardSkeletonProps {
  numberOfItems?: number;
}

export const CardSkeleton = ({ numberOfItems = 1 }: CardSkeletonProps) => {
  return (
    <>
      {Array.from({ length: numberOfItems }).map((_, index) => (
        <SkeletonCard key={index} style={styles.card}>
          <View style={styles.content}>
            <View style={styles.textContainer}>
              <SkeletonText style={{ width: '80%' }} />
              <SkeletonText style={{ width: '60%' }} />
              <SkeletonText style={{ width: '60%' }} />
              <SkeletonText style={{ width: '60%' }} />
            </View>
            <View style={styles.avatar}>
              <SkeletonAvatar />
              <SkeletonAvatar />
              <SkeletonAvatar />
            </View>
          </View>
        </SkeletonCard>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
    backgroundColor: '#FFF',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20
  },
  avatar: {
    width: '100%',
    gap: 20,
    flexDirection: 'row',
  },
  textContainer: {
    width: '100%',
  },
});