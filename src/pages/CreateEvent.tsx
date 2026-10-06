import 'react-native-get-random-values';
import { Feather } from '@expo/vector-icons';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { StackScreenProps } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useContext, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { v4 as uuidv4 } from 'uuid';
import BigButton from '../components/BigButton';
import { AuthenticationContext } from '../context/AuthenticationContext';
import { RootStackParamList } from '../routes/AppStack';
import { createEvent } from '../services/events';
import { getUploadedImageUrl, uploadImage } from '../services/imageApi';
import { Event } from '../types/Event';
import { formatBytes, updateDateWithNewTime } from '../utils';

type Props = StackScreenProps<RootStackParamList, 'CreateEvent'>;

const ABOUT_MAX_LENGTH = 300;

// Exact size in bytes of the data a base64 string encodes (4 characters per 3 bytes, minus '=' padding).
const getBase64ByteLength = (base64: string): number => {
    const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
    return (base64.length * 3) / 4 - padding;
};

interface PictureDetails {
    uri: string;
    name: string;
    size: number;
    url: string;
}

export default function CreateEvent({ navigation, route }: Props) {
    const { position } = route.params;
    const authenticationContext = useContext(AuthenticationContext);
    const { showActionSheetWithOptions } = useActionSheet();

    const [name, setName] = useState('');
    const [about, setAbout] = useState('');
    const [volunteersNeeded, setVolunteersNeeded] = useState('');
    const [date, setDate] = useState<Date>();
    const [time, setTime] = useState<Date>();
    const [picture, setPicture] = useState<PictureDetails>();
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>();

    const volunteersCount = Number(volunteersNeeded);
    const isFormValid =
        name.trim().length > 0 &&
        about.trim().length > 0 &&
        Number.isInteger(volunteersCount) &&
        volunteersCount > 0 &&
        !!date &&
        !!time &&
        !!picture;

    const pickFromCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return Alert.alert('Permission needed', 'Camera access is required to take a photo.');
        const result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.5 });
        if (!result.canceled) await handleImageSelected(result.assets[0]);
    };

    const pickFromLibrary = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return Alert.alert('Permission needed', 'Photo library access is required to pick an image.');
        const result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.5 });
        if (!result.canceled) await handleImageSelected(result.assets[0]);
    };

    const handleImageSelected = async (asset: ImagePicker.ImagePickerAsset) => {
        if (!asset.base64) return Alert.alert('Upload failed', 'The selected image could not be read.');

        setIsUploading(true);
        try {
            const response = await uploadImage(asset.base64);
            setPicture({
                uri: asset.uri,
                name: asset.fileName ?? 'image.jpg',
                size: asset.fileSize ?? getBase64ByteLength(asset.base64),
                url: getUploadedImageUrl(response),
            });
        } catch (error) {
            Alert.alert('Upload failed', 'The picture could not be uploaded. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddPicture = () => {
        showActionSheetWithOptions({ options: ['Take photo', 'Choose from library', 'Cancel'], cancelButtonIndex: 2 }, (index) => {
            if (index === 0) pickFromCamera();
            if (index === 1) pickFromLibrary();
        });
    };

    const handleDateTimeConfirmed = (selected: Date) => {
        if (pickerMode === 'date') setDate(selected);
        if (pickerMode === 'time') setTime(selected);
        setPickerMode(undefined);
    };

    const handleSave = async () => {
        if (!isFormValid || !picture || !date || !time || !authenticationContext?.value) return;

        const newEvent: Event = {
            id: uuidv4(),
            name: name.trim(),
            description: about.trim(),
            dateTime: updateDateWithNewTime(date, time).toISOString(),
            imageUrl: picture.url,
            organizerId: authenticationContext.value.id,
            position: { latitude: position.latitude, longitude: position.longitude },
            volunteersNeeded: volunteersCount,
            volunteersIds: [],
        };

        setIsSaving(true);
        try {
            await createEvent(newEvent);
            navigation.navigate('EventsMap');
        } catch (error) {
            Alert.alert('Save failed', 'The event could not be saved. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <RectButton onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={24} color="#00A3FF" />
                </RectButton>
                <Text style={styles.headerTitle}>Add event</Text>
                <RectButton onPress={() => navigation.navigate('EventsMap')}>
                    <Feather name="x" size={24} color="#FF3B30" />
                </RectButton>
            </View>

            <ScrollView contentContainerStyle={styles.form}>
                <Text style={styles.label}>Event Name</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} />

                <View style={styles.labelRow}>
                    <Text style={styles.label}>About</Text>
                    <Text style={styles.hint}>{ABOUT_MAX_LENGTH} characters max</Text>
                </View>
                <TextInput
                    style={[styles.input, styles.multiline]}
                    value={about}
                    onChangeText={(text) => setAbout(text.slice(0, ABOUT_MAX_LENGTH))}
                    multiline
                />

                <Text style={styles.label}>Volunteers Needed</Text>
                <TextInput
                    style={styles.input}
                    value={volunteersNeeded}
                    onChangeText={(text) => setVolunteersNeeded(text.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                />

                <Text style={styles.label}>Date and Time</Text>
                <View style={styles.dateTimeRow}>
                    <RectButton style={[styles.input, styles.dateTimeInput]} onPress={() => setPickerMode('date')}>
                        <Text style={styles.dateTimeText}>{date ? date.toLocaleDateString('en-US') : 'Date'}</Text>
                    </RectButton>
                    <View style={styles.dateTimeSpacer} />
                    <RectButton style={[styles.input, styles.dateTimeInput]} onPress={() => setPickerMode('time')}>
                        <Text style={styles.dateTimeText}>
                            {time ? time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'Time'}
                        </Text>
                    </RectButton>
                </View>

                <Text style={styles.label}>Picture</Text>
                {picture ? (
                    <View style={styles.pictureRow}>
                        <Image source={{ uri: picture.uri }} style={styles.thumbnail} />
                        <View style={styles.pictureDetails}>
                            <Text style={styles.pictureName}>{picture.name}</Text>
                            <Text style={styles.hint}>{formatBytes(picture.size)}</Text>
                        </View>
                        <RectButton onPress={() => setPicture(undefined)}>
                            <Feather name="x" size={20} color="#FF3B30" />
                        </RectButton>
                    </View>
                ) : (
                    <RectButton style={styles.addPicture} onPress={handleAddPicture} enabled={!isUploading}>
                        {isUploading ? (
                            <ActivityIndicator color="#00A3FF" />
                        ) : (
                            <Feather name="plus" size={24} color="#00A3FF" />
                        )}
                    </RectButton>
                )}

                <View style={styles.saveButton}>
                    <BigButton
                        label="Save"
                        color="#00A3FF"
                        disabled={!isFormValid || isSaving}
                        onPress={handleSave}
                    />
                </View>
            </ScrollView>

            <DateTimePickerModal
                isVisible={!!pickerMode}
                mode={pickerMode ?? 'date'}
                date={(pickerMode === 'time' ? time : date) ?? new Date()}
                onConfirm={handleDateTimeConfirmed}
                onCancel={() => setPickerMode(undefined)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F3F5',
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 44,
        paddingBottom: 12,
        paddingHorizontal: 24,
        backgroundColor: '#FFF',
    },

    headerTitle: {
        fontFamily: 'Nunito_600SemiBold',
        color: '#8FA7B3',
        fontSize: 16,
    },

    form: {
        padding: 24,
    },

    label: {
        fontFamily: 'Nunito_700Bold',
        color: '#4D6F80',
        fontSize: 14,
        marginBottom: 6,
    },

    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },

    hint: {
        fontFamily: 'Nunito_600SemiBold',
        color: '#8FA7B3',
        fontSize: 12,
    },

    input: {
        backgroundColor: '#FFF',
        borderWidth: 1.4,
        borderColor: '#D3E2E5',
        borderRadius: 8,
        height: 48,
        paddingHorizontal: 16,
        marginBottom: 16,
        color: '#5C8599',
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 15,
    },

    multiline: {
        height: 100,
        paddingTop: 12,
        textAlignVertical: 'top',
    },

    dateTimeRow: {
        flexDirection: 'row',
    },

    dateTimeInput: {
        flex: 1,
        justifyContent: 'center',
    },

    dateTimeSpacer: {
        width: 12,
    },

    dateTimeText: {
        fontFamily: 'Nunito_600SemiBold',
        color: '#5C8599',
        fontSize: 15,
    },

    addPicture: {
        height: 80,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#00A3FF',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },

    pictureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: 8,
        marginBottom: 24,
    },

    thumbnail: {
        width: 56,
        height: 56,
        borderRadius: 8,
        marginRight: 12,
    },

    pictureDetails: {
        flex: 1,
    },

    pictureName: {
        fontFamily: 'Nunito_700Bold',
        color: '#4D6F80',
        fontSize: 14,
    },

    saveButton: {
        marginTop: 8,
    },
});
