import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

const BACKGROUND_LOCATION_TASK = 'BACKGROUND_LOCATION_TASK';

// In-memory array for locations (would usually be stored in SQLite or async storage)
export let locationLogs = [];

export const MIN_DISTANCE_BETWEEN_LOCATIONS = 10; // filters noisy locations
export const MAX_ACCURACY = 50; // discard signals with accuracy > 50 meters

export const addLocationLog = (locations) => {
  const newLogs = locations.filter(loc => loc.coords.accuracy <= MAX_ACCURACY);
  
  if (newLogs.length === 0) return;

  locationLogs = [...newLogs, ...locationLogs]; // add to front
  
  if (onLocationUpdateCallback) {
    onLocationUpdateCallback([...locationLogs]);
  }
};

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, ({ data, error }) => {
  if (error) {
    console.error('Background Location Error:', error);
    return;
  }
  if (data) {
    const { locations } = data;
    addLocationLog(locations);
  }
});

let onLocationUpdateCallback = null;

export const setLocationUpdateListener = (callback) => {
  onLocationUpdateCallback = callback;
};

export const startLocationTracking = async () => {
  try {
    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
    if (fgStatus !== 'granted') {
      console.log('Foreground permission not granted');
      return false;
    }
    
    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
    if (bgStatus !== 'granted') {
      console.log('Background permission not granted');
      return false;
    }
    
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 60000,
      distanceInterval: MIN_DISTANCE_BETWEEN_LOCATIONS,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'GPS Tracking Active',
        notificationBody: 'Your location is being tracked in the background.',
      },
    });
    
    return true;
  } catch (err) {
    console.error('Error starting location updates', err);
    return false;
  }
};

export const stopLocationTracking = async () => {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    }
  } catch (err) {
    console.error('Error stopping location updates', err);
  }
};

export const isTracking = async () => {
  return await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
};
