import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Text, List, Divider, Title, Card, Paragraph, Button } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps'; // Harita eklendi
import { db } from '../../firebaseConfig'; 
import { collection, query, where, getDocs } from 'firebase/firestore'; 

export default function ShopDetailScreen({ route, navigation }) {
  const { shop } = route.params;
  const [services, setServices] = useState([]); 
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const qServices = query(collection(db, "services"), where("shopId", "==", shop.id));
        const servicesSnap = await getDocs(qServices);
        const servicesList = [];
        servicesSnap.forEach((doc) => servicesList.push({ ...doc.data(), id: doc.id }));
        setServices(servicesList);

        const qReviews = query(collection(db, "reviews"), where("shopId", "==", shop.id));
        const reviewsSnap = await getDocs(qReviews);
        const reviewsList = [];
        reviewsSnap.forEach((doc) => reviewsList.push({ ...doc.data(), id: doc.id }));
        setReviews(reviewsList);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [shop.id]);

  // Varsayılan koordinat (Dükkanın verisi yoksa İstanbul)
  const shopLocation = {
    latitude: shop.location?.latitude || 41.0082,
    longitude: shop.location?.longitude || 28.9784,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <Image source={{ uri: shop.images ? shop.images[0] : 'https://via.placeholder.com/300' }} style={styles.image} />

      <View style={styles.content}>
        <Title style={styles.title}>{shop.name}</Title>
        <Text style={styles.address}>📍 {shop.address}</Text>
        <Text style={styles.rating}>⭐ {shop.rating} / 5</Text>

        {/* HARİTA ALANI */}
        <Text style={styles.subTitle}>Konum</Text>
        <View style={styles.mapContainer}>
          <MapView style={styles.map} initialRegion={shopLocation}>
            <Marker coordinate={shopLocation} title={shop.name} description={shop.address} />
          </MapView>
        </View>

        <Divider style={styles.divider} />
        <Title style={styles.subTitle}>Hizmetler</Title>

        {loading ? <ActivityIndicator size="small" /> : services.map((service) => (
          <List.Item
            key={service.id}
            title={service.name}
            description={`${service.duration} • ${service.price} TL`}
            left={props => <List.Icon {...props} icon="content-cut" />}
            right={props => (
              <Button 
                mode="outlined" 
                onPress={() => navigation.navigate('Booking', { shop: shop, service: service })}
              >
                Seç
              </Button>
            )}
          />
        ))}

        <Divider style={styles.divider} />
        <Title style={styles.subTitle}>Yorumlar</Title>
        {reviews.map((r) => (
           <Card key={r.id} style={{marginBottom:10, backgroundColor:'#f9f9f9'}}>
             <Card.Content><Paragraph>{r.comment}</Paragraph></Card.Content>
           </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 200 },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  address: { color: 'gray', marginTop: 5 },
  rating: { marginTop: 5, color: '#f39c12', fontWeight: 'bold' },
  divider: { marginVertical: 20 },
  subTitle: { fontSize: 20, marginBottom: 10, marginTop: 10 },
  mapContainer: { height: 200, borderRadius: 10, overflow: 'hidden', marginTop: 5, borderWidth: 1, borderColor: '#ddd'},
  map: { width: '100%', height: '100%' },
});