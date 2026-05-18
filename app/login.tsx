import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  ImageBackground,
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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim().length > 0 && password.trim().length >= 6;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await signUp(email.trim(), password);
        if (error) throw new Error(error);
        router.replace('/onboarding');
      } else {
        const { error } = await signIn(email.trim(), password);
        if (error) throw new Error(error);
        router.replace('/(tabs)/home');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/wilderness_assets_refined/backgrounds/login.background.new.png')}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.safeArea}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
              <Image
                source={require('../assets/wilderness_assets_refined/brand/logo-mark-artistic-flare-1.png')}
                style={styles.brandImage}
                resizeMode="contain"
              />

              <Text style={styles.brandLabel}>WILDERNESS</Text>

              <Text style={styles.headline}>
                Beyond the noise, transformation begins.
              </Text>

              <Text style={styles.subheadline}>
                Slow down with God right where you are.
              </Text>

              <Text style={styles.supportingText}>
                Make space for Scripture, silence, and prayer in the middle of ordinary life.
              </Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#8A7A67"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError(null);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="username"
                autoComplete="username"
                editable={!loading}
              />
            </View>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#8A7A67"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError(null);
                }}
                secureTextEntry={!showPassword}
                textContentType={isSignUp ? 'newPassword' : 'password'}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                autoCapitalize="none"
                editable={!loading}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                hitSlop={10}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#8A7A67"
                />
              </Pressable>
            </View>

            {isSignUp && (
              <Text style={styles.passwordHint}>
                Password must be at least 6 characters
              </Text>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                !canSubmit && styles.buttonDisabled,
                loading && styles.buttonDisabled,
                pressed && canSubmit && !loading && styles.buttonPressed,
              ]}
              onPress={handleSubmit}
              disabled={!canSubmit || loading}
            >
              <Text style={styles.buttonText}>
                {loading
                  ? 'Loading...'
                  : isSignUp
                  ? 'Create Account'
                  : 'Continue'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              style={styles.toggleContainer}
            >
              <Text style={styles.toggleText}>
                {isSignUp
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Sign Up"}
              </Text>
            </Pressable>

            <Text style={styles.note}>
              Your progress is saved to the cloud and syncs across devices.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  brandImage: {
    width: 80,
    height: 80,
    marginBottom: 8,
    opacity: 0.95,
  },
  brandLabel: {
    fontFamily: 'Inter_600SemiBold',
    color: '#8A7A67',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 3,
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  headline: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#2B2A28',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 40,
  },
  subheadline: {
    fontFamily: 'PlayfairDisplay_400Regular',
    color: '#8A7A67',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 26,
  },
  supportingText: {
    fontFamily: 'Inter_400Regular',
    color: '#8A7A67',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 320,
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
    fontFamily: 'Inter_400Regular',
    color: '#A33',
    fontSize: 14,
    textAlign: 'center',
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: 340,
    marginBottom: 14,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 340,
    marginBottom: 14,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#E9E1D2',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    color: '#2B2A28',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -10,
    padding: 4,
  },
  passwordHint: {
    fontFamily: 'Inter_400Regular',
    color: '#8A7A67',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#2B2A28',
    borderRadius: 26,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  toggleContainer: {
    marginTop: 24,
    paddingVertical: 10,
  },
  toggleText: {
    fontFamily: 'Inter_500Medium',
    color: '#F0EDE6',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  note: {
    fontFamily: 'Inter_400Regular',
    color: '#F0EDE6',
    fontSize: 12,
    marginTop: 28,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
});
