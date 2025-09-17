import React, { useState } from "react";
import { View, Text, Button, Image, TextInput, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { supabase } from "../../supabaseClient";
import * as FileSystem from "expo-file-system/legacy";
import {  StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
type LocationCoords = {
  latitude: number;
  longitude: number;
};

export default function HomeScreen() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [description, setDescription] = useState<string>("");

  // Open camera and fetch location
  const openCamera = async () => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }

      // Fetch current location
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
        maximumAge: 10000,
        timeout: 5000,
      });
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Camera/Location error:", err);
      Alert.alert("❌ Unable to fetch location or open camera");
    }
  };

  // Upload image to Supabase Storage
  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const fileExt = uri.split(".").pop() ?? "jpg";
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `issues/${fileName}`;

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

      const { error } = await supabase.storage
        .from("issues-images")
        .upload(filePath, binary, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (error) throw error;

      const { data } = supabase.storage.from("issues-images").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  };

  // Submit report
  const handleSubmit = async () => {
    if (!location) {
      Alert.alert("Location not available");
      return;
    }

    try {
      let imageUrl: string | null = null;

      if (photo) {
        imageUrl = await uploadImage(photo);
        if (!imageUrl) {
          Alert.alert("Failed to upload image");
          return;
        }
      }

      const { error } = await supabase.from("issues").insert([
        {
          description,
          img: imageUrl,
          latitude: location.latitude,
          longitude: location.longitude,
        },
      ]);

      if (error) throw error;

      Alert.alert("✅ Report Submitted!");
      setPhoto(null);
      setDescription("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert("❌ Error submitting report", err.message);
      } else {
        Alert.alert("❌ Unknown error");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
       <StatusBar barStyle="dark-content" backgroundColor="#f3f3f3ff" />
      <Text style={styles.header}>📍 Civic Issue Reporter</Text>

      <Button title="📸 Take a Photo" onPress={openCamera} />

      {photo && <Image source={{ uri: photo }} style={styles.imagePreview} />}

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
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "black",
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
    color: "black",
  },
  input: {
    borderWidth: 1,
    borderColor: "#0c0c0cff",
    padding: 10,
    width: "100%",
    marginVertical: 15,
    borderRadius: 8,
    backgroundColor: "#ffffffff",
  },
});
