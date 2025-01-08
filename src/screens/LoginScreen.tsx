import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import MSALService from '../services/msal';
import {msalInstance} from '../App';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  onLogin: () => void;
};

const LoginScreen = ({navigation, onLogin}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeMSAL = async () => {
      try {
        await msalInstance.init();
      } catch (err) {
        console.error('Failed to initialize MSAL:', err);
        setError('Failed to initialize authentication.');
      }
    };

    // initializeMSAL();
  }, []);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await msalInstance.acquireToken({});
      if (result && result.accessToken) {
        console.log('Access token:', result.accessToken);
        onLogin();
      }
    } catch (err) {
      setError('Failed to login. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign in with Microsoft</Text>
        )}
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#0078d4',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 5,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});

export default LoginScreen;
