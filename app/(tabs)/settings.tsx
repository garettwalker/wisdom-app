import { router } from 'expo-router';
import React from 'react';
import {
  Image,
  ImageBackground,
  Platform,
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
  const { user, signOut } = useAuth();

  const handleResetProgress = async () => {
    const confirmReset = Platform.OS === 'web'
      ? window.confirm('Are you sure you want to reset all your progress? This cannot be undone.')
      : await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Reset Progress',
            'Are you sure you want to reset all your progress? This cannot be undone.',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Reset', style: 'destructive', onPress: () => resolve(true) },
            ]
          );
        });

    if (!confirmReset || !user) return;

    try {
      const { error } = await supabase
        .from('user_progress')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      if (Platform.OS === 'web') {
        window.alert('Your progress has been reset.');
      } else {
        Alert.alert('Success', 'Your progress has been reset.');
      }
    } catch (e) {
      console.error('Error resetting progress:', e);
      if (Platform.OS === 'web') {
        window.alert('Failed to reset progress.');
      } else {
        Alert.alert('Error', 'Failed to reset progress.');
      }
    }
  };

  const handleLogout = async () => {
    const confirmSignOut = Platform.OS === 'web'
      ? window.confirm('Are you sure you want to sign out? Your progress will be saved and you can sign back in anytime.')
      : await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out? Your progress will be saved and you can sign back in anytime.',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Sign Out', onPress: () => resolve(true) },
            ]
          );
        });

    if (!confirmSignOut) return;

    await signOut();
    router.replace('/login');
  };

  return (
    <ImageBackground
      source={require('../../assets/wilderness_assets_refined/backgrounds/login.background.new.png')}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <Image
            source={require('../../assets/wilderness_assets_refined/brand/logo-mark-artistic-flare-1.png')}
            style={styles.brandImage}
            resizeMode="contain"
          />
          <Text style={styles.brandLabel}>WILDERNESS</Text>
          <Text style={styles.title}>Profile</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Email</Text>
              <Text style={styles.cardValue}>
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
            <Text style={styles.sectionTitle}>Program</Text>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Current Program</Text>
              <Text style={styles.cardValue}>Desert</Text>
              <Text style={styles.cardDescription}>
                A free 30-day journey through Scripture, silence, and prayer for ordinary life.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data</Text>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Your Progress</Text>
              <Text style={styles.cardDescription}>
                Track your completion of each day's session. Your progress
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
            <Text style={styles.sectionTitle}>About</Text>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Version</Text>
              <Text style={styles.cardValue}>1.0.0</Text>
            </View>
          </View>
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
  container: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
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
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    color: '#8A7A67',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(233, 225, 210, 0.6)',
  },
  cardLabel: {
    fontFamily: 'Inter_600SemiBold',
    color: '#8A7A67',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  cardValue: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#2B2A28',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  cardDescription: {
    fontFamily: 'Inter_400Regular',
    color: '#8A7A67',
    fontSize: 14,
    lineHeight: 22,
  },
  logoutButton: {
    backgroundColor: '#E9E1D2',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginTop: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#2B2A28',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#E9E1D2',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginTop: 12,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  resetButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#2B2A28',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
