import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
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
    <View className="flex-1 items-center justify-center p-5 bg-white">
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        className="w-full border border-gray-300 rounded-md p-3 mb-4"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="w-full border border-gray-300 rounded-md p-3 mb-4"
      />
      {error && <Text className="text-red-500 mb-2">{error}</Text>}
      <TouchableOpacity
        className="w-full bg-green-600 py-3 rounded-md mb-2"
        onPress={handleLogin}
      >
        <Text className="text-white text-center font-semibold">Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="w-full bg-blue-600 py-3 rounded-md"
        onPress={handleRegister}
      >
        <Text className="text-white text-center font-semibold">Register</Text>
      </TouchableOpacity>
    </View>
  );
}

