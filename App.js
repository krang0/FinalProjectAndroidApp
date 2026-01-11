import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './src/screens/LoginScreen';

const Stack = createNativeStackNavigator();


function TempHome() {
  return (
    <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
      <Text>Ana Sayfa Yükleniyor...</Text>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={TempHome} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}