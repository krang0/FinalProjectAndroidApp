import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Title, Card, Text, HelperText } from 'react-native-paper';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { db } from '../../firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function PaymentScreen({ route }) {
  const navigation = useNavigation();
  const { appointmentData } = route.params; 

  const [cardNumber, setCardNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (cardNumber.length < 16) {
      Alert.alert("Hata", "Geçersiz kart numarası");
      return;
    }

    setLoading(true);
    try {
      // ÇAKIŞMA KONTROLÜ (Concurrency)
      const docRef = doc(db, "appointments", appointmentData.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        Alert.alert("Üzgünüz", "Bu saat az önce doldu!");
        navigation.goBack();
        return;
      }

      // Randevuyu Kaydet
      await setDoc(docRef, { ...appointmentData, status: 'confirmed', paidAt: new Date() });

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
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Title>Ödeme Özeti</Title>
          <Text>Hizmet: {appointmentData.serviceName}</Text>
          <Text>Tarih: {appointmentData.date} / {appointmentData.time}</Text>
          <Title style={{ marginTop: 10, color: 'green' }}>Tutar: {appointmentData.price} TL</Title>
        </Card.Content>
      </Card>

      <Title style={styles.title}>Kart Bilgileri</Title>
      
      <TextInput
        label="Kart Numarası (16 Hane)"
        value={cardNumber}
        onChangeText={(text) => setCardNumber(text.replace(/[^0-9]/g, '').slice(0, 16))}
        style={styles.input}
        mode="outlined"
        keyboardType="numeric"
      />
      
      <View style={styles.row}>
        <TextInput
          label="SKT (AA/YY)"
          value={expiry}
          onChangeText={setExpiry}
          style={[styles.input, styles.halfInput]}
          mode="outlined"
        />
        <TextInput
          label="CVC"
          value={cvc}
          onChangeText={(text) => setCvc(text.replace(/[^0-9]/g, '').slice(0, 3))}
          style={[styles.input, styles.halfInput]}
          mode="outlined"
          keyboardType="numeric"
          secureTextEntry
        />
      </View>

      <Button 
        mode="contained" 
        onPress={handlePaymentAndBooking} 
        loading={loading}
        style={styles.payButton}
        icon="credit-card"
      >
        Öde ve Onayla
      </Button>
      
      <HelperText type="info" style={{textAlign:'center'}}>
        Bu bir simülasyondur. Gerçek para çekilmez.
      </HelperText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  summary: { marginBottom: 20, backgroundColor: '#e8f5e9' },
  input: { marginBottom: 10 },
  button: { marginTop: 20, padding: 5 }
});