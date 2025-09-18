import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export default function SignIn() {
  const router = useRouter();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Simple validation (adjust rules as you like)
  const isValidPhone = /^\d{10}$/.test(mobile);
  const isValidPassword = password.length >= 6;
  const canSubmit = isValidPhone && isValidPassword && !isLoggingIn;

  useEffect(() => {
    // example: if user already logged in -> redirect
    // if (userAlreadyLoggedIn) router.replace('/(tabs)/dashboard');
  }, []);

  function handleSignIn() {
    if (!canSubmit) return;
    setIsLoggingIn(true);
    // Simulate auth delay
    setTimeout(() => {
      setIsLoggingIn(false);
      // on success navigate
      router.replace('/dashboard');
    }, 900);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.page}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="transparent"
            translucent
          />

          {/* Top gradient header */}
          <LinearGradient
            colors={["#0ea5e9", "#2563eb"]}
            start={[0, 0]}
            end={[1, 1]}
            style={styles.header}
          >
            <Text style={styles.headerTitle}>Welcome back</Text>
            <Text style={styles.headerSubtitle}>Sign in to continue</Text>
          </LinearGradient>

          {/* Card */}
          <View style={styles.card}>
            {/* Mobile input */}
            <Text style={styles.label}>Mobile number</Text>
            <View style={styles.inputRow}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.input}
                keyboardType="phone-pad"
                placeholder="Enter 10-digit mobile"
                placeholderTextColor="#9aa4b2"
                value={mobile}
                onChangeText={(t) => setMobile(t.replace(/[^0-9]/g, ''))}
                maxLength={10}
                returnKeyType="next"
              />
            </View>
            {!isValidPhone && mobile.length > 0 && (
              <Text style={styles.errorText}>Enter a valid 10-digit mobile</Text>
            )}

            {/* Password input */}
            <Text style={[styles.label, { marginTop: 18 }]}>Password</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Your password"
                placeholderTextColor="#9aa4b2"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                returnKeyType="done"
              />

              <Pressable
                onPress={() => setShowPassword((s) => !s)}
                style={styles.eyeButton}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
              </Pressable>
            </View>
            {!isValidPassword && password.length > 0 && (
              <Text style={styles.errorText}>Password must be 6+ characters</Text>
            )}

            {/* Forgot row */}
            <View style={styles.rowBetween}>
              <TouchableOpacity>
                <Text style={styles.forgot}>Forgot password?</Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Text style={styles.help}>Need help?</Text>
              </TouchableOpacity>
            </View>

            {/* Sign in button */}
            <TouchableOpacity
              style={[
                styles.button,
                { opacity: canSubmit ? 1 : 0.6 },
              ]}
              onPress={handleSignIn}
              disabled={!canSubmit}
            >
              <Text style={styles.buttonText}>{isLoggingIn ? 'Signing in...' : 'Sign In'}</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.line} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.line} />
            </View>

            {/* Secondary actions */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
              <TouchableOpacity style={styles.ghostBtn} onPress={() => router.push('/auth/signup')}>
                <Text style={styles.ghostText}>Create account</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.ghostBtn} onPress={() => {}}>
                <Text style={styles.ghostText}>Use OTP</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.footer}>By continuing you agree to our Terms & Privacy</Text>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f7fbff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  header: {
    width: '100%',
    height: 220,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 18 : 60,
    paddingHorizontal: 28,
    paddingBottom: 24,
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 6,
    fontSize: 14,
  },
  card: {
    width: '92%',
    backgroundColor: 'white',
    marginTop: -48,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  label: {
    color: '#0f172a',
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e6eef8',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderRadius: 12,
  },
  countryCode: {
    marginRight: 10,
    color: '#0f172a',
    fontWeight: '700',
  },
  input: {
    fontSize: 16,
    color: '#0f172a',
    padding: 0,
  },
  eyeButton: {
    padding: 6,
    marginLeft: 8,
    borderRadius: 8,
  },
  eyeText: { fontSize: 18 },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    alignItems: 'center',
  },
  forgot: {
    color: '#2563eb',
    fontWeight: '600',
  },
  help: { color: '#6b7280' },
  button: {
    marginTop: 18,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: 'white', fontWeight: '700', fontSize: 16 },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 12,
  },
  line: { flex: 1, height: 1, backgroundColor: '#eef4ff' },
  orText: { marginHorizontal: 12, color: '#6b7280' },
  ghostBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e6eef8',
  },
  ghostText: { color: '#2563eb', fontWeight: '600' },
  errorText: { color: '#ef4444', marginTop: 6, fontSize: 12 },
  footer: { marginTop: 18, color: '#9aa4b2', fontSize: 12 },
});
