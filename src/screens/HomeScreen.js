import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { db, auth } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import * as Location from 'expo-location';
import ShopCard from '../components/ShopCard';
import { theme } from '../theme';


const getDistanceVal = (shopLoc, userLoc) => {
  if (!shopLoc || !shopLoc.latitude || !shopLoc.longitude || !userLoc) return Infinity;
  const R = 6371;
  const dLat = (shopLoc.latitude - userLoc.latitude) * (Math.PI / 180);
  const dLon = (shopLoc.longitude - userLoc.longitude) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(userLoc.latitude * (Math.PI / 180)) * Math.cos(shopLoc.latitude * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const CATEGORIES = [
  { id: 'All', label: 'Tümü' },
  { id: 'Men', label: 'Erkek 💈' },
  { id: 'Women', label: 'Kadın 💇‍♀️' },
  { id: 'Unisex', label: 'Unisex ✂️' },
];

export default function HomeScreen({ navigation }) {
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [userLocation, setUserLocation] = useState(null);


  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "shops"));
        const shopsList = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          shopsList.push({ ...data, id: doc.id, category: data.category || 'Unisex' });
        });


        let locationCoords = null;
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let location = await Location.getCurrentPositionAsync({});
          locationCoords = location.coords;
          setUserLocation(locationCoords);
        }


        setShops(shopsList);
        applyFilterAndSort(shopsList, 'All', locationCoords);

      } catch (error) {
        console.error("Hata:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);


  const applyFilterAndSort = (dataList, category, location) => {
    let result = [...dataList];


    if (category !== 'All') {
      result = result.filter(shop => shop.category === category);
    }


    if (location) {
      result.sort((a, b) => {
        const distA = getDistanceVal(a.location, location);
        const distB = getDistanceVal(b.location, location);
        return distA - distB;
      });
    }

    setFilteredShops(result);
  };


  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    applyFilterAndSort(shops, category, userLocation);
  };

  const handleLogout = () => {
    auth.signOut().then(() => navigation.replace('Login'));
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.headerSubtitle}>Keşfet</Text>
          <Text style={styles.headerTitle}>StyleSpot</Text>
          <Text style={{ fontSize: 11, color: theme.colors.text.secondary, marginTop: 2 }}>
            {userLocation ? "📍 Konumuna göre sıralandı" : "📍 Konum bekleniyor..."}
          </Text>
        </View>
        <IconButton
          icon="logout"
          iconColor={theme.colors.primary}
          size={24}
          onPress={handleLogout}
          style={styles.logoutButton}
        />
      </View>


      <View style={{ height: 60 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                onPress={() => handleCategorySelect(cat.id)}
              >
                <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 10, color: 'gray' }}>Size en yakın dükkanlar bulunuyor...</Text>
        </View>
      ) : filteredShops.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconButton icon="store-off" size={64} iconColor={theme.colors.text.secondary} />
          <Text style={styles.emptyText}>Bu kategoride dükkan yok.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredShops}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ShopCard
              shop={item}
              userLocation={userLocation}
              onPress={() => navigation.navigate('ShopDetail', { shop: item })}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    backgroundColor: theme.colors.surface,
    paddingTop: 50,
    paddingBottom: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 15,
    ...theme.shadows.sm,
    zIndex: 1
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    marginBottom: 15
  },
  headerTitle: { ...theme.typography.h1, color: theme.colors.primary, letterSpacing: -0.5 },
  headerSubtitle: { ...theme.typography.caption, color: theme.colors.text.secondary, textTransform: 'uppercase', letterSpacing: 2, fontWeight: '600' },
  logoutButton: { margin: 0, backgroundColor: theme.colors.background },


  categoryContainer: {
    paddingHorizontal: theme.spacing.l,
    paddingVertical: 5,
    alignItems: 'center'
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: theme.colors.background,
    marginRight: 10,
    borderWidth: 0,
    ...theme.shadows.sm,
  },
  categoryPillActive: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.md,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary
  },
  categoryTextActive: {
    color: theme.colors.text.inverse
  },

  listContainer: { padding: theme.spacing.m, paddingTop: theme.spacing.l },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  emptyText: { ...theme.typography.h3, color: theme.colors.text.secondary, marginTop: theme.spacing.m },
});