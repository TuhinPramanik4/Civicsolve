import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import React from 'react';
import {
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.page}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <LinearGradient
        colors={["#0ea5e9", "#2563eb"]}
        start={[0, 0]}
        end={[1, 1]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Your civic reports overview</Text>
      </LinearGradient>

      {/* Cards */}
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.cardRow}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Total Reports</Text>
            <Text style={styles.cardValue}>128</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Resolved</Text>
            <Text style={styles.cardValue}>86</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>In Progress</Text>
            <Text style={styles.cardValue}>30</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Your Area</Text>
            <Text style={styles.cardValue}>12</Text>
          </View>
        </View>

        {/* Add Complaint Button */}
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/add-report')}>
          <Text style={styles.addBtnText}>+ Add Complaint</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f7fbff',
  },
  header: {
    width: '100%',
    height: 200,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 6,
    fontSize: 14,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  card: {
    flex: 1,
    backgroundColor: 'white',
    marginHorizontal: 6,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 6,
  },
  cardLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 6,
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563eb',
  },
  addBtn: {
    marginTop: 20,
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  addBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});
