import { router, useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { program } from '../../data/program';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function HomeScreen() {
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [completedDays, setCompletedDays] = useState<number[]>([]);

  // Find the next incomplete day based on user progress
  const nextDay = program.find((day) => !completedDays.includes(day.day)) || program[program.length - 1];
  const progressPercent = completedDays.length > 0 ? (completedDays.length / 30) * 100 : 0;

  useFocusEffect(
    React.useCallback(() => {
      if (!loading && !user) {
        router.replace('/login');
        return;
      }

      // Load user's completed days
      if (user) {
        supabase
          .from('user_progress')
          .select('day_number')
          .eq('user_id', user.id)
          .not('completed_at', 'is', null)
          .then(({ data }) => {
            if (data) {
              setCompletedDays(data.map((d) => d.day_number));
            }
            setChecking(false);
          });
      } else {
        setChecking(false);
      }
    }, [loading, user])
  );

  if (checking || loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8A7A67" />
        </View>
      </SafeAreaView>
    );
  }

  if (!nextDay) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.verse}>No program found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/wilderness_assets_refined/backgrounds/login.background.new.png')}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Image
            source={require('../../assets/wilderness_assets_refined/brand/logo-mark-artistic-flare-1.png')}
            style={styles.brandImage}
            resizeMode="contain"
          />

          <Text style={styles.brandLabel}>WILDERNESS</Text>

          <Text style={styles.programLabel}>CURRENT PROGRAM</Text>

          <View style={styles.programCard}>
            <Text style={styles.programTitle}>Desert</Text>
            <Text style={styles.programDescription}>
              A free 30-day journey through Scripture, silence, and prayer.
            </Text>

            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {completedDays.length > 0
                  ? `${completedDays.length} of 30 days completed`
                  : 'Day 1 of 30'}
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={() =>
                router.push({
                  pathname: '/session',
                  params: {
                    day: String(nextDay.day),
                    anchor: nextDay.anchor,
                    duration: String(nextDay.duration),
                  },
                })
              }
            >
              <Text style={styles.buttonText}>
                {completedDays.includes(nextDay.day) ? 'Review Day' : 'Continue'} Day {nextDay.day}
              </Text>
            </Pressable>

            <Pressable onPress={() => router.push('/calendar')}>
              <Text style={styles.calendarLink}>View Calendar</Text>
            </Pressable>
          </View>

          <View style={styles.upcomingContainer}>
            <Text style={styles.upcomingTitle}>Upcoming</Text>

            {program
              .filter((day) => !completedDays.includes(day.day))
              .slice(0, 4)
              .map((day) => (
                <Pressable
                  key={day.day}
                  style={styles.upcomingCard}
                  onPress={() =>
                    router.push({
                      pathname: '/calendar',
                      params: { selectedDay: String(day.day) },
                    })
                  }
                >
                  <View>
                    <Text style={styles.upcomingDay}>Day {day.day}</Text>
                    <Text style={styles.upcomingTheme}>{day.theme}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#8A7A67" />
                </Pressable>
              ))}
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  brandImage: {
    width: 48,
    height: 48,
    marginBottom: 8,
    alignSelf: 'center',
    opacity: 0.9,
  },
  brandLabel: {
    fontFamily: 'Inter_600SemiBold',
    color: '#8A7A67',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 20,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  programLabel: {
    fontFamily: 'Inter_600SemiBold',
    color: '#8A7A67',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  programCard: {
    backgroundColor: 'rgba(233, 225, 210, 0.85)',
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(214, 200, 179, 0.6)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  programTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#2B2A28',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  programDescription: {
    fontFamily: 'Inter_400Regular',
    color: '#8A7A67',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontFamily: 'Inter_500Medium',
    color: '#8A7A67',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#D6C8B3',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8A7A67',
    borderRadius: 2,
  },
  button: {
    backgroundColor: '#2B2A28',
    borderRadius: 26,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  calendarLink: {
    fontFamily: 'Inter_500Medium',
    color: '#8A7A67',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  upcomingContainer: {
    flex: 1,
  },
  upcomingTitle: {
    fontFamily: 'Inter_600SemiBold',
    color: '#8A7A67',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(233, 225, 210, 0.6)',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  upcomingDay: {
    fontFamily: 'Inter_600SemiBold',
    color: '#2B2A28',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  upcomingTheme: {
    fontFamily: 'Inter_400Regular',
    color: '#8A7A67',
    fontSize: 14,
  },
});
