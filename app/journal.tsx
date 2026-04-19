import { Lora_400Regular, Lora_700Bold, useFonts } from '@expo-google-fonts/lora';
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
  const [fontsLoaded] = useFonts({
    Lora_400Regular,
    Lora_700Bold,
  });

  const { user } = useAuth();
  const { day, anchor, duration, isEditing } = useLocalSearchParams<{
    day?: string;
    anchor?: string;
    duration?: string;
    isEditing?: string;
  }>();

  const dayNumber = Number(day) || 1;
  const anchorWord = typeof anchor === 'string' ? anchor : 'Still';
  const [journal, setJournal] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditMode = isEditing === 'true';

  // Load existing journal entry if editing
  useFocusEffect(
    React.useCallback(() => {
      if (isEditMode && user) {
        setLoading(true);
        supabase
          .from('user_progress')
          .select('journal_entry')
          .eq('user_id', user.id)
          .eq('day_number', dayNumber)
          .single()
          .then(({ data, error }) => {
            if (!error && data?.journal_entry) {
              setJournal(data.journal_entry);
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
        // Update existing entry
        const { error } = await supabase.from('user_progress').update({
          journal_entry: journal.trim(),
          updated_at: new Date().toISOString(),
        }).eq('user_id', user.id).eq('day_number', dayNumber);

        if (error) throw error;
      } else {
        // Insert new entry (first-time completion)
        const { error } = await supabase.from('user_progress').upsert(
          {
            user_id: user.id,
            day_number: dayNumber,
            session_duration: Number(duration) || 300,
            journal_entry: journal.trim(),
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,day_number',
          }
        );

        if (error) throw error;
      }

      // Navigate back to calendar, preserving the selected day
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
          <ActivityIndicator size="large" color="#6E5A3C" />
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
            <Text style={styles.anchorLabel}>Anchor: {anchorWord}</Text>
          </View>

          <Text style={styles.title}>
            {isEditMode ? 'Edit Reflection' : 'Reflection'}
          </Text>
          <Text style={styles.subtitle}>
            {isEditMode
              ? 'Update your reflection from this session.'
              : 'What did you hear, feel, or sense while sitting in silence?'}
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
              placeholderTextColor="#9A8F7A"
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

          <Text style={styles.hint}>
            There&apos;s no wrong answer. This is between you and God.
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
    backgroundColor: '#F4F1EA',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: 'Lora_400Regular',
    color: '#9A8F7A',
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
    marginBottom: 24,
  },
  dayLabel: {
    fontFamily: 'Lora_700Bold',
    color: '#9A8F7A',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  anchorLabel: {
    fontFamily: 'Lora_400Regular',
    color: '#6E5A3C',
    fontSize: 16,
  },
  title: {
    fontFamily: 'Lora_700Bold',
    color: '#2F2A24',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Lora_400Regular',
    color: '#6E5A3C',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: '#FEE',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FAA',
  },
  errorText: {
    color: '#A33',
    fontSize: 14,
    textAlign: 'center',
  },
  journalContainer: {
    backgroundColor: '#E8E3D9',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#D8D1C2',
    marginBottom: 16,
    minHeight: 200,
  },
  journalInput: {
    fontFamily: 'Lora_400Regular',
    color: '#2F2A24',
    fontSize: 16,
    lineHeight: 26,
    minHeight: 180,
    padding: 0,
  },
  hint: {
    fontFamily: 'Lora_400Regular',
    color: '#9A8F7A',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#3E3A34',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 34,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonPressed: {
    transform: [{ scale: 0.99 }],
  },
  saveButtonText: {
    fontFamily: 'Lora_700Bold',
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  skipContainer: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipPressed: {
    opacity: 0.7,
  },
  skipText: {
    fontFamily: 'Lora_700Bold',
    color: '#9A8F7A',
    fontSize: 14,
    fontWeight: '600',
  },
});
