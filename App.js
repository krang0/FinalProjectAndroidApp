import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ShopDetailScreen from './src/screens/ShopDetailScreen';
import BookingScreen from './src/screens/BookingScreen';
import PaymentScreen from './src/screens/PaymentScreen';  


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
          <Stack.Screen name="ShopDetail" component={ShopDetailScreen} options={{ title: 'Dükkan Detayı', headerShown: true }} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={HomeScreen} />
          <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Randevu Seç' }} />
          <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Ödeme Yap' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}