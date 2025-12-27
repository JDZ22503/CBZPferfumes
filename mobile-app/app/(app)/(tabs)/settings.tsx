import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { useForm } from 'react-hook-form';
import { useRouter, Tabs } from 'expo-router';
import client from '../../../src/api/client';
import FormField from '../../../src/components/FormField';
import ImagePickerInput from '../../../src/components/ImagePickerInput';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';

import { IMAGE_BASE_URL } from '../../../src/api/config';

const CLOUD_URL_PREFIX = IMAGE_BASE_URL;

export default function Settings() {
    const [loading, setLoading] = useState(false);
    const [logoUri, setLogoUri] = useState<string | null>(null);
    const navigation = useNavigation();

    const { control, handleSubmit, setValue } = useForm({
        defaultValues: {
            company_name: '',
            gst_rate: '',
            default_discount: '0',
            default_scheme: '',
            default_rt_rp: '',
            default_free: '',
            company_address: '',
            company_gstin: '',
            bank_name: '',
            account_no: '',
            ifsc_code: '',
            upi_id: '',
            invoice_terms: ''
        }
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            // Assuming /settings returns the settings object directly or in data
            const res = await client.get('/settings');
            const data = res.data.data || res.data; // Handle potential wrapper

            if (data) {
                setValue('company_name', data.company_name || '');
                setValue('gst_rate', data.gst_rate?.toString() || '');
                setValue('default_discount', data.default_discount || '0');
                setValue('default_scheme', data.default_scheme || '');
                setValue('default_rt_rp', data.default_rt_rp || '');
                setValue('default_free', data.default_free || '');
                setValue('company_address', data.company_address || '');
                setValue('company_gstin', data.company_gstin || '');
                setValue('bank_name', data.bank_name || '');
                setValue('account_no', data.account_no || '');
                setValue('ifsc_code', data.ifsc_code || '');
                setValue('upi_id', data.upi_id || '');
                setValue('invoice_terms', data.invoice_terms || '');

                if (data.company_logo) {
                    const cleanLogo = data.company_logo.startsWith('/') ? data.company_logo : `/${data.company_logo}`;
                    const img = data.company_logo.startsWith('http')
                        ? data.company_logo
                        : `${CLOUD_URL_PREFIX}${cleanLogo}`;
                    setLogoUri(img);
                }
            }
        } catch (e) {
            console.error(e);
            // Alert.alert('Error', 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: any) => {
        try {
            setLoading(true);
            const formData = new FormData();

            Object.keys(data).forEach(key => {
                formData.append(key, data[key]);
            });

            if (logoUri && !logoUri.startsWith('http')) {
                const filename = logoUri.split('/').pop() || 'logo.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';
                // @ts-ignore
                formData.append('company_logo', { uri: logoUri, name: filename, type });
            }

            // Using POST since many update implementations use POST with _method=PUT or just POST
            await client.post('/settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            Alert.alert('Success', 'Settings updated successfully');
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || 'Failed to update settings';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <Tabs.Screen
                options={{
                    title: 'Invoice Settings',
                }}
            />

            <ScrollView contentContainerStyle={styles.container}>
                <ImagePickerInput imageUri={logoUri} onImageSelected={setLogoUri} label="Company Logo" />

                <SectionTitle title="Company Information" />
                <FormField control={control} name="company_name" label="Company Name" />
                <FormField control={control} name="gst_rate" label="GST Rate (%)" keyboardType="numeric" />
                <FormField control={control} name="company_address" label="Company Address" multiline numberOfLines={3} />
                <FormField control={control} name="company_gstin" label="Company GSTIN" />

                <SectionTitle title="Default Texts" />
                <View style={styles.row}>
                    <View style={styles.half}>
                        <FormField control={control} name="default_discount" label="Default Discount" />
                    </View>
                    <View style={styles.half}>
                        <FormField control={control} name="default_scheme" label="Default Scheme" />
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.half}>
                        <FormField control={control} name="default_rt_rp" label="Default RT/RP" />
                    </View>
                    <View style={styles.half}>
                        <FormField control={control} name="default_free" label="Default Free Text" />
                    </View>
                </View>

                <SectionTitle title="Bank Details" />
                <FormField control={control} name="bank_name" label="Bank Name" />
                <FormField control={control} name="account_no" label="Account Number" keyboardType="numeric" />
                <FormField control={control} name="ifsc_code" label="IFSC Code" />
                <FormField control={control} name="upi_id" label="UPI ID (for QR Code)" />

                <SectionTitle title="Terms & Conditions" />
                <FormField control={control} name="invoice_terms" label="Invoice Terms & Conditions" multiline numberOfLines={4} />

                <TouchableOpacity
                    style={[styles.submitBtn, loading && styles.disabledBtn]}
                    onPress={handleSubmit(onSubmit)}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Save Settings</Text>}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const SectionTitle = ({ title }: { title: string }) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { padding: 20, paddingBottom: 50 },
    sectionHeader: { marginBottom: 15, marginTop: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2E8B57' },
    row: { flexDirection: 'row', gap: 10 },
    half: { flex: 1 },
    submitBtn: { backgroundColor: '#2E8B57', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
    disabledBtn: { backgroundColor: '#a5d6a7' },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
