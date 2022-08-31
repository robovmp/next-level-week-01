import { StyleSheet, SafeAreaView, Text, View, StatusBar } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

import { Roboto_400Regular, Roboto_500Medium } from '@expo-google-fonts/roboto'
import { Ubuntu_700Bold, useFonts } from '@expo-google-fonts/ubuntu'
import { useCallback } from 'react';

import Routes from './src/routes';

SplashScreen.preventAutoHideAsync()

export default function App() {

  const [ fontesLoaded ] = useFonts( {
    Roboto_400Regular,
    Roboto_500Medium,
    Ubuntu_700Bold
  } );

  const onLayoutRootView = useCallback(async () => {
    if (fontesLoaded) {
      
      await SplashScreen.hideAsync();
    }
  }, [fontesLoaded]);

  if (!fontesLoaded) return null;


  return (
    <SafeAreaView onLayout={onLayoutRootView} style={styles.main}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <Routes />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: 'center',
  },

})
