import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Button, Title, Card, ProgressBar } from 'react-native-paper';
import { auth, db } from '../../firebaseConfig'; // Added db
import { collection, query, where, onSnapshot } from 'firebase/firestore'; // Added firestore imports
import { format, addDays, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { theme } from '../theme';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BookingScreen({ route, navigation }) {
  const { shop, service } = route.params;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]); // New state for taken slots

  const insets = useSafeAreaInsets();

  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  // Listener to fetch booked slots for the selected date
  useEffect(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const q = query(
      collection(db, "appointments"),
      where("shopId", "==", shop.id),
      where("date", "==", dateStr),
      where("status", "in", ["confirmed", "pending"]) // Check both confirmed and pending
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const slots = [];
      snapshot.forEach((doc) => {
        slots.push(doc.data().time);
      });
      setBookedSlots(slots);

      // If the currently selected slot becomes booked, deselect it
      if (selectedSlot && slots.includes(selectedSlot)) {
        setSelectedSlot(null);
        Alert.alert("Uyarı", "Seçtiğiniz saat az önce başkası tarafından alındı.");
      }
    });

    return () => unsubscribe();
  }, [selectedDate, shop.id]); // Re-run when date or shop changes

  const handleBooking = async () => {
    if (!selectedSlot) {
      Alert.alert("Eksik Bilgi", "Lütfen bir saat seçiniz.");
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
      currency: service.currency || 'TL',
      date: dateStr,
      time: selectedSlot,
      status: 'pending',
      createdAt: new Date()
    };

    console.log("Oluşturulan Randevu Datası:", appointmentData);
    navigation.navigate('Payment', { appointmentData: appointmentData });
  };

  return (

    <View style={[styles.container, { paddingTop: insets.top }]}>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressContainer}>
          <Text style={styles.stepText}>Adım 1 / 2: Tarih ve Saat</Text>
          <ProgressBar progress={0.5} color={theme.colors.primary} style={styles.progressBar} />
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.shopName}>{shop.name}</Title>
            <View style={styles.serviceRow}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.servicePrice}>{service.price} {service.currency || 'TL'}</Text>
            </View>
            <Text style={styles.serviceDuration}>⏱️ {service.duration}</Text>
          </Card.Content>
        </Card>

        <Title style={styles.sectionTitle}>Tarih Seçin</Title>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
          {dates.map((date, index) => {
            const isSelected = isSameDay(date, selectedDate);
            return (
              <TouchableOpacity
                key={index}
                style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                onPress={() => {
                  setSelectedDate(date);
                  setSelectedSlot(null); // Reset slot when date changes
                }}
              >
                <Text style={[styles.dayText, isSelected && styles.textSelected]}>
                  {format(date, 'd', { locale: tr })}
                </Text>
                <Text style={[styles.monthText, isSelected && styles.textSelected]}>
                  {format(date, 'MMM', { locale: tr })}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Title style={styles.sectionTitle}>Saat Seçin</Title>
        <View style={styles.grid}>
          {timeSlots.map((slot, index) => {
            const isSelected = selectedSlot === slot;
            const isBooked = bookedSlots.includes(slot); // Check if slot is taken

            return (
              <TouchableOpacity
                key={index}
                disabled={isBooked} // Disable interaction
                style={[
                  styles.timeChip,
                  isSelected && styles.timeChipSelected,
                  isBooked && styles.timeChipDisabled // Apply disabled style
                ]}
                onPress={() => setSelectedSlot(slot)}
              >
                <Text style={[
                  styles.timeText,
                  isSelected && styles.textSelected,
                  isBooked && styles.textDisabled // Apply disabled text style
                ]}>
                  {slot}
                  {isBooked && " (Dolu)"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>


      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <View>
          <Text style={styles.totalLabel}>Toplam Tutar</Text>
          <Text style={styles.totalPrice}>{service.price} {service.currency || 'TL'}</Text>
        </View>
        <Button
          mode="contained"
          onPress={handleBooking}
          loading={loading}
          disabled={loading || !selectedSlot}
          style={styles.confirmButton}
          labelStyle={theme.typography.button}
          buttonColor={theme.colors.primary}
        >
          Devam Et
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { padding: theme.spacing.l, paddingBottom: 120 },
  progressContainer: { marginBottom: theme.spacing.l },
  stepText: { ...theme.typography.caption, marginBottom: theme.spacing.xs, color: theme.colors.text.secondary },
  progressBar: { height: 4, borderRadius: 2, backgroundColor: theme.colors.border },
  card: { marginBottom: theme.spacing.l, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, ...theme.shadows.sm },
  shopName: { ...theme.typography.h3, color: theme.colors.primary, marginBottom: theme.spacing.xs },
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  serviceName: { ...theme.typography.body, fontWeight: '600' },
  servicePrice: { ...theme.typography.body, fontWeight: 'bold', color: theme.colors.primary },
  serviceDuration: { ...theme.typography.caption, color: theme.colors.text.secondary },
  sectionTitle: { ...theme.typography.h3, color: theme.colors.primary, marginBottom: theme.spacing.m },
  dateScroll: { paddingBottom: theme.spacing.m },
  dateChip: { width: 60, height: 70, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, marginRight: theme.spacing.s, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.sm },
  dateChipSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  dayText: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text.primary },
  monthText: { fontSize: 12, color: theme.colors.text.secondary, textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  timeChip: { width: '31%', paddingVertical: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.m, borderWidth: 1, borderColor: theme.colors.border },
  timeChipSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  timeChipDisabled: { backgroundColor: '#e0e0e0', borderColor: '#d0d0d0', opacity: 0.6 }, // Disabled style
  timeText: { fontWeight: '600', color: theme.colors.text.primary },
  textSelected: { color: theme.colors.text.inverse },
  textDisabled: { color: '#a0a0a0', fontWeight: '400', textDecorationLine: 'line-through' }, // Disabled text style
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadows.lg
  },
  totalLabel: { ...theme.typography.caption, color: theme.colors.text.secondary },
  totalPrice: { ...theme.typography.h2, color: theme.colors.primary },
  confirmButton: { borderRadius: theme.borderRadius.pill, paddingHorizontal: theme.spacing.m },
});