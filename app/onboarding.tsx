import { Lora_400Regular, Lora_700Bold, useFonts } from '@expo-google-fonts/lora';
import { router, useFocusEffect } from 'expo-router';
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
import { useAuth } from '../contexts/AuthContext';

export default function OnboardingScreen() {
  const [fontsLoaded] = useFonts({
    Lora_400Regular,
    Lora_700Bold,
  });

  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      // If user is not logged in, redirect to login
      if (!loading && !user) {
        router.replace('/login');
      }
      setChecking(false);
    }, [loading, user])
  );

  if (!fontsLoaded || checking || loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6E5A3C" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>30 Days Into the Desert</Text>
        <Text style={styles.subtitle}>A journey of silence and return</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome</Text>
          <Text style={styles.cardText}>
            This is a 30-day guided journey into the desert of the heart. Each day offers:
          </Text>
          <Text style={styles.cardText}>
            • A theme and anchor verse for meditation{'\n'}
            • A timed session of silent prayer{'\n'}
            • A simple anchor word to return to
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>The Practice</Text>
          <Text style={styles.cardText}>
            1. Sit in silence for the appointed time{'\n'}
            2. When distracted, gently return to your anchor word{'\n'}
            3. When the chime sounds, reflect on what you heard{'\n'}
            4. Write your reflection to complete the day{'\n'}
            5. Return at your own pace through all 30 days
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>How to Use</Text>
          <Text style={styles.cardText}>
            • Select a day from the calendar to begin{'\n'}
            • Sessions range from 5-20 minutes{'\n'}
            • After the chime, write your reflection{'\n'}
            • Tap any completed day to revisit or edit your reflection{'\n'}
            • Your journal is saved and travels with you
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.replace('/calendar')}
        >
          <Text style={styles.buttonText}>Begin the Journey</Text>
        </Pressable>

        <Text style={styles.note}>
          You can return to these instructions anytime from the Calendar screen.
        </Text>
      </ScrollView>
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
    color: '#9A8F7A',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#E8E3D9',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D8D1C2',
  },
  cardTitle: {
    fontFamily: 'Lora_700Bold',
    color: '#2F2A24',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  cardText: {
    fontFamily: 'Lora_400Regular',
    color: '#6E5A3C',
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#3E3A34',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 34,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  buttonText: {
    fontFamily: 'Lora_700Bold',
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  note: {
    fontFamily: 'Lora_400Regular',
    color: '#9A8F7A',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});
