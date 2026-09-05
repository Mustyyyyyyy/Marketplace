import 'react-native-gesture-handler';
import React from 'react';
import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import App from './src/App';

function Root() {
  return (
    <>
      <StatusBar style="light" />
      <App />
    </>
  );
}
registerRootComponent(Root);
