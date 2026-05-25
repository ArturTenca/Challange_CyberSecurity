import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { handleApiError } from '../utils/errorHandler';
import { sanitizeString, validateInput } from '../utils/validation';

/**
 * Exemplo de formulário seguro para login/cadastro/feedback
 * Adapte para qualquer entrada de dados sensível!
 */
export default function SecureFormExample() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    // Validação e sanitização
    const emailSanitized = sanitizeString(email);
    const passwordSanitized = sanitizeString(password);
    const emailValidation = validateInput.email(emailSanitized);
    const passwordValidation = validateInput.password(passwordSanitized);
    if (!emailValidation.valid) {
      setError(emailValidation.error);
      return;
    }
    if (!passwordValidation.valid) {
      setError(passwordValidation.error);
      return;
    }
    setLoading(true);
    try {
      await login(emailSanitized, passwordSanitized);
      Alert.alert('Sucesso', 'Login local realizado!');
    } catch (err) {
      setError(handleApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Seguro</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Enviando...' : 'Entrar'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff', borderRadius: 8, margin: 24 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 12, marginBottom: 12 },
  button: { backgroundColor: '#4a7aff', padding: 14, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  error: { color: '#f54b2e', marginBottom: 8 },
});
