import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { TextInput, Button, Title, Text } from 'react-native-paper';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../../firebaseConfig';
import { theme } from '../theme';

const { width, height } = Dimensions.get('window');

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
    <View style={styles.mainContainer}>
      <View style={styles.headerBackground} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <Title style={styles.appTitle}>StyleSpot</Title>
            <Text style={styles.subtitle}>
              {isRegistering ? "Yeni Bir Hesap Oluştur" : "Tekrar Hoşgeldiniz"}
            </Text>
          </View>

          <View style={styles.card}>
            {isRegistering && (
              <TextInput
                label="Ad Soyad"
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
                mode="outlined"
                outlineColor={theme.colors.border}
                activeOutlineColor={theme.colors.primary}
                left={<TextInput.Icon icon="account" color={theme.colors.text.secondary} />}
                theme={{ colors: { background: theme.colors.surface } }}
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
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
              left={<TextInput.Icon icon="email" color={theme.colors.text.secondary} />}
              theme={{ colors: { background: theme.colors.surface } }}
            />

            <TextInput
              label="Şifre"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              mode="outlined"
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
              left={<TextInput.Icon icon="lock" color={theme.colors.text.secondary} />}
              theme={{ colors: { background: theme.colors.surface } }}
            />

            <Button
              mode="contained"
              onPress={isRegistering ? handleRegister : handleLogin}
              loading={loading}
              style={styles.button}
              labelStyle={styles.buttonLabel}
              buttonColor={theme.colors.primary}
            >
              {isRegistering ? "Kayıt Ol" : "Giriş Yap"}
            </Button>

            <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)} style={styles.switchContainer}>
              <Text style={styles.switchText}>
                {isRegistering ? "Zaten hesabın var mı?" : "Hesabın yok mu?"}
                <Text style={styles.switchTextBold}>
                  {isRegistering ? " Giriş Yap" : " Kayıt Ol"}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.35,
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: theme.borderRadius.xl * 1.5,
    borderBottomRightRadius: theme.borderRadius.xl * 1.5,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.l,
    paddingTop: theme.spacing.xxl,
  },
  headerContainer: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  appTitle: {
    ...theme.typography.h1,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.inverse,
    opacity: 0.8,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.lg,
  },
  input: {
    marginBottom: theme.spacing.m,
    backgroundColor: theme.colors.surface,
  },
  button: {
    marginTop: theme.spacing.m,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.pill,
    ...theme.shadows.md,
  },
  buttonLabel: {
    ...theme.typography.button,
    color: theme.colors.text.inverse,
  },
  switchContainer: {
    marginTop: theme.spacing.l,
    alignItems: 'center',
  },
  switchText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  switchTextBold: {
    fontWeight: '700',
    color: theme.colors.primary,
  }
});