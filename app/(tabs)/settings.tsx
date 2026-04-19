import { Lora_400Regular, Lora_700Bold, useFonts } from '@expo-google-fonts/lora';
import { router } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function SettingsScreen() {
  const [fontsLoaded] = useFonts({
    Lora_400Regular,
    Lora_700Bold,
  });

  const { user, signOut } = useAuth();

  const handleResetProgress = async () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all your progress? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.from('user_progress').delete().neq('id', '00000000-0000-0000-0000-000000000000');
              Alert.alert('Success', 'Your progress has been reset.');
            } catch {
              Alert.alert('Error', 'Failed to reset progress.');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your progress will be saved and you can sign back in anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          onPress: async () => {
            await signOut();
            router.replace('/login');
          },
        },
      ]
    );
  };

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your desert journey</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Signed In</Text>
            <Text style={styles.cardText}>
              {user?.email || 'Not signed in'}
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Sign Out</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>30 Days Into the Desert</Text>
            <Text style={styles.cardText}>
              A journey of silence and reflection. Each day offers a new theme
              and anchor verse to meditate on during your session.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Progress</Text>
            <Text style={styles.cardText}>
              Track your completion of each day&apos;s session. Your progress
              is synced to the cloud and saved across devices.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.resetButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleResetProgress}
            >
              <Text style={styles.resetButtonText}>Reset All Progress</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Info</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e1d9c5',
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  title: {
    fontFamily: 'Lora_700Bold',
    color: '#2F2A24',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Lora_400Regular',
    color: '#9A8F7A',
    fontSize: 14,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Lora_700Bold',
    color: '#6E5A3C',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#E8E3D9',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#D8D1C2',
  },
  cardTitle: {
    fontFamily: 'Lora_700Bold',
    color: '#2F2A24',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardText: {
    fontFamily: 'Lora_400Regular',
    color: '#6E5A3C',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: '#9A8F7A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  logoutButtonText: {
    fontFamily: 'Lora_700Bold',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#9A8F7A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  resetButtonText: {
    fontFamily: 'Lora_700Bold',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8E3D9',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#D8D1C2',
  },
  infoLabel: {
    fontFamily: 'Lora_400Regular',
    color: '#6E5A3C',
    fontSize: 14,
  },
  infoValue: {
    fontFamily: 'Lora_700Bold',
    color: '#2F2A24',
    fontSize: 14,
    fontWeight: '700',
  },
});
