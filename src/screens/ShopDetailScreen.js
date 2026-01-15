import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Image, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { Text, List, Divider, Title, Card, Paragraph, Button, IconButton } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Linking, Alert } from 'react-native';
import { theme } from '../theme';

const { width, height } = Dimensions.get('window');

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

  const shopLocation = {
    latitude: shop.location?.latitude || 41.0082,
    longitude: shop.location?.longitude || 28.9784,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const openWhatsApp = () => {
    Linking.openURL(`whatsapp://send?phone=905551234567`);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: shop.images && shop.images.length > 0 ? shop.images[0] : 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=60' }}
            style={styles.image}
          />
          <View style={styles.overlay} />
          <IconButton
            icon="arrow-left"
            iconColor={theme.colors.text.inverse}
            size={28}
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          />
        </View>


        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Title style={styles.title}>{shop.name}</Title>
              <Text style={styles.address}>📍 {shop.address}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {shop.rating}</Text>
            </View>
          </View>

          <Button
            mode="contained"
            icon="whatsapp"
            buttonColor="#25D366"
            style={styles.whatsappButton}
            labelStyle={theme.typography.button}
            onPress={openWhatsApp}
          >
            WhatsApp ile İletişime Geç
          </Button>

          <Divider style={styles.divider} />

          <Title style={styles.sectionTitle}>Hizmetler</Title>
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            services.map((service) => (
              <View key={service.id} style={styles.serviceItem}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDetail}>{service.duration} • {service.price} TL</Text>
                </View>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('Booking', { shop: shop, service: service })}
                  style={styles.bookButton}
                  labelStyle={{ fontSize: 12 }}
                  textColor={theme.colors.primary}
                >
                  Seç
                </Button>
              </View>
            ))
          )}

          <Divider style={styles.divider} />

          <Title style={styles.sectionTitle}>Konum</Title>
          <View style={styles.mapContainer}>
            <MapView style={styles.map} initialRegion={shopLocation}>
              <Marker coordinate={shopLocation} title={shop.name} description={shop.address} />
            </MapView>
          </View>

          <Divider style={styles.divider} />

          <Title style={styles.sectionTitle}>Yorumlar ({reviews.length})</Title>
          {reviews.length === 0 ? (
            <Text style={styles.noReviewText}>Henüz yorum yapılmamış.</Text>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} style={styles.reviewCard}>
                <Card.Content>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewRating}>{review.rating} ⭐</Text>
                    <Text style={styles.reviewUser}>Kullanıcı: {review.userId}</Text>
                  </View>
                  <Paragraph style={styles.reviewComment}>{review.comment}</Paragraph>
                </Card.Content>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  imageContainer: {
    height: 250,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  contentContainer: {
    marginTop: -20,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.l,
    minHeight: height - 230,
    ...theme.shadows.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.m,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  address: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  ratingBadge: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    ...theme.shadows.sm,
  },
  ratingText: {
    ...theme.typography.caption,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  whatsappButton: {
    width: '100%',
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.m,
    ...theme.shadows.sm,
  },
  divider: {
    marginVertical: theme.spacing.l,
    backgroundColor: theme.colors.border,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginBottom: theme.spacing.m,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '40',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  serviceDetail: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  bookButton: {
    borderRadius: theme.borderRadius.pill,
    borderColor: theme.colors.primary,
  },
  mapContainer: {
    height: 180,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  noReviewText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  reviewCard: {
    marginBottom: theme.spacing.m,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  reviewRating: {
    fontWeight: 'bold',
    color: theme.colors.accent,
  },
  reviewUser: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  reviewComment: {
    ...theme.typography.body,
    fontSize: 14,
  },
});