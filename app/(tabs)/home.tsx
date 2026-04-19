import { Lora_400Regular, Lora_700Bold, useFonts } from '@expo-google-fonts/lora';
import { router, useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { program } from '../../data/program';
import { useAuth } from '../../contexts/AuthContext';

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    Lora_400Regular,
    Lora_700Bold,
  });

  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);

  const today = program?.[0];

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
          <ActivityIndicator size="large" color="#6E5A3C" />
        </View>
      </SafeAreaView>
    );
  }

  if (!today) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.verse}>No program found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.day}>DAY {today.day}</Text>

        <Text style={styles.verse}>{today.text}</Text>

        <Text style={styles.anchor}>{today.anchor}</Text>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() =>
            router.push({
              pathname: '/session',
              params: {
                day: String(today.day),
                anchor: today.anchor,
                duration: String(today.duration),
              },
            })
          }
        >
          <Text style={styles.buttonText}>Begin Silence</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/calendar')}>
          <Text style={styles.progressLink}>View Progress</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e1d9c5',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#e1d9c5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  day: {
    fontFamily: 'Lora_400Regular',
    color: '#9A8F7A',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 24,
  },
  verse: {
    fontFamily: 'Lora_400Regular',
    color: '#2F2A24',
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: 42,
    maxWidth: 300,
  },
  anchor: {
    fontFamily: 'Lora_700Bold',
    color: '#6E5A3C',
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 62,
  },
  button: {
    backgroundColor: '#3E3A34',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 34,
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
    fontSize: 22,
    fontWeight: '600',
  },
  progressLink: {
    fontFamily: 'Lora_700Bold',
    color: '#6E5A3C',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 20,
  },
});
