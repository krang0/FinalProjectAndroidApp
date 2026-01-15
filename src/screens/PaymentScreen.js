import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, Dimensions } from 'react-native';
import { TextInput, Button, Title, Card, Text, HelperText, ProgressBar } from 'react-native-paper';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { db } from '../../firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

export default function PaymentScreen({ route }) {
  const navigation = useNavigation();
  const { appointmentData } = route.params;

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [loading, setLoading] = useState(false);


  const formatCardNumber = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').slice(0, 19);
  };

  const handlePayment = async () => {
    if (cardNumber.length < 16) {
      Alert.alert("Hata", "Geçersiz kart numarası");
      return;
    }
    if (expiry.length < 4) {
      Alert.alert("Hata", "Geçersiz son kullanma tarihi");
      return;
    }
    if (cvc.length < 3) {
      Alert.alert("Hata", "Geçersiz CVC");
      return;
    }

    setLoading(true);
    try {
      const docRef = doc(db, "appointments", appointmentData.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        Alert.alert("Üzgünüz", "Bu saat az önce doldu!");
        navigation.goBack();
        return;
      }

      await setDoc(docRef, {
        ...appointmentData,
        status: 'confirmed',
        paidAt: new Date()
      });

      Alert.alert("Başarılı", "Randevunuz oluşturuldu!", [
        {
          text: "Tamam",
          onPress: () => navigation.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] })
          )
        }
      ]);

    } catch (error) {
      Alert.alert("Hata", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.progressContainer}>
          <Text style={styles.stepText}>Adım 2 / 2: Ödeme</Text>
          <ProgressBar progress={1.0} color={theme.colors.primary} style={styles.progressBar} />
        </View>

        <Title style={styles.sectionTitle}>Sipariş Özeti</Title>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Hizmet</Text>
              <Text style={styles.summaryValue}>{appointmentData.serviceName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tarih</Text>
              <Text style={styles.summaryValue}>{appointmentData.date}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Saat</Text>
              <Text style={styles.summaryValue}>{appointmentData.time}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, styles.totalLabel]}>Toplam</Text>
              <Text style={[styles.summaryValue, styles.totalValue]}>{appointmentData.price} TL</Text>
            </View>
          </Card.Content>
        </Card>

        <Title style={styles.sectionTitle}>Kart Bilgileri</Title>
        <Card style={styles.inputCard}>
          <Card.Content>
            <TextInput
              label="Kart Numarası"
              value={cardNumber}
              onChangeText={(text) => setCardNumber(formatCardNumber(text))}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
              maxLength={19}
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
              left={<TextInput.Icon icon="credit-card" />}
              theme={{ colors: { background: theme.colors.surface } }}
            />

            <View style={styles.row}>
              <TextInput
                label="SKT (AA/YY)"
                value={expiry}
                onChangeText={(text) => setExpiry(text.replace(/[^0-9]/g, '').slice(0, 4))}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                placeholder="01/26"
                keyboardType="numeric"
                maxLength={4}
                outlineColor={theme.colors.border}
                activeOutlineColor={theme.colors.primary}
                theme={{ colors: { background: theme.colors.surface } }}
              />
              <TextInput
                label="CVC"
                value={cvc}
                onChangeText={(text) => setCvc(text.replace(/[^0-9]/g, '').slice(0, 3))}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry
                outlineColor={theme.colors.border}
                activeOutlineColor={theme.colors.primary}
                right={<TextInput.Icon icon="help-circle-outline" />}
                theme={{ colors: { background: theme.colors.surface } }}
              />
            </View>
          </Card.Content>
        </Card>

        <HelperText type="info" style={styles.infoText}>
          🔒 Güvenli Ödeme: Kart bilgileriniz şifrelenerek korunmaktadır. Bu bir simülasyondur.
        </HelperText>

      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handlePayment}
          loading={loading}
          style={styles.payButton}
          contentStyle={{ height: 50 }}
          labelStyle={theme.typography.button}
          buttonColor={theme.colors.primary}
          icon="check-circle"
        >
          {appointmentData.price} TL Öde ve Onayla
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  scrollContent: {
    padding: theme.spacing.l,
    paddingBottom: 100,
  },
  progressContainer: {
    marginBottom: theme.spacing.l,
  },
  stepText: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.xs,
    color: theme.colors.text.secondary,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginBottom: theme.spacing.m,
    marginTop: theme.spacing.m,
  },
  summaryCard: {
    backgroundColor: '#FAF9F6',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.l,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.s,
  },
  summaryLabel: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  summaryValue: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.s,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  totalLabel: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontSize: 18,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  inputCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  input: {
    marginBottom: theme.spacing.m
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  halfInput: {
    width: '48%'
  },
  infoText: {
    textAlign: 'center',
    marginTop: theme.spacing.m,
    color: theme.colors.text.secondary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadows.lg,
  },
  payButton: {
    borderRadius: theme.borderRadius.pill,
    ...theme.shadows.md,
  },
});