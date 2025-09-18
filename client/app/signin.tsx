import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function SignIn() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/dashboard'); // redirect to default tab
    }
  }, [isLoggedIn]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <Button title="Sign In" onPress={() => setIsLoggedIn(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
});
