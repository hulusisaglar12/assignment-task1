import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { LatLng, Marker } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import BigButton from '../components/BigButton';
import * as MapSettings from '../constants/MapSettings';
import mapMarkerImg from '../images/map-marker.png';
import { RootStackParamList } from '../routes/AppStack';

type Props = StackScreenProps<RootStackParamList, 'SelectEventLocation'>;

export default function SelectEventLocation({ navigation }: Props) {
    const [selectedPosition, setSelectedPosition] = useState<LatLng>();

    const handleNext = () => {
        if (selectedPosition) navigation.navigate('CreateEvent', { position: selectedPosition });
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

            <MapView
                style={styles.map}
                initialRegion={MapSettings.DEFAULT_REGION}
                customMapStyle={customMapStyle}
                showsUserLocation={true}
                rotateEnabled={false}
                toolbarEnabled={false}
                onPress={(event) => setSelectedPosition(event.nativeEvent.coordinate)}
            >
                {selectedPosition && (
                    <Marker coordinate={selectedPosition}>
                        <Image resizeMode="contain" style={{ width: 48, height: 54 }} source={mapMarkerImg} />
                    </Marker>
                )}
            </MapView>

            <View style={styles.footer}>
                <Text style={styles.hint}>
                    {selectedPosition ? 'Location added' : 'Touch the map to set the event location'}
                </Text>
                <BigButton label="Next" color="#00A3FF" disabled={!selectedPosition} onPress={handleNext} />
            </View>
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

    map: {
        flex: 1,
    },

    footer: {
        padding: 24,
        backgroundColor: '#FFF',
    },

    hint: {
        fontFamily: 'Nunito_600SemiBold',
        color: '#5C8599',
        fontSize: 14,
        marginBottom: 12,
        textAlign: 'center',
    },
});
