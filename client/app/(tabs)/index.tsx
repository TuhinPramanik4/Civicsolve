// App.js
import React, { useState, useEffect } from "react";
import { View, Text, Button, Image, TextInput, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

export default function HomeScreen() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [description, setDescription] = useState("");

  // Get user location on load
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  // Open camera
  const openCamera = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  // Handle submission
  const handleSubmit = () => {
    const report = {
      photo,
      location,
      description,
      timestamp: new Date().toISOString(),
    };
    console.log("Report Submitted:", report);
    alert("Report Submitted! (Check console log)");
    // Later → send to Supabase or backend
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📍 Civic Issue Reporter</Text>

      <Button title="📸 Take a Photo" onPress={openCamera} />

      {photo && (
        <Image source={{ uri: photo }} style={styles.imagePreview} />
      )}

      {location && (
        <Text style={styles.locationText}>
          Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Describe the issue..."
        value={description}
        onChangeText={setDescription}
      />

      <Button title="🚀 Submit Report" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0e0d0dff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
  },
  imagePreview: {
    width: 250,
    height: 250,
    marginVertical: 15,
    borderRadius: 10,
  },
  locationText: {
    marginVertical: 10,
    fontSize: 14,
    color: "white",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    width: "100%",
    marginVertical: 15,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
});
