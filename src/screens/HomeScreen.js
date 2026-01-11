import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Appbar, ActivityIndicator, Text } from 'react-native-paper';
import { db } from '../../firebaseConfig'; 
import { collection, getDocs } from 'firebase/firestore';
import ShopCard from '../components/ShopCard'; 

export default function HomeScreen({ navigation }) {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "shops"));
      const shopsList = [];
      querySnapshot.forEach((doc) => {
        shopsList.push({ ...doc.data(), id: doc.id });
      });
      setShops(shopsList);
    } catch (error) {
      console.error("Hata:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="StyleSpot - Keşfet" />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator animating={true} size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={shops}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            
            <ShopCard shop={item} onPress={() => console.log('Detay sayfası yapılacak')} />
          )}
          ListEmptyComponent={<Text style={styles.empty}>Henüz dükkan yok.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loader: { marginTop: 50 },
  empty: { textAlign: 'center', marginTop: 20, fontSize: 16 }
});