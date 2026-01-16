import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Title, Card, Text, HelperText, ProgressBar, IconButton } from 'react-native-paper';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { db } from '../../firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { theme } from '../theme';
// YENİ: Safe Area Kütüphanesi
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PaymentScreen({ route }) {
  const navigation = useNavigation();
  const { appointmentData } = route.params;

  // YENİ: Insets
  const insets = useSafeAreaInsets();

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').slice(0, 19);
  };

  const handlePayment = async () => {
    if (cardNumber.length < 16) { Alert.alert("Hata", "Geçersiz kart numarası"); return; }
    if (expiry.length < 4) { Alert.alert("Hata", "Geçersiz SKT"); return; }
    if (cvc.length < 3) { Alert.alert("Hata", "Geçersiz CVC"); return; }

    setLoading(true);
    try {
      const docRef = doc(db, "appointments", appointmentData.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        Alert.alert("Üzgünüz", "Bu saat az önce doldu!");
        navigation.goBack();
        return;
      }

      await setDoc(docRef, { ...appointmentData, status: 'confirmed', paidAt: new Date() });

      setSuccess(true);
      
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{
            name: 'Main',
            state: { routes: [{ name: 'AppointmentsTab' }] } 
          }],
        });
      }, 2000);

    } catch (error) {
      Alert.alert("Hata", error.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <IconButton icon="check-circle" size={100} iconColor={theme.colors.success} />
        <Title style={styles.successTitle}>Ödeme Başarılı!</Title>
        <Text style={{textAlign:'center', marginTop:10}}>Randevularım sayfasına yönlendiriliyorsunuz...</Text>
      </View>
    );
  }

  return (
    // YENİ: Üstten boşluk verdik
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
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
              <Text style={styles.summaryLabel}>Tutar</Text>
              <Text style={[styles.summaryValue, styles.totalValue]}>
                 {appointmentData.price} {appointmentData.currency || 'TL'}
              </Text>
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
              left={<TextInput.Icon icon="credit-card" />}
            />
            <View style={styles.row}>
              <TextInput
                label="SKT"
                value={expiry}
                onChangeText={(text) => setExpiry(text.replace(/[^0-9]/g, '').slice(0, 4))}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                placeholder="01/26"
                keyboardType="numeric"
                maxLength={4}
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
              />
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* YENİ: Alttan boşluk verdik */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <Button
          mode="contained"
          onPress={handlePayment}
          loading={loading}
          style={styles.payButton}
          contentStyle={{ height: 50 }}
          icon="check-circle"
        >
          {appointmentData.price} {appointmentData.currency || 'TL'} Öde
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  successContainer: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#fff', padding: 20 },
  successTitle: { marginTop:20, fontSize:24, color: theme.colors.success, fontWeight:'bold'},
  // ScrollView footer'ın altında kalmasın diye alt boşluğu artırdık
  scrollContent: { padding: theme.spacing.l, paddingBottom: 120 },
  progressContainer: { marginBottom: theme.spacing.l },
  stepText: { ...theme.typography.caption, marginBottom: theme.spacing.xs, color: theme.colors.text.secondary },
  progressBar: { height: 4, borderRadius: 2, backgroundColor: theme.colors.border },
  sectionTitle: { ...theme.typography.h3, color: theme.colors.primary, marginBottom: theme.spacing.m, marginTop: theme.spacing.m },
  summaryCard: { backgroundColor: '#FAF9F6', borderRadius: theme.borderRadius.lg, borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.l },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.s },
  summaryLabel: { ...theme.typography.body, color: theme.colors.text.secondary },
  summaryValue: { ...theme.typography.body, fontWeight: '600', color: theme.colors.text.primary },
  totalValue: { color: theme.colors.primary, fontWeight: 'bold' },
  inputCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, ...theme.shadows.sm },
  input: { marginBottom: theme.spacing.m, backgroundColor: theme.colors.surface },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  footer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: theme.colors.surface, 
    padding: theme.spacing.l,
    paddingTop: 15,
    borderTopWidth: 1, 
    borderTopColor: theme.colors.border, 
    ...theme.shadows.lg 
  },
  payButton: { borderRadius: theme.borderRadius.pill, backgroundColor: theme.colors.primary }
});