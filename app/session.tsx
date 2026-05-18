import { PlayfairDisplay_400Regular, PlayfairDisplay_700Bold, useFonts as usePlayfairFonts } from '@expo-google-fonts/playfair-display';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, useFonts as useInterFonts } from '@expo-google-fonts/inter';
import { Link, router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ImageBackground,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { Audio } from 'expo-audio';

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export default function SessionScreen() {
  const [playfairLoaded] = usePlayfairFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
  });

  const [interLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const fontsLoaded = playfairLoaded && interLoaded;

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
  const [currentDuration, setCurrentDuration] = useState(startSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);
  const [countdownNum, setCountdownNum] = useState(3);

  const playChime = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound: firstSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/chime.wav'),
        { volume: 0.7 }
      );

      soundRef.current = firstSound;
      await firstSound.playAsync();

      const status = await firstSound.getStatusAsync();
      const soundDuration = status.durationMillis || 2000;

      setTimeout(async () => {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
        }

        const { sound: secondSound } = await Audio.Sound.createAsync(
          require('../assets/sounds/chime.wav'),
          { volume: 0.7 }
        );

        soundRef.current = secondSound;
        await secondSound.playAsync();
      }, soundDuration - 200);
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
          playChime();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  }, [stopTimer, playChime]);

  // Countdown effect on mount and duration change
  useEffect(() => {
    setShowCountdown(true);
    setCountdownNum(3);
    setIsTimerRunning(false);

    const countdownInterval = setInterval(() => {
      setCountdownNum((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setShowCountdown(false);
          startTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [currentDuration]);

  const resetSession = useCallback(() => {
    setSecondsLeft(currentDuration);
    startTimer();
  }, [currentDuration, startTimer]);

  const changeDuration = useCallback((newDuration: number) => {
    setCurrentDuration(newDuration);
    setSecondsLeft(newDuration);
    setShowDurationModal(false);
    // Restart timer with new duration
    setTimeout(() => {
      stopTimer();
      setIsTimerRunning(true);
      setSessionComplete(false);
      intervalRef.current = setInterval(() => {
        setSecondsLeft((current) => {
          if (current <= 1) {
            stopTimer();
            setIsTimerRunning(false);
            setSessionComplete(true);
            playChime();
            return 0;
          }
          return current - 1;
        });
      }, 1000);
    }, 100);
  }, [stopTimer, playChime]);

  const openDurationModal = useCallback(() => {
    setShowDurationModal(true);
  }, []);

  useEffect(() => {
    setSecondsLeft(startSeconds);
    startTimer();

    return () => {
      stopTimer();
    };
  }, [dayNumber, startSeconds, startTimer, stopTimer]);

  useEffect(() => {
    if (!isTimerRunning) return;

    activateKeepAwakeAsync();

    return () => {
      deactivateKeepAwake();
    };
  }, [isTimerRunning]);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

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

  if (!user) {
    router.replace('/login');
    return null;
  }

  if (!fontsLoaded) {
    return <Text style={styles.loading}>Loading...</Text>;
  }

  return (
    <ImageBackground
      source={require('../assets/wilderness_assets_refined/backgrounds/session.background.png')}
      style={styles.backgroundImage}
      imageStyle={styles.backgroundImageStyle}
    >
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
            <Ionicons name="arrow-back" size={20} color="#8A7A67" />
          </Pressable>

          <View style={styles.contentWrapper}>
            <Text style={styles.dayLabel}>Day {dayNumber}</Text>

            <View style={styles.timerWrapper}>
              {showCountdown ? (
                <View style={styles.countdownRing}>
                  <Text style={styles.countdownNumber}>{countdownNum}</Text>
                  <Text style={styles.countdownLabel}>Silence begins in...</Text>
                </View>
              ) : (
                <View style={styles.timerRing}>
                  <Text style={styles.timer}>{formatTime(secondsLeft)}</Text>
                </View>
              )}
              <Pressable
                onPress={openDurationModal}
                style={({ pressed }) => [
                  styles.editTimerButton,
                  pressed && styles.buttonPressed,
                ]}
                hitSlop={10}
              >
                <Ionicons name="time-outline" size={18} color="#8A7A67" />
              </Pressable>
            </View>

            <View style={styles.durationPresets}>
              {[300, 600, 900, 1200].map((secs) => (
                <Pressable
                  key={secs}
                  onPress={() => changeDuration(secs)}
                  style={({ pressed }) => [
                    styles.durationChip,
                    currentDuration === secs && styles.durationChipActive,
                    pressed && styles.durationChipPressed,
                  ]}
                >
                  <Text style={[
                    styles.durationChipText,
                    currentDuration === secs && styles.durationChipTextActive,
                  ]}>
                    {secs / 60} min
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.anchorChip}>
              <Text style={styles.anchorChipText}>{anchorWord}</Text>
            </View>

            <Text style={styles.helper}>When distracted, gently return.</Text>

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

          <Modal
            visible={showDurationModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowDurationModal(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setShowDurationModal(false)}
            >
              <Pressable
                style={styles.modalContent}
                onPress={(e) => e.stopPropagation()}
              >
                <Text style={styles.modalTitle}>Select Duration</Text>
                <ScrollView style={styles.modalOptions}>
                  {[180, 240, 300, 420, 600, 900, 1200, 1500, 1800].map((secs) => (
                    <Pressable
                      key={secs}
                      onPress={() => changeDuration(secs)}
                      style={({ pressed }) => [
                        styles.modalOption,
                        currentDuration === secs && styles.modalOptionActive,
                        pressed && styles.modalOptionPressed,
                      ]}
                    >
                      <Text style={[
                        styles.modalOptionText,
                        currentDuration === secs && styles.modalOptionTextActive,
                      ]}>
                        {secs < 600 ? `${Math.floor(secs / 60)} min` : `${secs / 60} min`}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <Pressable
                  style={styles.modalClose}
                  onPress={() => setShowDurationModal(false)}
                >
                  <Text style={styles.modalCloseText}>Cancel</Text>
                </Pressable>
              </Pressable>
            </Pressable>
          </Modal>

          {!isTimerRunning && (
            <View style={styles.tabBar}>
              <Link href="/(tabs)/home" style={styles.tabItem}>
                <Ionicons name="home-outline" size={24} color="#8A7A67" />
              </Link>
              <Link href="/(tabs)/calendar" style={styles.tabItem}>
                <Ionicons name="calendar-outline" size={24} color="#8A7A67" />
              </Link>
              <Link href="/(tabs)/settings" style={styles.tabItem}>
                <Ionicons name="person-outline" size={24} color="#8A7A67" />
              </Link>
            </View>
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  backgroundImageStyle: {
    resizeMode: 'cover',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 0,
  },
  loading: {
    fontFamily: 'Inter_400Regular',
    color: '#8A7A67',
    fontSize: 16,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9E1D2',
    marginBottom: 40,
  },
  contentWrapper: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  dayLabel: {
    fontFamily: 'Inter_600SemiBold',
    color: '#8A7A67',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 24,
    textTransform: 'uppercase',
  },
  timerWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  countdownRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.5,
    borderColor: '#E9E1D2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 6 },
    marginBottom: 28,
    elevation: 4,
  },
  countdownNumber: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#2B2A28',
    fontSize: 96,
    fontWeight: '700',
  },
  countdownLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    color: '#8A7A67',
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 8,
  },
  timerRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.5,
    borderColor: '#E9E1D2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  editTimerButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9E1D2',
  },
  durationPresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  durationChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E9E1D2',
  },
  durationChipActive: {
    backgroundColor: '#E9E1D2',
    borderColor: '#8A7A67',
  },
  durationChipPressed: {
    opacity: 0.7,
  },
  durationChipText: {
    fontFamily: 'Inter_500Medium',
    color: '#8A7A67',
    fontSize: 13,
    fontWeight: '500',
  },
  durationChipTextActive: {
    color: '#2B2A28',
  },
  timer: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#2B2A28',
    fontSize: 56,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  anchorChip: {
    backgroundColor: '#E9E1D2',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  anchorChipText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#2B2A28',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  helper: {
    fontFamily: 'PlayfairDisplay_400Regular',
    color: '#F0EDE6',
    fontSize: 15,
    fontStyle: 'italic',
    marginBottom: 40,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: '#E9E1D2',
  },
  resetButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#8A7A67',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F3EC',
    borderTopColor: '#E9E1D2',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
    height: 80,
    gap: 60,
  },
  tabItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#F6F3EC',
    borderRadius: 24,
    padding: 24,
    width: '85%',
    maxWidth: 320,
  },
  modalTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#2B2A28',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOptions: {
    maxHeight: 280,
  },
  modalOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E9E1D2',
  },
  modalOptionActive: {
    backgroundColor: '#E9E1D2',
    borderColor: '#8A7A67',
  },
  modalOptionPressed: {
    opacity: 0.7,
  },
  modalOptionText: {
    fontFamily: 'Inter_500Medium',
    color: '#8A7A67',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalOptionTextActive: {
    color: '#2B2A28',
    fontWeight: '600',
  },
  modalClose: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E9E1D2',
    alignItems: 'center',
  },
  modalCloseText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#8A7A67',
    fontSize: 15,
    fontWeight: '600',
  },
});