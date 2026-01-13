import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button, Text, ActivityIndicator } from 'react-native-paper';
import { db, auth } from '../../firebaseConfig';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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
              Alert.alert("Bilgi", "Randevu iptal edildi.");
            } catch (error) {
              Alert.alert("Hata", error.message);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Randevularım" />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} size="large" />
      ) : appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 18, color: 'gray' }}>Henüz bir randevunuz yok.</Text>
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.docId}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Title style={{ color: '#6200ee' }}>{item.shopName}</Title>
                <Paragraph style={{ fontWeight: 'bold', fontSize: 16 }}>
                  📅 {item.date} ⏰ {item.time}
                </Paragraph>
                <Paragraph>✂️ {item.serviceName} - {item.price} TL</Paragraph>
                <View style={styles.badge}>
                  <Text style={{ color: 'green', fontWeight: 'bold' }}>• Onaylandı</Text>
                </View>
              </Card.Content>
              <Card.Actions>
                <Button 
                  color="red" 
                  icon="delete" 
                  onPress={() => handleDelete(item.docId)}
                >
                  İptal Et
                </Button>
              </Card.Actions>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { margin: 10, elevation: 3, backgroundColor: 'white' },
  badge: { marginTop: 10, padding: 5, backgroundColor: '#e8f5e9', alignSelf: 'flex-start', borderRadius: 5 }
});