import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import * as Location from 'expo-location';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { LatLng, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import * as MapSettings from '../constants/MapSettings';
import { AuthenticationContext } from '../context/AuthenticationContext';
import mapMarkerImg from '../images/map-marker.png';
import mapMarkerGreyImg from '../images/map-marker-grey.png';
import { getFromNetworkFirst } from '../services/caching';
import { getEvents } from '../services/events';
import { Event } from '../types/Event';
import { getEventStatus } from '../utils/eventStatus';
import { RootStackParamList } from '../routes/AppStack';

type Props = StackScreenProps<RootStackParamList, 'EventsMap'>;

export default function EventsMap({ navigation }: Props) {
    const authenticationContext = useContext(AuthenticationContext);
    const mapViewRef = useRef<MapView>(null);
    const isFocused = useIsFocused();

    const [events, setEvents] = useState<Event[]>([]);
    const [userLocation, setUserLocation] = useState<LatLng>();

    useEffect(() => {
        if (!isFocused) return;

        // Fetch from the API when online and cache the result; fall back to the cached copy when offline.
        getFromNetworkFirst<Event[]>('events', getEvents())
            .then((allEvents) => {
                const now = new Date();
                setEvents(allEvents.filter((event) => new Date(event.dateTime) >= now));
            })
            .catch((error) => console.log('No events from network or cache:', error));

        Location.requestForegroundPermissionsAsync()
            .then(({ status }) => {
                if (status !== 'granted') return;
                return Location.getCurrentPositionAsync();
            })
            .then((position) => {
                if (position) {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                }
            })
            .catch((error) => console.log(error));
    }, [isFocused]);

    useEffect(() => {
        if (events.length === 0) return;

        const coordinates: LatLng[] = events.map(({ position }) => position);
        if (userLocation) coordinates.push(userLocation);

        mapViewRef.current?.fitToCoordinates(coordinates, { edgePadding: MapSettings.EDGE_PADDING });
    }, [events, userLocation]);

    const handleNavigateToCreateEvent = () => {
        navigation.navigate('SelectEventLocation');
    };

    const handleNavigateToEventDetails = (event: Event) => {
        navigation.navigate('EventDetails', { id: event.id });
    };

    const handleLogout = async () => {
        AsyncStorage.multiRemove(['userInfo', 'accessToken']).then(() => {
            authenticationContext?.setValue(undefined);
            navigation.navigate('Login');
        });
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapViewRef}
                provider={PROVIDER_GOOGLE}
                initialRegion={MapSettings.DEFAULT_REGION}
                style={styles.mapStyle}
                customMapStyle={customMapStyle}
                showsMyLocationButton={false}
                showsUserLocation={true}
                rotateEnabled={false}
                toolbarEnabled={false}
                moveOnMarkerPress={false}
                mapPadding={MapSettings.EDGE_PADDING}
            >
                {events.map((event) => {
                    const { isFull } = getEventStatus(event, authenticationContext?.value?.id);

                    return (
                        <Marker
                            key={event.id}
                            coordinate={{
                                latitude: event.position.latitude,
                                longitude: event.position.longitude,
                            }}
                            onPress={() => handleNavigateToEventDetails(event)}
                        >
                            <Image
                                resizeMode="contain"
                                style={{ width: 48, height: 54 }}
                                source={isFull ? mapMarkerGreyImg : mapMarkerImg}
                            />
                        </Marker>
                    );
                })}
            </MapView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>{events.length} event(s) found</Text>
                <RectButton
                    style={[styles.smallButton, { backgroundColor: '#00A3FF' }]}
                    onPress={handleNavigateToCreateEvent}
                >
                    <Feather name="plus" size={20} color="#FFF" />
                </RectButton>
            </View>
            <RectButton
                style={[styles.logoutButton, styles.smallButton, { backgroundColor: '#4D6F80' }]}
                onPress={handleLogout}
            >
                <Feather name="log-out" size={20} color="#FFF" />
            </RectButton>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },

    mapStyle: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },

    logoutButton: {
        position: 'absolute',
        top: 70,
        right: 24,

        elevation: 3,
    },

    footer: {
        position: 'absolute',
        left: 24,
        right: 24,
        bottom: 40,

        backgroundColor: '#FFF',
        borderRadius: 16,
        height: 56,
        paddingLeft: 24,

        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        elevation: 3,
    },

    footerText: {
        fontFamily: 'Nunito_700Bold',
        color: '#8fa7b3',
    },

    smallButton: {
        width: 56,
        height: 56,
        borderRadius: 16,

        justifyContent: 'center',
        alignItems: 'center',
    },
});
