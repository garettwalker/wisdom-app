import { Lora_400Regular, Lora_700Bold, useFonts } from '@expo-google-fonts/lora';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
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

export default function LoginScreen() {
  const [fontsLoaded] = useFonts({
    Lora_400Regular,
    Lora_700Bold,
  });

  const { signIn, signUp } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        // After successful signup, user is logged in
        router.replace('/onboarding');
      } else {
        const { error } = await signIn(email.trim(), password);
        if (error) throw new Error(error);
        router.replace('/onboarding');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <Text style={styles.brand}>WISDOM OF THE DESERT</Text>

            <Text style={styles.title}>
              {isSignUp ? 'Create Account' : 'Enter in silence'}
            </Text>

            <Text style={styles.subtitle}>
              {isSignUp
                ? 'Begin your 30-day journey into the desert'
                : 'A quiet rule of prayer, attention, and return.'}
            </Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9A8F7A"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError(null);
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9A8F7A"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError(null);
              }}
              secureTextEntry
              textContentType={isSignUp ? 'newPassword' : 'password'}
              editable={!loading}
            />

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
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F1EA',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F4F1EA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  brand: {
    color: '#9A8F7A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 18,
  },
  title: {
    color: '#2F2A24',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#6E5A3C',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    maxWidth: 300,
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
  input: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderColor: '#D8D1C2',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    color: '#2F2A24',
    fontSize: 16,
  },
  passwordHint: {
    color: '#9A8F7A',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#3E3A34',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonPressed: {
    transform: [{ scale: 0.99 }],
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  toggleContainer: {
    marginTop: 20,
    paddingVertical: 10,
  },
  toggleText: {
    color: '#6E5A3C',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  note: {
    color: '#9A8F7A',
    fontSize: 12,
    marginTop: 24,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
});
