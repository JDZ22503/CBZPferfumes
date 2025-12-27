import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router'; // Stack for header config
import client from '../../../../src/api/client';
import FormField from '../../../../src/components/FormField';
import ImagePickerInput from '../../../../src/components/ImagePickerInput';
import { Picker } from '@react-native-picker/picker'; // Standard picker

import { IMAGE_BASE_URL } from '../../../../src/api/config';

const CLOUD_URL_PREFIX = IMAGE_BASE_URL;

export default function PartyForm() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const isEdit = !!id;
    const [loading, setLoading] = useState(false);
    const [imageUri, setImageUri] = useState<string | null>(null);

    const { control, handleSubmit, setValue, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            type: 'customer',
            phone: '',
            email: '',
            address: '',
            gst_no: '',
        }
    });

    useEffect(() => {
        if (isEdit) {
            loadPartyData();
        }
    }, [id]);

    const loadPartyData = async () => {
        try {
            setLoading(true);
            const res = await client.get(`/parties/${id}`);
            const data = res.data;
            setValue('name', data.name);
            setValue('type', data.type);
            setValue('phone', data.phone || '');
            setValue('email', data.email || '');
            setValue('address', data.address || '');
            setValue('gst_no', data.gst_no || '');
            if (data.image_path) {
                const cleanImg = data.image_path.startsWith('/') ? data.image_path : `/${data.image_path}`;
                const img = data.image_path.startsWith('http')
                    ? data.image_path
                    : `${CLOUD_URL_PREFIX}${cleanImg}`;
                setImageUri(img);
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to load party data');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: any) => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('type', data.type);
            formData.append('phone', data.phone);
            if (data.email) formData.append('email', data.email);
            if (data.address) formData.append('address', data.address);
            if (data.gst_no) formData.append('gst_no', data.gst_no);

            if (imageUri && !imageUri.startsWith('http')) {
                const filename = imageUri.split('/').pop() || 'upload.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                // @ts-ignore
                formData.append('image', { uri: imageUri, name: filename, type });
            }

            if (isEdit) {
                formData.append('_method', 'PUT');
                await client.post(`/parties/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await client.post('/parties', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            Alert.alert('Success', `Party ${isEdit ? 'updated' : 'created'} successfully`);
            router.push('/(app)/(tabs)/parties' as any);
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || 'Something went wrong';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEdit && !imageUri) {
        return <ActivityIndicator style={{ flex: 1 }} size="large" />;
    }

    return (
        <>
            <Stack.Screen options={{ title: isEdit ? 'Edit Party' : 'Add Party' }} />
            <ScrollView contentContainerStyle={styles.container}>
                <ImagePickerInput
                    imageUri={imageUri}
                    onImageSelected={setImageUri}
                    label="Profile Image"
                />

                <FormField
                    control={control}
                    name="name"
                    label="Name *"
                    rules={{ required: 'Name is required' }}
                    error={errors.name?.message as string}
                />

                <View style={styles.pickerContainer}>
                    <Text style={styles.label}>Type</Text>
                    <View style={styles.pickerWrapper}>
                        <Controller
                            control={control}
                            name="type"
                            render={({ field: { onChange, value } }) => (
                                <Picker
                                    selectedValue={value}
                                    onValueChange={onChange}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Customer" value="customer" />
                                    <Picker.Item label="Supplier" value="supplier" />
                                </Picker>
                            )}
                        />
                    </View>
                </View>

                <FormField
                    control={control}
                    name="phone"
                    label="Phone *"
                    keyboardType="phone-pad"
                    rules={{ required: 'Phone is required' }}
                    error={errors.phone?.message as string}
                />

                <FormField control={control} name="email" label="Email" keyboardType="email-address" />
                <FormField control={control} name="address" label="Address" multiline numberOfLines={3} style={{ height: 80 }} />
                <FormField control={control} name="gst_no" label="GST No." />

                <TouchableOpacity
                    style={[styles.submitBtn, loading && styles.disabledBtn]}
                    onPress={handleSubmit(onSubmit)}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitBtnText}>{isEdit ? 'Update Party' : 'Create Party'}</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        flexGrow: 1,
    },
    pickerContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 5,
        color: '#333',
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    submitBtn: {
        backgroundColor: '#2E8B57',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    disabledBtn: {
        backgroundColor: '#a5d6a7',
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
