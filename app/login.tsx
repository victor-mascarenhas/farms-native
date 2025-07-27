import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Surface, TextInput, Button, Text, Title } from 'react-native-paper';
import { useAuth } from '../AuthProvider';

export default function LoginScreen() {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleRegister = async () => {
    try {
      await register(email, password);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <Surface style={styles.container}>
      <Title style={styles.title}>Login</Title>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button mode="contained" onPress={handleLogin} style={styles.button}>
        Login
      </Button>
      <Button mode="outlined" onPress={handleRegister} style={styles.button}>
        Register
      </Button>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
  title: {
    marginBottom: 20,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});

