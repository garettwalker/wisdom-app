import { PlayfairDisplay_400Regular, PlayfairDisplay_700Bold, useFonts as usePlayfairFonts } from '@expo-google-fonts/playfair-display';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, useFonts as useInterFonts } from '@expo-google-fonts/inter';
import { Link, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { program } from '../../data/program';

type ProgressEntry = {
  day_number: number;
  completed_at: string | null;
  journal_entry: string | null;
};

export default function CalendarScreen() {
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
  const params = useLocalSearchParams<{ selectedDay?: string }>();
  const [progressMap, setProgressMap] = useState<Map<number, ProgressEntry>>(new Map());
  const [loading, setLoading] = useState(true);
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Initialize selected day from params, or will be set to next incomplete after loading
  const initialDayNumber = params.selectedDay ? Number(params.selectedDay) : null;
  const initialDay = initialDayNumber ? program.find((d) => d.day === initialDayNumber) || program[0] : program[0];
  const [selectedDay, setSelectedDay] = useState(initialDay);

  const loadProgress = React.useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('day_number, completed_at, journal_entry')
        .eq('user_id', user.id);

      if (error) throw error;

      const map = new Map<number, ProgressEntry>();
      data?.forEach((entry) => {
        map.set(entry.day_number, {
          day_number: entry.day_number,
          completed_at: entry.completed_at,
          journal_entry: entry.journal_entry,
        });
      });
      setProgressMap(map);
    } catch (e) {
      console.log('Error loading progress:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // After progress loads, select the next incomplete day (if no specific day in params)
  React.useEffect(() => {
    if (!loading && !initialDayNumber) {
      // Find the first incomplete day
      const nextDay = program.find((day) => {
        const entry = progressMap.get(day.day);
        return !entry?.completed_at;
      });
      if (nextDay) {
        setSelectedDay(nextDay);
      }
    }
  }, [loading, progressMap, initialDayNumber]);

  // Reload progress when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadProgress();
    }, [loadProgress])
  );

  const selectedIndex = program.findIndex(
    (item) => item.day === selectedDay.day
  );

  const selectedEntry = progressMap.get(selectedDay.day);
  const selectedIsComplete = !!selectedEntry?.completed_at;
  const selectedJournal = selectedEntry?.journal_entry;

  const selectDay = (day: typeof program[0]) => {
    setSelectedDay(day);
    scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
  };

  const goPrev = () => {
    if (selectedIndex > 0) {
      setSelectedDay(program[selectedIndex - 1]);
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    }
  };

  const goNext = () => {
    if (selectedIndex < program.length - 1) {
      setSelectedDay(program[selectedIndex + 1]);
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    }
  };

  const startSelectedDay = () => {
    router.push({
      pathname: '/session',
      params: {
        day: String(selectedDay.day),
        anchor: selectedDay.anchor,
        duration: String(selectedDay.duration),
      },
    });
  };

  const editJournal = () => {
    router.push({
      pathname: '/journal',
      params: {
        day: String(selectedDay.day),
        anchor: selectedDay.anchor,
        duration: String(selectedDay.duration),
        isEditing: 'true',
      },
    });
  };

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.loadingText}>Please sign in to view progress</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#8A7A67" />
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/wilderness_assets_refined/backgrounds/login.background1.png')}
      style={styles.backgroundImage}
      imageStyle={styles.backgroundImageStyle}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={20} color="#8A7A67" />
          </Pressable>

          <Text style={styles.title}>Calendar</Text>

          <Link href="/onboarding" style={styles.instructionsLink}>
            <Text style={styles.instructionsText}>Help</Text>
          </Link>
        </View>

        <Text style={styles.subtitle}>Desert: 30 Days of Silence and Return</Text>

        <View style={styles.featureCard}>
          <Text style={styles.featureDay}>DAY {selectedDay.day}</Text>
          <Text style={styles.featureTheme}>{selectedDay.theme}</Text>

          <Text style={styles.featureVerse}>&quot;{selectedDay.text}&quot;</Text>

          <View style={styles.featureMeta}>
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>{selectedDay.anchor}</Text>
            </View>
            <Text style={styles.metaText}>{Math.round(selectedDay.duration / 60)} min</Text>
          </View>

          <Text
            style={[
              styles.featureStatus,
              selectedIsComplete ? styles.done : styles.pending,
            ]}
          >
            {selectedIsComplete ? 'Completed' : 'Not completed'}
          </Text>

          {selectedIsComplete && selectedJournal && (
            <Pressable onPress={editJournal} style={styles.journalPreview}>
              <Text style={styles.journalLabel}>Your Reflection (tap to edit):</Text>
              <Text style={styles.journalText} numberOfLines={4}>
                {selectedJournal}
              </Text>
            </Pressable>
          )}

          <View style={styles.navRow}>
            <Pressable
              onPress={goPrev}
              style={({ pressed }) => [
                styles.navButton,
                pressed && styles.buttonPressed,
                selectedIndex === 0 && styles.navButtonDisabled,
              ]}
              disabled={selectedIndex === 0}
            >
              <Text style={styles.navButtonText}>Prev</Text>
            </Pressable>

            <Pressable
              onPress={goNext}
              style={({ pressed }) => [
                styles.navButton,
                pressed && styles.buttonPressed,
                selectedIndex === program.length - 1 && styles.navButtonDisabled,
              ]}
              disabled={selectedIndex === program.length - 1}
            >
              <Text style={styles.navButtonText}>Next</Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.startButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={startSelectedDay}
          >
            <Text style={styles.startButtonText}>Start Session</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>All Days</Text>

        <View style={styles.list}>
          {program.map((day) => {
            const entry = progressMap.get(day.day);
            const isDone = !!entry?.completed_at;
            const hasJournal = !!entry?.journal_entry;
            const isSelected = selectedDay.day === day.day;

            return (
              <Pressable
                key={day.day}
                onPress={() => selectDay(day)}
                style={[
                  styles.row,
                  isSelected && styles.rowSelected,
                ]}
              >
                <View style={styles.left}>
                  <View style={styles.dayRow}>
                    <Text style={styles.dayLabel}>Day {day.day}</Text>
                    {hasJournal && <View style={styles.journalDot} />}
                  </View>
                  <Text style={styles.verse}>{day.theme}</Text>
                </View>

                <View
                  style={[
                    styles.statusCircle,
                    isDone ? styles.doneCircle : styles.pendingCircle,
                  ]}
                >
                  {isDone && <Ionicons name="checkmark" size={14} color="#2B2A28" />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
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
  },
  container: {
    flex: 1,
    backgroundColor: '#F6F3EC',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 30,
  },
  loadingText: {
    fontFamily: 'Inter_400Regular',
    color: '#8A7A67',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  instructionsLink: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  instructionsText: {
    fontFamily: 'Inter_500Medium',
    color: '#8A7A67',
    fontSize: 14,
    fontWeight: '500',
  },
  backText: {
    color: '#8A7A67',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#2B2A28',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontFamily: 'PlayfairDisplay_400Regular',
    color: '#8A7A67',
    fontSize: 15,
    marginBottom: 20,
  },
  featureCard: {
    backgroundColor: 'rgba(246, 243, 236, 0.75)',
    borderRadius: 24,
    padding: 22,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  featureDay: {
    fontFamily: 'Inter_600SemiBold',
    color: '#8A7A67',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  featureTheme: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#2B2A28',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 14,
    lineHeight: 30,
  },
  featureVerse: {
    fontFamily: 'PlayfairDisplay_400Regular',
    color: '#8A7A67',
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  featureMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  metaChip: {
    backgroundColor: '#D6C8B3',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  metaChipText: {
    fontFamily: 'Inter_500Medium',
    color: '#2B2A28',
    fontSize: 12,
    fontWeight: '500',
  },
  metaText: {
    fontFamily: 'Inter_400Regular',
    color: '#8A7A67',
    fontSize: 13,
  },
  featureStatus: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 16,
  },
  journalPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  journalLabel: {
    fontFamily: 'Inter_600SemiBold',
    color: '#8A7A67',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  journalText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    color: '#2B2A28',
    fontSize: 14,
    lineHeight: 22,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  navButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#8A7A67',
    fontSize: 14,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#2B2A28',
    borderRadius: 26,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  startButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    color: '#8A7A67',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  list: {
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  rowSelected: {
    borderColor: '#8A7A67',
  },
  left: {
    flex: 1,
    paddingRight: 12,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  journalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8A7A67',
    marginLeft: 8,
  },
  dayLabel: {
    fontFamily: 'Inter_600SemiBold',
    color: '#2B2A28',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  verse: {
    fontFamily: 'PlayfairDisplay_400Regular',
    color: '#8A7A67',
    fontSize: 14,
  },
  statusCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  doneCircle: {
    backgroundColor: '#D6C8B3',
    borderColor: '#D6C8B3',
  },
  pendingCircle: {
    backgroundColor: 'transparent',
    borderColor: '#D6C8B3',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
