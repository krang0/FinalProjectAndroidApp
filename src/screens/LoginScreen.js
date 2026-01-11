import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button, Title, Text } from 'react-native-paper';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore'; 
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../../firebaseConfig'; 

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); 
  const [isRegistering, setIsRegistering] = useState(false); 
  const [loading, setLoading] = useState(false);
  
  const navigation = useNavigation();

  
  const handleRegister = async () => {
    if (email === '' || password === '' || fullName === '') {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    setLoading(true);
    try {
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

       
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: fullName,
        email: email,
        role: "customer", 
        createdAt: new Date()
      });

      Alert.alert('Başarılı', 'Kayıt oluşturuldu! Giriş yapılıyor...', [
        { text: 'OK', onPress: () => navigation.replace('Main') }
      ]);
    } catch (error) {
      Alert.alert('Kayıt Hatası', error.message);
    } finally {
      setLoading(false);
    }
  };

  
  const handleLogin = async () => {
    if (email === '' || password === '') return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Giriş Hatası', 'Email veya şifre hatalı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>StyleSpot</Title>
      
      
      {isRegistering && (
        <TextInput
          label="Ad Soyad"
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
          mode="outlined"
        />
      )}

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        mode="outlined"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        label="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        mode="outlined"
      />
      
      {isRegistering ? (
        <Button mode="contained" onPress={handleRegister} loading={loading} style={styles.button}>
          Kayıt Ol
        </Button>
      ) : (
        <Button mode="contained" onPress={handleLogin} loading={loading} style={styles.button}>
          Giriş Yap
        </Button>
      )}

      <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
        <Text style={styles.switchButton}>
          {isRegistering ? "Zaten hesabın var mı? Giriş Yap" : "Hesabın yok mu? Kayıt Ol"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { textAlign: 'center', marginBottom: 30, fontSize: 28, fontWeight: 'bold', color: '#6200ee' },
  input: { marginBottom: 10 },
  button: { marginTop: 10, padding: 5 },
  switchButton: { marginTop: 20, textAlign: 'center', color: '#6200ee' }
});