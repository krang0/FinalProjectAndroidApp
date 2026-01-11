import React from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { Text, Title, Divider, Button } from 'react-native-paper';

export default function ShopDetailScreen({ route, navigation }) {
  const { shop } = route.params; 

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <Image source={{ uri: shop.images ? shop.images[0] : 'https://via.placeholder.com/300' }} style={styles.image} />

      <View style={styles.content}>
        <Title style={styles.title}>{shop.name}</Title>
        <Text style={styles.address}>📍 {shop.address}</Text>
        <Text style={styles.rating}>⭐ {shop.rating} / 5</Text>

        <Divider style={styles.divider} />
        <Title style={styles.subTitle}>Hizmetler</Title>
        <Text style={{color:'gray'}}>Yükleniyor...</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 250 },
  content: { padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold' },
  address: { color: 'gray', marginTop: 5, fontSize: 16 },
  rating: { marginTop: 5, color: '#f39c12', fontWeight: 'bold' },
  divider: { marginVertical: 20 },
  subTitle: { fontSize: 20, marginBottom: 10 }
});