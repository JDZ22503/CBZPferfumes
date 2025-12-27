import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ActionSheetIOS, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Props {
    imageUri: string | null;
    onImageSelected: (uri: string) => void;
    label?: string;
}

export default function ImagePickerInput({ imageUri, onImageSelected, label = 'Image' }: Props) {
    const takePhoto = async () => {
        // Request camera permission
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Sorry, we need camera permissions to take photos!');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            onImageSelected(result.assets[0].uri);
        }
    };

    const pickFromGallery = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Sorry, we need gallery permissions to select photos!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            onImageSelected(result.assets[0].uri);
        }
    };

    const showImageOptions = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) {
                        takePhoto();
                    } else if (buttonIndex === 2) {
                        pickFromGallery();
                    }
                }
            );
        } else {
            // For Android, show Alert with options
            Alert.alert(
                'Select Image',
                'Choose an option',
                [
                    {
                        text: 'Take Photo',
                        onPress: takePhoto,
                    },
                    {
                        text: 'Choose from Gallery',
                        onPress: pickFromGallery,
                    },
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                ],
                { cancelable: true }
            );
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity onPress={showImageOptions} style={styles.picker}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.image} />
                ) : (
                    <View style={styles.placeholder}>
                        <Ionicons name="camera-outline" size={40} color="#888" />
                        <Text style={styles.placeholderText}>Tap to select</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10,
        alignSelf: 'flex-start',
        color: '#333',
    },
    picker: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderStyle: 'dashed',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 12,
        color: '#888',
        marginTop: 5,
    },
});
