import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import client from '../../../../src/api/client';
import FormField from '../../../../src/components/FormField';
import ImagePickerInput from '../../../../src/components/ImagePickerInput';
import { Picker } from '@react-native-picker/picker';

import { IMAGE_BASE_URL } from '../../../../src/api/config';

const CLOUD_URL_PREFIX = IMAGE_BASE_URL;

export default function ProductForm() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const isEdit = !!id;
    const [loading, setLoading] = useState(false);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [categories, setCategories] = useState<any[]>([]);

    const { control, handleSubmit, setValue, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            sku: '',
            category_id: '',
            price: '',
            cost_price: '',
            stock: '0',
        }
    });

    useEffect(() => {
        // Ideally fetch categories here. For now hardcode or use simple logic if API provided
        // setCategories([{id: 1, name: 'Perfume'}, {id: 2, name: 'Attar'}]);

        if (isEdit) {
            loadProductData();
        }
    }, [id]);

    const loadProductData = async () => {
        try {
            setLoading(true);
            const res = await client.get(`/products/${id}`);
            const data = res.data;
            setValue('name', data.name);
            setValue('sku', data.sku);
            setValue('category_id', data.category_id?.toString() || '');
            setValue('price', data.price?.toString() || '');
            setValue('cost_price', data.cost_price?.toString() || '');
            setValue('stock', data.stock?.quantity?.toString() || '0'); // Assuming stock relation

            if (data.image_path) {
                const cleanImg = data.image_path.startsWith('/') ? data.image_path : `/${data.image_path}`;
                const img = data.image_path.startsWith('http')
                    ? data.image_path
                    : `${CLOUD_URL_PREFIX}${cleanImg}`;
                setImageUri(img);
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to load product data');
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
            formData.append('sku', data.sku);
            formData.append('price', data.price);
            formData.append('cost_price', data.cost_price);
            // formData.append('stock', data.stock); // Stock might be handled separately or via this endpoint

            if (imageUri && !imageUri.startsWith('http')) {
                const filename = imageUri.split('/').pop() || 'upload.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';
                // @ts-ignore
                formData.append('image', { uri: imageUri, name: filename, type });
            }

            if (isEdit) {
                formData.append('_method', 'PUT');
                await client.post(`/products/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await client.post('/products', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            Alert.alert('Success', `Product ${isEdit ? 'updated' : 'created'} successfully`);
            router.push('/(app)/(tabs)/products' as any);
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
            <Stack.Screen options={{ title: isEdit ? 'Edit Product' : 'Add Product' }} />
            <ScrollView contentContainerStyle={styles.container}>
                <ImagePickerInput imageUri={imageUri} onImageSelected={setImageUri} label="Product Image" />

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

                {/* Category Picker could go here if categories API exists */}

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

                {!isEdit && (
                    <FormField
                        control={control}
                        name="stock"
                        label="Initial Stock"
                        keyboardType="numeric"
                    />
                )}

                <TouchableOpacity
                    style={[styles.submitBtn, loading && styles.disabledBtn]}
                    onPress={handleSubmit(onSubmit)}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>{isEdit ? 'Update Product' : 'Create Product'}</Text>}
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
