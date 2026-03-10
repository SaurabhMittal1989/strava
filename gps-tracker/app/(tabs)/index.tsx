import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, FlatList, SafeAreaView } from 'react-native';
import {
  isTracking,
  startLocationTracking,
  stopLocationTracking,
  setLocationUpdateListener,
  locationLogs
} from '../../services/LocationService';

export default function HomeScreen() {
  const [tracking, setTracking] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Check initial status
    isTracking().then(setTracking);

    // Setup listener
    setLocationUpdateListener((newLogs) => {
      setLogs([...newLogs]);
    });
    
    // Initial fetch of logs
    setLogs([...locationLogs]);
  }, []);

  const handleToggleTracking = async () => {
    if (tracking) {
      await stopLocationTracking();
      setTracking(false);
    } else {
      const success = await startLocationTracking();
      if (success) {
        setTracking(true);
      }
    }
  };

  const renderLog = ({ item }) => {
    const time = new Date(item.timestamp).toLocaleTimeString();
    return (
      <View style={styles.logItem}>
        <Text style={styles.logText}>
          {time} - Lat: {item.coords.latitude.toFixed(5)}, Lon: {item.coords.longitude.toFixed(5)}
        </Text>
        <Text style={styles.logAccuracy}>
          Accuracy: {item.coords.accuracy.toFixed(1)}m | Speed: {(item.coords.speed || 0).toFixed(1)} m/s
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>GPS Tracker</Text>
        <Text style={styles.status}>
          Status: {tracking ? 'Active (Background)' : 'Stopped'}
        </Text>
        <Button
          title={tracking ? "Stop Tracking" : "Start Tracking"}
          color={tracking ? "#d9534f" : "#5cb85c"}
          onPress={handleToggleTracking}
        />
      </View>

      <Text style={styles.subtitle}>Recent Locations</Text>
      {logs.length === 0 ? (
        <Text style={styles.emptyText}>No locations recorded yet.</Text>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item, index) => item.timestamp.toString() + index}
          renderItem={renderLog}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    paddingTop: 60, // approximate safe area
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 15,
  },
  list: {
    paddingHorizontal: 15,
  },
  logItem: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  logText: {
    fontSize: 14,
    fontWeight: '500',
  },
  logAccuracy: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  }
});
