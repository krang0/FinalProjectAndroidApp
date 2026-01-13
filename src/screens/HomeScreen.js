import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Text, ActivityIndicator, Chip } from 'react-native-paper';
import { db, auth } from '../../firebaseConfig'; 
import { collection, getDocs } from 'firebase/firestore';
import ShopCard from '../components/ShopCard'; 

export default function HomeScreen({ navigation }) {
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All'); 

  const fetchShops = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "shops"));
      const shopsList = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        shopsList.push({ ...data, id: doc.id, category: data.category || 'Unisex' });
      });
      setShops(shopsList);
      if (selectedCategory === 'All') {
        setFilteredShops(shopsList);
      } else {
        setFilteredShops(shopsList.filter(shop => shop.category === selectedCategory));
      }
    } catch (error) {
      console.error("Hata:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      setFilteredShops(shops);
    } else {
      const filtered = shops.filter(shop => shop.category === category);
      setFilteredShops(filtered);
    }
  };

  const handleLogout = () => {
    auth.signOut().then(() => navigation.replace('Login'));
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="StyleSpot - Keşfet" />
        <Appbar.Action icon="logout" onPress={handleLogout} />
      </Appbar.Header>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip 
            selected={selectedCategory === 'All'} 
            onPress={() => handleCategorySelect('All')} 
            style={styles.chip} 
            mode="outlined"
          >
            Tümü
          </Chip>
          <Chip 
            selected={selectedCategory === 'Men'} 
            onPress={() => handleCategorySelect('Men')} 
            style={styles.chip} 
            mode="outlined"
          >
            Erkek 💈
          </Chip>
          <Chip 
            selected={selectedCategory === 'Women'} 
            onPress={() => handleCategorySelect('Women')} 
            style={styles.chip} 
            mode="outlined"
          >
            Kadın 💇‍♀️
          </Chip>
          <Chip 
            selected={selectedCategory === 'Unisex'} 
            onPress={() => handleCategorySelect('Unisex')} 
            style={styles.chip} 
            mode="outlined"
          >
            Unisex ✂️
          </Chip>
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator animating={true} size="large" style={styles.loader} />
      ) : filteredShops.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Henüz dükkan bulunmuyor.</Text>
          <Text style={styles.emptySubText}>
            Dükkanlar eklendiğinde burada görünecektir.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredShops}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ShopCard 
              shop={item} 
              onPress={() => navigation.navigate('ShopDetail', { shop: item })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loader: { marginTop: 50 },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center'
  },
  filterContainer: { 
    padding: 10, 
    backgroundColor: 'white', 
    height: 60 
  },
  chip: { marginRight: 8, height: 35 }
});