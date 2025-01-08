import React from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {loadAzureConfig} from './msal/oauthConfigStore';
import Oauth from './msal/oauth';
import jwtDecode from 'jwt-decode';

export default function App() {
  const [authResult, setAuthResult] = React.useState();

  React.useEffect(() => {
    async function init() {
      // try {
      if (await loadAzureConfig()) {
        if (await Oauth.signInSilently()) {
          setAuthResult(global.azureAccessToken);
        } else {
          console.log('nima2');
        }
      } else {
        console.log('nima11');

        if (await Oauth.signInInteractively()) {
          console.log('nima3');
        }
      }
      // } catch (error) {
      //   console.log('nima1');

      //   console.error(error);
      // }
    }
    init();
  }, []);

  const handleSignInPress = async () => {
    // try {
    //   const res = await msalInstance.signIn({scopes, webviewParameters});
    //   setAuthResult(res);
    // } catch (error) {
    console.warn('error');
    // }
  };

  // const handleAcquireTokenPress = async () => {
  //   try {
  //     const res = await msalInstance.acquireTokenSilent({
  //       scopes,
  //       forceRefresh: true,
  //     });
  //     setAuthResult(res);
  //   } catch (error) {
  //     console.warn(error);
  //   }
  // };

  // const handleSignoutPress = async () => {
  //   try {
  //     await msalInstance.signOut();
  //     setAuthResult(null);
  //   } catch (error) {
  //     console.warn(error);
  //   }
  // };

  const handleLinkToWeb = async () => {
    // const decodedToken = jwtDecode(global.azureAccessToken);
    console.log(global.azureAccessToken);
    console.log(global.azureAccount);

    Linking.openURL(
      `http://localhost:3002?accessToken=${global.azureAccessToken}`,
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.buttonContainer}>
        {authResult ? (
          <>
            <TouchableOpacity
              style={styles.button}
              // onPress={handleAcquireTokenPress}
            >
              <Text>Acquire Token (Silent)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              // onPress={handleSignoutPress}
            >
              <Text>Sign Out</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={handleSignInPress}>
              <Text>Sign In</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity style={[styles.button]} onPress={handleLinkToWeb}>
          <Text>Link to web</Text>
        </TouchableOpacity>
        {/* {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={[styles.button, styles.switchButton]}
            onPress={() => setIosEphemeralSession(!iosEphemeralSession)}>
            <Text>Prefer ephemeral browser session (iOS only)</Text>
            <Switch
              value={iosEphemeralSession}
              onValueChange={setIosEphemeralSession}
            />
          </TouchableOpacity>
        )} */}
      </View>
      <ScrollView style={styles.scrollView}>
        <Text>{JSON.stringify(authResult, null, 2)}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: '1%',
    backgroundColor: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: '1%',
    margin: '-0.5%',
  },
  button: {
    backgroundColor: 'aliceblue',
    borderWidth: 1,
    margin: '0.5%',
    padding: 8,
    width: '30%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ddd',
  },
  switchButton: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 4,
    margin: '0.5%',
    width: '99%',
  },
  scrollView: {
    borderWidth: 1,
    padding: 1,
  },
});
