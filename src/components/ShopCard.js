import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Title, Text, Button } from 'react-native-paper';
import { theme } from '../theme';

export default function ShopCard({ shop, onPress }) {
  const imageUri = shop.images && shop.images.length > 0
    ? shop.images[0]
    : 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=60'; // Barber placeholder

  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Card.Cover source={{ uri: imageUri }} style={styles.image} />
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>⭐ {shop.rating || 'N/A'}</Text>
        </View>
      </View>

      <Card.Content style={styles.content}>
        <Title style={styles.title}>{shop.name}</Title>
        <Text style={styles.address} numberOfLines={1}>
          📍 {shop.address}
        </Text>
        <Text style={styles.category}>{shop.category || 'General'}</Text>
      </Card.Content>

      <Card.Actions style={styles.actions}>
        <Button
          mode="contained"
          onPress={onPress}
          buttonColor={theme.colors.primary}
          textColor={theme.colors.text.inverse}
          style={styles.button}
          labelStyle={theme.typography.button}
        >
          Randevu Al
        </Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.m,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    height: 180,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  ratingBadge: {
    position: 'absolute',
    top: theme.spacing.s,
    right: theme.spacing.s,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.pill,
    ...theme.shadows.sm,
  },
  ratingText: {
    ...theme.typography.caption,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  content: {
    padding: theme.spacing.m,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  address: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  category: {
    ...theme.typography.caption,
    color: theme.colors.accent,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  actions: {
    paddingHorizontal: theme.spacing.m,
    paddingBottom: theme.spacing.m,
    justifyContent: 'flex-end',
  },
  button: {
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: theme.spacing.m,
  },
});