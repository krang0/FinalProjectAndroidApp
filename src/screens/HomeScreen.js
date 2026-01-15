import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Appbar, Text, ActivityIndicator, IconButton } from 'react-native-paper';
import { db, auth } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import ShopCard from '../components/ShopCard';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

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

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.headerSubtitle}>Keşfet</Text>
          <Text style={styles.headerTitle}>StyleSpot</Text>
        </View>
        <IconButton
          icon="logout"
          iconColor={theme.colors.primary}
          size={24}
          onPress={handleLogout}
          style={styles.logoutButton}
        />
      </View>

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
              style={[
                styles.categoryPill,
                isSelected && styles.categoryPillActive
              ]}
              onPress={() => handleCategorySelect(cat.id)}
            >
              <Text style={[
                styles.categoryText,
                isSelected && styles.categoryTextActive
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
        </View>
      ) : filteredShops.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconButton icon="store-off" size={64} iconColor={theme.colors.text.secondary} />
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
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  header: {
    backgroundColor: theme.colors.surface,
    paddingTop: 50,
    paddingBottom: theme.spacing.m,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
    ...theme.shadows.sm,
    zIndex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.m,
  },
  headerTitle: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '600',
  },
  logoutButton: {
    margin: 0,
    backgroundColor: theme.colors.background,
  },
  categoryContainer: {
    paddingHorizontal: theme.spacing.l,
    paddingBottom: theme.spacing.xs,
  },
  categoryPill: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.s,
  },
  categoryPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  categoryText: {
    ...theme.typography.button,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  categoryTextActive: {
    color: theme.colors.text.inverse,
  },
  listContainer: {
    padding: theme.spacing.m,
    paddingTop: theme.spacing.l,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.h3,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.s,
  },
  emptySubText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    opacity: 0.7,
  },
});