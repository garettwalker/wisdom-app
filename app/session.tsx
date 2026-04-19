import { Lora_400Regular, Lora_700Bold, useFonts } from '@expo-google-fonts/lora';
import { Link, router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { Audio } from 'expo-av';

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export default function SessionScreen() {
  const [fontsLoaded] = useFonts({
    Lora_400Regular,
    Lora_700Bold,
  });

  const { user } = useAuth();

  const { day, anchor, duration } = useLocalSearchParams<{
    day?: string;
    anchor?: string;
    duration?: string;
  }>();

  const dayNumber = Number(day) || 1;
  const startSeconds = Number(duration) || 300;
  const anchorWord = typeof anchor === 'string' ? anchor : 'Still';

  const [secondsLeft, setSecondsLeft] = useState(startSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);

  const saveCompletedDay = useCallback(async (dayToSave: number) => {
    if (!user) {
      console.log('No user logged in, cannot save progress');
      return;
    }

    try {
      // Upsert: insert or update if day already completed
      const { error } = await supabase.from('user_progress').upsert(
        {
          user_id: user.id,
          day_number: dayToSave,
          session_duration: startSeconds,
          completed_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,day_number',
        }
      );

      if (error) throw error;
    } catch (e) {
      console.log('Error saving completed day:', e);
    }
  }, [user, startSeconds]);

  const playChime = useCallback(async () => {
    try {
      // Unload any existing sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Load and play the chime
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/chime.wav'),
        { volume: 1.0 }
      );

      soundRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      console.log('Error playing chime:', e);
    }
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setIsTimerRunning(true);
    setSessionComplete(false);

    intervalRef.current = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          stopTimer();
          setIsTimerRunning(false);
          setSessionComplete(true);
          // Play chime when timer completes
          playChime();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  // anchorWord, dayNumber, startSeconds are stable (derived from params)
  }, [stopTimer, playChime]);

  const resetSession = useCallback(() => {
    setSecondsLeft(startSeconds);
    startTimer();
  }, [startSeconds, startTimer]);

  useEffect(() => {
    setSecondsLeft(startSeconds);
    startTimer();

    return () => {
      stopTimer();
    };
  }, [dayNumber, startSeconds, startTimer, stopTimer, saveCompletedDay]);

  // Keep screen awake while timer is running
  useEffect(() => {
    if (!isTimerRunning) return;

    activateKeepAwakeAsync();

    return () => {
      deactivateKeepAwake();
    };
  }, [isTimerRunning]);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Navigate to journal when session completes
  useEffect(() => {
    if (sessionComplete) {
      router.push({
        pathname: '/journal',
        params: {
          day: String(dayNumber),
          anchor: anchorWord,
          duration: String(startSeconds),
        },
      });
    }
  }, [sessionComplete, dayNumber, anchorWord, startSeconds]);

  // Redirect to login if not authenticated (after hooks)
  if (!user) {
    router.replace('/login');
    return null;
  }

  if (!fontsLoaded) {
    return <Text style={styles.loading}>Loading...</Text>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.buttonPressed,
          ]}
          hitSlop={20}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>

        <View style={styles.contentWrapper}>
          <Text style={styles.timer}>{formatTime(secondsLeft)}</Text>

          <Text style={styles.anchor}>{anchorWord}</Text>

          <Text style={styles.helper}>When distracted, return.</Text>

          <Pressable
            style={({ pressed }) => [
              styles.resetButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={resetSession}
          >
            <Text style={styles.resetButtonText}>Reset Focus</Text>
          </Pressable>
        </View>

        <View style={styles.tabBar}>
          <Link href="/(tabs)/home" style={styles.tabItem}>
            <Ionicons name="home-outline" size={24} color="#9A8F7A" />
          </Link>
          <Link href="/(tabs)/calendar" style={styles.tabItem}>
            <Ionicons name="calendar-outline" size={24} color="#9A8F7A" />
          </Link>
          <Link href="/(tabs)/settings" style={styles.tabItem}>
            <Ionicons name="settings-outline" size={24} color="#9A8F7A" />
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e1d9c5',
  },
  loading: {
    fontFamily: 'Lora_400Regular',
    color: '#2F2A24',
    fontSize: 16,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#e1d9c5',
    paddingHorizontal: 28,
    paddingTop: 60,
  },
  backButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F4F1EA',
    borderWidth: 1,
    borderColor: '#D8D1C2',
    marginBottom: 30,
  },
  backButtonText: {
    fontFamily: 'Lora_700Bold',
    color: '#6E5A3C',
    fontSize: 15,
  },
  contentWrapper: {
    alignItems: 'center',
  },
  timer: {
    fontFamily: 'Lora_700Bold',
    color: '#6E5A3C',
    fontSize: 68,
    fontWeight: '700',
    marginBottom: 42,
  },
  anchor: {
    fontFamily: 'Lora_700Bold',
    color: '#6E5A3C',
    fontSize: 42,
    fontWeight: '700',
    marginBottom: 20,
  },
  helper: {
    fontFamily: 'Lora_400Regular',
    color: '#9A8F7A',
    fontSize: 14,
    marginBottom: 48,
  },
  resetButton: {
    backgroundColor: '#E8E3D9',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: '#D8D1C2',
  },
  resetButtonText: {
    color: '#6E5A3C',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F1EA',
    borderTopColor: '#D8D1C2',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
    height: 88,
    marginTop: 'auto',
    gap: 60,
  },
  tabItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});