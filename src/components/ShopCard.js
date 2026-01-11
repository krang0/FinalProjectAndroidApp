import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';

export default function ShopCard({ shop, onPress }) {
  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Cover source={{ uri: shop.images ? shop.images[0] : 'https://via.placeholder.com/150' }} />
      <Card.Content>
        <Title style={styles.title}>{shop.name}</Title>
        <Paragraph>⭐ {shop.rating} / 5</Paragraph>
        <Paragraph style={styles.address}>📍 {shop.address}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button onPress={onPress}>Randevu Al</Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { margin: 10, elevation: 4, backgroundColor: 'white' },
  title: { marginTop: 10, fontWeight: 'bold' },
  address: { color: 'gray', fontSize: 12 }
});