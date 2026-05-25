import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getPublicErrorMessage } from '../utils/errorHandler';

const DEMO_ACCOUNTS = [
  { email: 'admin@ford.demo', role: 'Administrador' },
  { email: 'analista@ford.demo', role: 'Analista' },
  { email: 'usuario@ford.demo', role: 'Usuário' },
];

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('usuario@ford.demo');
  const [password, setPassword] = useState('Ford@2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : getPublicErrorMessage());
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Ford@2026');
    setError('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <Image
            source={require('../../assets/Ford-Logo-PNG-Isolated-Image.webp')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.eyebrow}>Ford Challenge</Text>
          <Text style={styles.title}>Entrar</Text>
          <Text style={styles.subtitle}>
            Acesse com e-mail e senha para entrar no modo demonstração local.
          </Text>

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="seu@email.com"
            placeholderTextColor="#4a5568"
            editable={!loading}
          />
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#4a5568"
            editable={!loading}
            onSubmitEditing={handleLogin}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#080a0e" />
            ) : (
              <Text style={styles.buttonText}>ENTRAR</Text>
            )}
          </TouchableOpacity>

          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>Contas de demonstração</Text>
            {DEMO_ACCOUNTS.map((acc) => (
              <TouchableOpacity
                key={acc.email}
                style={styles.demoRow}
                onPress={() => fillDemo(acc.email)}
                disabled={loading}
              >
                <Text style={styles.demoEmail}>{acc.email}</Text>
                <Text style={styles.demoRole}>{acc.role}</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.demoHint}>Senha: Ford@2026</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080a0e' },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  card: {
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: 'rgba(15,19,24,0.95)',
    borderWidth: 1,
    borderColor: '#1a2535',
    borderLeftWidth: 3,
    borderLeftColor: '#f54b2e',
    padding: 28,
  },
  logo: { width: 72, height: 40, marginBottom: 20 },
  eyebrow: {
    color: '#f54b2e',
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: { color: '#e8e2d6', fontSize: 32, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: '#6b7a8d', fontSize: 14, lineHeight: 22, marginBottom: 24 },
  label: {
    color: '#9aa0ad',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0d1016',
    borderWidth: 1,
    borderColor: '#1e2838',
    color: '#e8e2d6',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 15,
  },
  error: { color: '#ef4444', fontSize: 13, marginBottom: 12 },
  button: {
    backgroundColor: '#f54b2e',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#080a0e', fontWeight: '800', fontSize: 13, letterSpacing: 1.6 },
  demoBox: { marginTop: 28, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#1a2535' },
  demoTitle: {
    color: '#6b7a8d',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  demoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#141a24',
  },
  demoEmail: { color: '#c5cad3', fontSize: 13 },
  demoRole: { color: '#4a5568', fontSize: 12 },
  demoHint: { color: '#4a5568', fontSize: 12, marginTop: 12 },
});
