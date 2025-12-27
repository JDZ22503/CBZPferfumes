import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { useForm } from 'react-hook-form';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import client from '../../../../src/api/client';
import FormField from '../../../../src/components/FormField';
import ImagePickerInput from '../../../../src/components/ImagePickerInput';

import { IMAGE_BASE_URL } from '../../../../src/api/config';

const CLOUD_URL_PREFIX = IMAGE_BASE_URL;

export default function AttarForm() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const isEdit = !!id;
    const [loading, setLoading] = useState(false);
    const [imageUri, setImageUri] = useState<string | null>(null);

    const { control, handleSubmit, setValue, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            sku: '',
            hsn_code: '',
            price: '',
            cost_price: '',
        }
    });

    useEffect(() => {
        if (isEdit) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await client.get(`/attars/${id}`);
            const data = res.data;
            setValue('name', data.name);
            setValue('sku', data.sku);
            setValue('hsn_code', data.hsn_code || '');
            setValue('price', data.price?.toString() || '');
            setValue('cost_price', data.cost_price?.toString() || '');

            if (data.image_path) {
                const cleanImg = data.image_path.startsWith('/') ? data.image_path : `/${data.image_path}`;
                const img = data.image_path.startsWith('http')
                    ? data.image_path
                    : `${CLOUD_URL_PREFIX}${cleanImg}`;
                setImageUri(img);
            }
        } catch (e: any) {
            console.error('Fetch error:', e);
            const status = e.response?.status;
            const message = e.response?.data?.message || e.message;
            Alert.alert('Error', `Failed to load data (${status || 'Unknown'}): ${message}`);
            router.replace('/(app)/(tabs)/attars' as any);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: any) => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('sku', data.sku);
            if (data.hsn_code) formData.append('hsn_code', data.hsn_code);
            formData.append('price', data.price);
            formData.append('cost_price', data.cost_price);

            if (imageUri && !imageUri.startsWith('http')) {
                const filename = imageUri.split('/').pop() || 'upload.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';
                // @ts-ignore
                formData.append('image', { uri: imageUri, name: filename, type });
            }

            if (isEdit) {
                formData.append('_method', 'PUT');
                await client.post(`/attars/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await client.post('/attars', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            Alert.alert('Success', `Attar ${isEdit ? 'updated' : 'created'} successfully`);
            router.push('/(app)/(tabs)/attars' as any);
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || 'Something went wrong';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Stack.Screen options={{ title: isEdit ? 'Edit Attar' : 'Add Attar' }} />
            <ScrollView contentContainerStyle={styles.container}>
                <ImagePickerInput imageUri={imageUri} onImageSelected={setImageUri} label="Attar Image" />

                <FormField
                    control={control}
                    name="name"
                    label="Name *"
                    rules={{ required: 'Name is required' }}
                    error={errors.name?.message as string}
                />
                <FormField
                    control={control}
                    name="sku"
                    label="SKU"
                    placeholder="Leave empty to auto-generate"
                />
                <FormField
                    control={control}
                    name="hsn_code"
                    label="HSN Code"
                    placeholder="Enter HSN Code"
                />

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <FormField
                            control={control}
                            name="price"
                            label="Price *"
                            keyboardType="numeric"
                            rules={{ required: 'Price is required' }}
                            error={errors.price?.message as string}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <FormField
                            control={control}
                            name="cost_price"
                            label="Cost Price"
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.submitBtn, loading && styles.disabledBtn]}
                    onPress={handleSubmit(onSubmit)}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>{isEdit ? 'Update Attar' : 'Create Attar'}</Text>}
                </TouchableOpacity>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
    row: { flexDirection: 'row' },
    submitBtn: { backgroundColor: '#2E8B57', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
    disabledBtn: { backgroundColor: '#a5d6a7' },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
