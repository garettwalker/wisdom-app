import { PlayfairDisplay_400Regular, PlayfairDisplay_700Bold, useFonts as usePlayfairFonts } from '@expo-google-fonts/playfair-display';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, useFonts as useInterFonts } from '@expo-google-fonts/inter';
import { router, useFocusEffect } from 'expo-router';
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
import { useAuth } from '../contexts/AuthContext';

export default function OnboardingScreen() {
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

  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
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
          <ActivityIndicator size="large" color="#8A7A67" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/wilderness_assets_refined/backgrounds/login.background.new.png')}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Image
            source={require('../assets/wilderness_assets_refined/brand/logo-mark-artistic-flare-1.png')}
            style={styles.brandImage}
            resizeMode="contain"
          />

          <Text style={styles.brandLabel}>WILDERNESS</Text>

          <Text style={styles.title}>30 Days Into the Desert</Text>
          <Text style={styles.subtitle}>A journey of silence and return</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome</Text>
            <Text style={styles.cardText}>
              Desert is a 30-day guided practice of Scripture, silence, and prayer for ordinary life. Each day offers:
            </Text>
            <Text style={styles.cardText}>
              • A theme and anchor verse for meditation{'\n'}
              • A timed session of silent prayer{'\n'}
              • A simple anchor word to return to{'\n'}
              • A reflection prompt to help you respond honestly
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>The Practice</Text>
            <Text style={styles.cardText}>
              1. Read the Scripture slowly.{'\n'}
              2. Sit in silence for the appointed time.{'\n'}
              3. When distracted, gently return to your anchor word.{'\n'}
              4. When the chime sounds, reflect on what you noticed.{'\n'}
              5. Return at your own pace through all 30 days.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>How to Use</Text>
            <Text style={styles.cardText}>
              • Select a day from the calendar to begin.{'\n'}
              • Sessions range from 5 to 20 minutes.{'\n'}
              • You can pause, reflect, and return without pressure.{'\n'}
              • Your progress is saved as you complete each day.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>A gentle reminder</Text>
            <Text style={styles.cardText}>
              You do not have to perform for God.{'\n'}
              You do not have to feel focused to pray.{'\n'}
              You only need to return honestly.
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.replace('/calendar')}
          >
            <Text style={styles.buttonText}>Begin Desert</Text>
          </Pressable>

          <Text style={styles.note}>
            You can return to these instructions anytime from the Calendar screen.
          </Text>
        </ScrollView>
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
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
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
  brandImage: {
    width: 64,
    height: 64,
    marginBottom: 8,
    alignSelf: 'center',
    opacity: 0.95,
  },
  brandLabel: {
    fontFamily: 'Inter_600SemiBold',
    color: '#8A7A67',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: 'center',
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
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#E9E1D2',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D6C8B3',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#2B2A28',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  cardText: {
    fontFamily: 'Inter_400Regular',
    color: '#6E5A3C',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#2B2A28',
    borderRadius: 26,
    paddingVertical: 18,
    paddingHorizontal: 34,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
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
  note: {
    fontFamily: 'Inter_400Regular',
    color: '#F0EDE6',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 20,
  },
});
