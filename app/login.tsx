import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect, useState } from 'react';
import { Colors } from '@/constants/Colors';

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '710995555135-pfil4cvim2ko32pk6g4e2r8bk77180sd.apps.googleusercontent.com',
    webClientId: '710995555135-k58rbtd6kejvkmhsp52hkd2qa25nan7c.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      router.replace('/(app)/home');
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => promptAsync()}
      >
        <Text style={styles.buttonText}>Sign in with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: Colors.light.text,
  },
  button: {
    backgroundColor: Colors.light.tint,
    padding: 15,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});