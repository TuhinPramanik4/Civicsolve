import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { supabase } from "../supabaseClient";



type LocationCoords = {
  latitude: number;
  longitude: number;
};

type AddressInfo = {
  city?: string;
  district?: string;
  region?: string;
  postalCode?: string;
  country?: string;
};

export default function HomeScreen() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [address, setAddress] = useState<AddressInfo | null>(null);

  // Pick photo from gallery
 // Pick photo from gallery
const pickFromGallery = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permission denied", "Gallery access is required");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaType.Images,
    quality: 0.7,
  });

  if (!result.canceled) {
    setPhoto(result.assets[0].uri);
  }
};


  // Take photo from camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Camera access is required");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  // Fetch location
  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Allow location access to continue");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });

      const addr = await Location.reverseGeocodeAsync(loc.coords);
      if (addr.length > 0) {
        const place = addr[0];
        setAddress({
          city: place.city ?? place.subregion ?? undefined,
          district: place.subregion ?? undefined,
          region: place.region ?? undefined,
          postalCode: place.postalCode ?? undefined,
          country: place.country ?? undefined,
        });
      }
    } catch (err) {
      console.error("Location error:", err);
      Alert.alert("❌ Error fetching location");
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
  try {
    const fileExt = uri.split(".").pop() ?? "jpg";
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `issues/${fileName}`;

    // Fetch the file as ArrayBuffer
    const response = await fetch(uri);
    const buffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Upload to Supabase
    const { error } = await supabase.storage
      .from("issues-images")
      .upload(filePath, uint8Array, {
        cacheControl: "3600",
        upsert: false,
        contentType: `image/${fileExt}`,
      });

    if (error) {
      console.error("Upload error:", error.message);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("issues-images")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (err) {
    console.error("Unexpected error:", err);
    return null;
  }
};








  // Submit report
  // Submit report (send to backend for verification)
const handleSubmit = async () => {
  if (!title || !category || !location) {
    Alert.alert("⚠️ Missing fields", "Please fill all required fields");
    return;
  }

  try {
    let imageUrl: string | null = null;
    let authenticity = "unknown";

    // Step 1: Verify photo authenticity if photo exists
    if (photo && description) {
      const formData = new FormData();
      const filename = photo.split("/").pop() || "photo.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("image", {
        uri: photo,
        name: filename,
        type,
      } as any);
      formData.append("title", title);
      const res = await fetch(
        "https://sih-backend-3.onrender.com/api/v1/verify-photo",
        { method: "POST", body: formData }
      );

      const json = await res.json();
      console.log("Backend response:", json);

      if (!res.ok) {
        Alert.alert("❌ Failed verification", json.error || "Something went wrong");
        return;
      }

      authenticity = json.authenticity;
      if (authenticity === "fake") {
        Alert.alert("❌ Report rejected", "Photo and description don’t match");
        return;
      }
    }

    // Step 2: Upload image if verification passed
    if (photo) {
      imageUrl = await uploadImage(photo);
      if (!imageUrl) {
        Alert.alert("❌ Failed to upload image");
        return;
      }
    }

    // Step 3: Submit report to Supabase
    const { error } = await supabase.from("issues").insert([
      {
        title,
        category,
        priority,
        description,
        img: imageUrl,
        latitude: location.latitude,
        longitude: location.longitude,
        city: address?.city,
        district: address?.district,
        region: address?.region,
        postalcode: address?.postalCode,
        country: address?.country,
   
      },
    ]);

    if (error) throw error;

    Alert.alert("✅ Report submitted!");
    setTitle("");
    setCategory("");
    setPriority("Medium");
    setDescription("");
    setPhoto(null);
    setLocation(null);
    setAddress(null);
  } catch (err: any) {
    Alert.alert("❌ Submission failed", err.message);
  }
};

const insets = useSafeAreaInsets();
  return (
   <SafeAreaView style={[styles.container, { paddingTop: insets.top }]} edges={['top']}>
  <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Report an Issue</Text>

        {/* Title */}
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="Brief description of the issue"
          value={title}
          onChangeText={setTitle}
        />

        {/* Category */}
        <Text style={styles.label}>Category *</Text>
        <TextInput
          style={styles.input}
          placeholder="Select a category"
          value={category}
          onChangeText={setCategory}
        />

        {/* Priority */}
        <Text style={styles.label}>Priority</Text>
        <View style={styles.priorityRow}>
          {["Low", "Medium", "High"].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.priorityButton,
                priority === level && styles.prioritySelected,
              ]}
              onPress={() => setPriority(level as "Low" | "Medium" | "High")}
            >
              <Text
                style={[
                  styles.priorityText,
                  priority === level && styles.priorityTextSelected,
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: "top" }]}
          placeholder="Provide additional details about the issue"
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {/* Photo */}
        <Text style={styles.label}>Add Photo</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity style={styles.photoButton} onPress={pickFromGallery}>
            <Text style={{ color: "#007BFF" }}>📁 Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
            <Text style={{ color: "#007BFF" }}>📷 Camera</Text>
          </TouchableOpacity>
        </View>

        {photo && (
          <View style={styles.photoBox}>
            <Image source={{ uri: photo }} style={styles.photoPreview} />
          </View>
        )}

        {/* Location */}
        <Text style={styles.label}>Location</Text>
        <TouchableOpacity style={styles.locationButton} onPress={fetchLocation}>
          <Text style={{ color: "#007BFF" }}>📍 Use Current Location</Text>
        </TouchableOpacity>
        {location && (
          <Text style={styles.locationText}>
            {address?.city}, {address?.district}, {address?.region}{" "}
            ({address?.postalCode})
          </Text>
        )}

        {/* Submit */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffffff", padding: 20 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 20, color: "#111" },
  label: { fontSize: 14, fontWeight: "600", marginTop: 15, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  priorityRow: { flexDirection: "row", marginVertical: 10 },
  priorityButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
  },
  prioritySelected: { backgroundColor: "#007BFF", borderColor: "#007BFF" },
  priorityText: { fontSize: 14, color: "#333" },
  priorityTextSelected: { color: "#fff" },
  photoButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginHorizontal: 5,
    backgroundColor: "#f9f9f9",
  },
  photoBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  photoPreview: { width: "100%", height: "100%", borderRadius: 8 },
  locationButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
  },
  locationText: { marginTop: 10, color: "#333", fontSize: 14 },
  submitButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    marginTop: 25,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
