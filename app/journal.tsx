import { PlayfairDisplay_400Regular, PlayfairDisplay_700Bold, useFonts as usePlayfairFonts } from '@expo-google-fonts/playfair-display';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, useFonts as useInterFonts } from '@expo-google-fonts/inter';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function JournalScreen() {
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
  const { day, duration, isEditing } = useLocalSearchParams<{
    day?: string;
    duration?: string;
    isEditing?: string;
  }>();

  const dayNumber = Number(day) || 1;
  const [journal, setJournal] = useState('');
  const [prayer, setPrayer] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const isEditMode = isEditing === 'true';

  useFocusEffect(
    React.useCallback(() => {
      if (isEditMode && user) {
        setLoading(true);
        supabase
          .from('user_progress')
          .select('journal_entry, prayer_entry, feeling')
          .eq('user_id', user.id)
          .eq('day_number', dayNumber)
          .single()
          .then(({ data, error }) => {
            if (!error && data) {
              if (data.journal_entry) setJournal(data.journal_entry);
              if (data.prayer_entry) setPrayer(data.prayer_entry);
              if (data.feeling) setSelectedFeeling(data.feeling);
            }
            setLoading(false);
          });
      }
    }, [isEditMode, user, dayNumber])
  );

  const handleSave = async () => {
    if (!user || !journal.trim()) return;

    setSaving(true);
    setError(null);

    try {
      if (isEditMode) {
        const { error } = await supabase.from('user_progress').update({
          journal_entry: journal.trim(),
          prayer_entry: prayer.trim(),
          feeling: selectedFeeling,
          updated_at: new Date().toISOString(),
        }).eq('user_id', user.id).eq('day_number', dayNumber);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('user_progress').upsert(
          {
            user_id: user.id,
            day_number: dayNumber,
            session_duration: Number(duration) || 300,
            journal_entry: journal.trim(),
            prayer_entry: prayer.trim(),
            feeling: selectedFeeling,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,day_number',
          }
        );

        if (error) throw error;
      }

      router.push({
        pathname: '/calendar',
        params: { selectedDay: String(dayNumber) },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save journal');
    } finally {
      setSaving(false);
    }
  };

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  if (!user) {
    router.replace('/login');
    return null;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8A7A67" />
          <Text style={styles.loadingText}>Loading your reflection...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <Text style={styles.dayLabel}>Day {dayNumber}</Text>
          </View>

          <Text style={styles.title}>
            {isEditMode ? 'Edit Reflection' : 'Reflection'}
          </Text>
          <Text style={styles.subtitle}>
            {isEditMode
              ? 'Update your reflection from this session.'
              : 'What is one word or phrase that stood out to you today?'}
          </Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.journalContainer}>
            <TextInput
              style={styles.journalInput}
              placeholder="Write your reflection here..."
              placeholderTextColor="#8A7A67"
              value={journal}
              onChangeText={(text) => {
                setJournal(text);
                setError(null);
              }}
              multiline
              textAlignVertical="top"
              editable={!saving}
            />
          </View>

          <View style={styles.feelingsContainer}>
            <Text style={styles.feelingsLabel}>Today I feel</Text>
            <View style={styles.feelingsRow}>
              {['Grateful', 'Peaceful', 'Tired', 'Hopeful', 'Other'].map((feeling) => (
                <Pressable
                  key={feeling}
                  onPress={() => setSelectedFeeling(feeling)}
                  style={({ pressed }) => [
                    styles.feelingChip,
                    selectedFeeling === feeling && styles.feelingChipSelected,
                    pressed && !selectedFeeling && styles.feelingChipPressed,
                  ]}
                >
                  <Text style={[
                    styles.feelingChipText,
                    selectedFeeling === feeling && styles.feelingChipTextSelected,
                  ]}>{feeling}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.prayerContainer}>
            <Text style={styles.prayerLabel}>Prayer</Text>
            <TextInput
              style={styles.prayerInput}
              placeholder="Lord..."
              placeholderTextColor="#8A7A67"
              value={prayer}
              onChangeText={setPrayer}
              multiline
              textAlignVertical="top"
              editable={!saving}
            />
          </View>

          <Text style={styles.hint}>
            You do not have to perform. You only need to return honestly.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              (!journal.trim() || saving) && styles.saveButtonDisabled,
              pressed && !saving && journal.trim() && styles.saveButtonPressed,
            ]}
            onPress={handleSave}
            disabled={!journal.trim() || saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : (isEditMode ? 'Update Reflection' : 'Complete Day')}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.skipContainer,
              pressed && styles.skipPressed,
            ]}
            onPress={() => router.back()}
          >
            <Text style={styles.skipText}>Go Back</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F3EC',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: 'Inter_400Regular',
    color: '#8A7A67',
    fontSize: 16,
    marginTop: 16,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  dayLabel: {
    fontFamily: 'Inter_600SemiBold',
    color: '#8A7A67',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#2B2A28',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'PlayfairDisplay_400Regular',
    color: '#8A7A67',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  errorContainer: {
    backgroundColor: '#FEE',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FAA',
  },
  errorText: {
    fontFamily: 'Inter_400Regular',
    color: '#A33',
    fontSize: 14,
    textAlign: 'center',
  },
  journalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E9E1D2',
    marginBottom: 20,
    minHeight: 180,
  },
  journalInput: {
    fontFamily: 'PlayfairDisplay_400Regular',
    color: '#2B2A28',
    fontSize: 16,
    lineHeight: 28,
    minHeight: 160,
    padding: 0,
  },
  feelingsContainer: {
    marginBottom: 20,
  },
  feelingsLabel: {
    fontFamily: 'Inter_600SemiBold',
    color: '#8A7A67',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  feelingsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  feelingChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E9E1D2',
  },
  feelingChipPressed: {
    backgroundColor: '#E9E1D2',
  },
  feelingChipSelected: {
    backgroundColor: '#E9E1D2',
    borderColor: '#8A7A67',
  },
  feelingChipText: {
    fontFamily: 'Inter_500Medium',
    color: '#8A7A67',
    fontSize: 13,
    fontWeight: '500',
  },
  feelingChipTextSelected: {
    color: '#2B2A28',
  },
  prayerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E9E1D2',
    marginBottom: 20,
    minHeight: 140,
  },
  prayerLabel: {
    fontFamily: 'Inter_600SemiBold',
    color: '#8A7A67',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  prayerInput: {
    fontFamily: 'PlayfairDisplay_400Regular',
    color: '#2B2A28',
    fontSize: 16,
    lineHeight: 26,
    minHeight: 100,
    padding: 0,
  },
  hint: {
    fontFamily: 'PlayfairDisplay_400Regular',
    color: '#8A7A67',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 28,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  saveButton: {
    backgroundColor: '#2B2A28',
    borderRadius: 26,
    paddingVertical: 18,
    paddingHorizontal: 34,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  saveButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  skipContainer: {
    marginTop: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipPressed: {
    opacity: 0.7,
  },
  skipText: {
    fontFamily: 'Inter_500Medium',
    color: '#8A7A67',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
