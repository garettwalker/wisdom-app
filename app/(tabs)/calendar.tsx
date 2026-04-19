import { Link, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { program } from '../../data/program';

type ProgressEntry = {
  day_number: number;
  completed_at: string | null;
  journal_entry: string | null;
};

export default function CalendarScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ selectedDay?: string }>();
  const [progressMap, setProgressMap] = useState<Map<number, ProgressEntry>>(new Map());
  const [loading, setLoading] = useState(true);

  // Initialize selected day from params or default to program[0]
  const initialDayNumber = params.selectedDay ? Number(params.selectedDay) : 1;
  const initialDay = program.find((d) => d.day === initialDayNumber) || program[0];
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

  const goPrev = () => {
    if (selectedIndex > 0) {
      setSelectedDay(program[selectedIndex - 1]);
    }
  };

  const goNext = () => {
    if (selectedIndex < program.length - 1) {
      setSelectedDay(program[selectedIndex + 1]);
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

  if (!user) {
    // Should not happen due to auth check, but handle it
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
          <ActivityIndicator size="large" color="#6E5A3C" />
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <Text style={styles.title}>Progress</Text>

          <Link href="/onboarding" style={styles.instructionsLink}>
            <Text style={styles.instructionsText}>Instructions</Text>
          </Link>
        </View>

        <Text style={styles.subtitle}>30 Days Into the Desert</Text>

        <View style={styles.featureCard}>
          <Text style={styles.featureDay}>Day {selectedDay.day}</Text>
          <Text style={styles.featureTheme}>{selectedDay.theme}</Text>

          <Text style={styles.featureVerse}>{selectedDay.text}</Text>

          <Text style={styles.featureMeta}>
            Anchor: {selectedDay.anchor} • {Math.round(selectedDay.duration / 60)}
            min
          </Text>

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

        <ScrollView contentContainerStyle={styles.list}>
          {program.map((day) => {
            const entry = progressMap.get(day.day);
            const isDone = !!entry?.completed_at;
            const hasJournal = !!entry?.journal_entry;
            const isSelected = selectedDay.day === day.day;

            return (
              <Pressable
                key={day.day}
                onPress={() => setSelectedDay(day)}
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
                  <Text style={styles.verse}>{day.anchor}</Text>
                </View>

                <Text
                  style={[
                    styles.status,
                    isDone ? styles.done : styles.pending,
                  ]}
                >
                  {isDone ? '✓' : '○'}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e1d9c5',
  },
  container: {
    flex: 1,
    backgroundColor: '#e1d9c5',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  loadingText: {
    fontFamily: 'Lora_400Regular',
    color: '#9A8F7A',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  instructionsLink: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  instructionsText: {
    color: '#6E5A3C',
    fontSize: 14,
    fontWeight: '600',
  },
  backText: {
    color: '#9A8F7A',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: '#2F2A24',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9A8F7A',
    fontSize: 14,
    marginBottom: 16,
  },
  featureCard: {
    backgroundColor: '#E8E3D9',
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#D8D1C2',
  },
  featureDay: {
    color: '#9A8F7A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  featureTheme: {
    color: '#2F2A24',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  featureVerse: {
    color: '#6E5A3C',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  featureMeta: {
    color: '#9A8F7A',
    fontSize: 13,
    marginBottom: 8,
  },
  featureStatus: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 14,
  },
  journalPreview: {
    backgroundColor: '#F4F1EA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    cursor: 'pointer',
  },
  journalLabel: {
    fontFamily: 'Lora_700Bold',
    color: '#9A8F7A',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  journalText: {
    fontFamily: 'Lora_400Regular',
    color: '#6E5A3C',
    fontSize: 14,
    lineHeight: 22,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#F4F1EA',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8D1C2',
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    color: '#6E5A3C',
    fontSize: 14,
    fontWeight: '700',
  },
  startButton: {
    backgroundColor: '#3E3A34',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionLabel: {
    color: '#9A8F7A',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },
  list: {
    paddingBottom: 30,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8E3D9',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E3D9',
  },
  rowSelected: {
    borderColor: '#6E5A3C',
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6E5A3C',
    marginLeft: 8,
  },
  dayLabel: {
    color: '#2F2A24',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  verse: {
    color: '#6E5A3C',
    fontSize: 13,
  },
  status: {
    fontSize: 22,
    fontWeight: '700',
  },
  done: {
    color: '#6E5A3C',
  },
  pending: {
    color: '#9A8F7A',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
