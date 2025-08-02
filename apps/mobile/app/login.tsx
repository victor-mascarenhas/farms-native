import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Surface, TextInput, Button, Text, Title } from "react-native-paper";
import { useAuth } from "../AuthProvider";

export default function LoginScreen() {
  const { login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <View style={styles.background}>
      <Surface style={styles.card} elevation={4}>
        <Title style={styles.title}>Login</Title>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          style={styles.input}
          theme={{ colors: { text: "#23272f" } }}
          underlineColor="#23272f"
          selectionColor="#23272f"
          mode="outlined"
          outlineColor="#e2e8f0"
          activeOutlineColor="#10b981"
          textColor="#23272f"
        />
        <TextInput
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          theme={{ colors: { text: "#23272f" } }}
          underlineColor="#23272f"
          selectionColor="#23272f"
          mode="outlined"
          outlineColor="#e2e8f0"
          activeOutlineColor="#10b981"
          textColor="#23272f"
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <Button
          mode="contained"
          onPress={handleLogin}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Entrar
        </Button>
        <Button
          mode="outlined"
          onPress={handleRegister}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Registrar
        </Button>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#f4f6fa",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 380,
    padding: 28,
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#23272f",
  },
  input: {
    marginBottom: 18,
    backgroundColor: "#f4f6fa",
  },
  button: {
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  error: {
    color: "#ef4444",
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "bold",
  },
});
