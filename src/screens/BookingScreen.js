import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Chip, Title, Card } from 'react-native-paper';
import { auth } from '../../firebaseConfig';
import { format, addDays } from 'date-fns'; 

export default function BookingScreen({ route, navigation }) {
  const { shop, service } = route.params; 
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);

  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  const dates = Array.from({ length: 5 }, (_, i) => addDays(new Date(), i));

  const handleBooking = async () => {
    if (!selectedSlot) {
      navigation.navigate('Payment', { appointmentData });
      return;
    }

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    
    const appointmentId = `${shop.id}_${dateStr}_${selectedSlot}`;
    
    
    const appointmentData = {
      id: appointmentId,
      shopId: shop.id,
      shopName: shop.name,
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email,
      serviceName: service.name,
      price: service.price,
      date: dateStr,
      time: selectedSlot,
      status: 'confirmed', 
      createdAt: new Date()
    };

    console.log("Oluşturulan Randevu Datası:", appointmentData);
    navigation.navigate('Payment', { appointmentData: appointmentData });
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>{shop.name}</Title>
          <Text>{service.name} - {service.price} TL</Text>
          <Text style={{color:'gray'}}>{service.duration}</Text>
        </Card.Content>
      </Card>

      <Title style={styles.sectionTitle}>Tarih Seçin</Title>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
        {dates.map((date, index) => {
          const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
          return (
            <Chip
              key={index}
              mode={isSelected ? 'flat' : 'outlined'}
              selected={isSelected}
              onPress={() => setSelectedDate(date)}
              style={styles.chip}
            >
              {format(date, 'dd MMM')}
            </Chip>
          );
        })}
      </ScrollView>

      <Title style={styles.sectionTitle}>Saat Seçin</Title>
      <View style={styles.grid}>
        {timeSlots.map((slot, index) => (
          <Chip
            key={index}
            mode={selectedSlot === slot ? 'flat' : 'outlined'}
            selected={selectedSlot === slot}
            onPress={() => setSelectedSlot(slot)}
            style={styles.slotChip}
          >
            {slot}
          </Chip>
        ))}
      </View>

      <Button 
        mode="contained" 
        onPress={handleBooking} 
        loading={loading}
        disabled={loading}
        style={styles.confirmButton}
      >
        Ödemeye Geç
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  card: { marginBottom: 20, backgroundColor: '#e3f2fd' },
  sectionTitle: { marginTop: 10, marginBottom: 10, fontSize: 18 },
  dateScroll: { marginBottom: 20 },
  chip: { marginRight: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  slotChip: { margin: 5, width: '30%', justifyContent:'center' },
  confirmButton: { marginTop: 30, padding: 5, marginBottom: 50 }
});