import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, IconButton, Button } from 'react-native-paper';
import { db, auth } from '../../firebaseConfig';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { theme } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, parse } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function AppointmentsScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const q = query(
      collection(db, "appointments"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ ...doc.data(), docId: doc.id });
      });
      list.sort((a, b) => new Date(a.date) - new Date(b.date));
      setAppointments(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (appointmentId) => {
    Alert.alert(
      "Randevu İptali",
      "Bu randevuyu iptal etmek istediğinize emin misiniz?",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Evet, İptal Et",
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "appointments", appointmentId));
            } catch (error) {
              Alert.alert("Hata", error.message);
            }
          }
        }
      ]
    );
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
      <View>
        <Text style={styles.headerSubtitle}>PLANLARIM</Text>
        <Text style={styles.headerTitle}>Randevularım</Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.iconCircle}>
        <IconButton icon="calendar-clock" size={48} iconColor={theme.colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>Henüz Randevun Yok</Text>
      <Text style={styles.emptySubtitle}>Kendini şımartmak için harika bir gün! Hemen yeni bir randevu oluştur.</Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('HomeTab')}
        style={styles.emptyButton}
        contentStyle={{ height: 50 }}
        labelStyle={styles.emptyButtonLabel}
        buttonColor={theme.colors.primary}
      >
        Keşfetmeye Başla
      </Button>
    </View>
  );

  const renderItem = ({ item }) => {
    let dateObj = new Date();
    try {
      dateObj = new Date(item.date);
    } catch (e) { }

    const dayNumber = format(dateObj, 'd');
    const monthName = format(dateObj, 'MMM', { locale: tr }).toUpperCase();

    return (
      <View style={styles.card}>
        <View style={styles.dateColumn}>
          <Text style={styles.dateDay}>{dayNumber}</Text>
          <Text style={styles.dateMonth}>{monthName}</Text>
          <View style={styles.timeContainer}>
            <Text style={styles.dateTime}>{item.time}</Text>
          </View>
        </View>

        <View style={styles.infoColumn}>
          <View>
            <Text style={styles.shopName} numberOfLines={1}>{item.shopName}</Text>
            <Text style={styles.serviceName}>{item.serviceName}</Text>
            <Text style={styles.price}>{item.price} {item.currency || 'TL'}</Text>
          </View>

          <View style={styles.statusRow}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Onaylandı</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionColumn}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.docId)}
          >
            <IconButton icon="trash-can-outline" size={20} iconColor={theme.colors.error} style={{ margin: 0 }} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : appointments.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.docId}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },


  header: {
    paddingHorizontal: theme.spacing.l,
    paddingBottom: theme.spacing.m,
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...theme.shadows.sm,
    zIndex: 1,
  },
  headerSubtitle: { ...theme.typography.caption, color: theme.colors.text.secondary, letterSpacing: 2, fontWeight: '700' },
  headerTitle: { ...theme.typography.h1, color: theme.colors.primary, marginTop: 4 },


  listContent: { padding: theme.spacing.m, paddingTop: theme.spacing.l, paddingBottom: 100 },


  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.m,
    ...theme.shadows.sm,
    overflow: 'hidden',
    minHeight: 110,
  },
  dateColumn: {
    width: 80,
    backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    paddingVertical: theme.spacing.s,
  },
  dateDay: { fontSize: 26, fontWeight: 'bold', color: theme.colors.primary },
  dateMonth: { fontSize: 13, fontWeight: '600', color: theme.colors.text.secondary, marginBottom: 6 },
  timeContainer: { backgroundColor: theme.colors.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, ...theme.shadows.sm },
  dateTime: { fontSize: 13, fontWeight: 'bold', color: theme.colors.text.primary },

  infoColumn: {
    flex: 1,
    padding: theme.spacing.m,
    justifyContent: 'space-between',
  },
  shopName: { fontSize: 18, fontWeight: '700', color: theme.colors.primary, marginBottom: 2 },
  serviceName: { fontSize: 14, color: theme.colors.text.secondary, marginBottom: 4 },
  price: { fontSize: 15, fontWeight: 'bold', color: theme.colors.accent },

  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'green', marginRight: 6 },
  statusText: { fontSize: 11, fontWeight: 'bold', color: 'green' },

  actionColumn: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: theme.spacing.s,
  },
  deleteButton: {
    padding: 8,
  },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  iconCircle: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.m
  },
  emptyTitle: { ...theme.typography.h2, color: theme.colors.primary, marginBottom: theme.spacing.s, textAlign: 'center' },
  emptySubtitle: { ...theme.typography.body, color: theme.colors.text.secondary, textAlign: 'center', marginBottom: theme.spacing.xl },
  emptyButton: { borderRadius: theme.borderRadius.pill, paddingHorizontal: theme.spacing.m, width: '100%' },
  emptyButtonLabel: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text.inverse },
});