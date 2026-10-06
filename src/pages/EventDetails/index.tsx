import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, Share, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { Marker } from 'react-native-maps';
import BigButton from '../../components/BigButton';
import { AuthenticationContext } from '../../context/AuthenticationContext';
import mapMarkerImg from '../../images/map-marker.png';
import { RootStackParamList } from '../../routes/AppStack';
import { getEventDetails, getUserDetails, joinEvent } from '../../services/events';
import { Event } from '../../types/Event';
import { User } from '../../types/User';
import { formatAMPM, getMapsUrl } from '../../utils';
import { getEventStatus } from '../../utils/eventStatus';
import styles from './styles';

type Props = StackScreenProps<RootStackParamList, 'EventDetails'>;

export default function EventDetails({ route, navigation }: Props) {
    const { id } = route.params;
    const authenticationContext = useContext(AuthenticationContext);
    const currentUser = authenticationContext?.value;

    const [event, setEvent] = useState<Event>();
    const [organizer, setOrganizer] = useState<User>();
    const [isJoining, setIsJoining] = useState(false);

    useEffect(() => {
        getEventDetails(id)
            .then((fetchedEvent) => {
                setEvent(fetchedEvent);
                return getUserDetails(fetchedEvent.organizerId);
            })
            .then(setOrganizer)
            .catch((error) => console.log(error));
    }, [id]);

    if (!event || !organizer) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#00A3FF" />
            </View>
        );
    }

    const { isFull, hasVolunteered } = getEventStatus(event, currentUser?.id);
    const eventDate = new Date(event.dateTime);
    const formattedDate = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const formattedTime = formatAMPM(eventDate).toUpperCase();

    const handleJoinEvent = () => {
        if (!currentUser) return;
        setIsJoining(true);
        joinEvent(event.id, [...event.volunteersIds, currentUser.id])
            .then(setEvent)
            .catch((error) => console.log(error))
            .finally(() => setIsJoining(false));
    };

    const handleCall = () => Linking.openURL(`tel:${organizer.mobile}`);
    const handleText = () => Linking.openURL(`sms:${organizer.mobile}`);
    const handleGetDirections = () => Linking.openURL(getMapsUrl(event.position));
    const handleShare = () =>
        Share.share({
            title: event.name,
            message: `${event.name}\n\n${event.description}`,
        });

    const canVolunteer = !isFull && !hasVolunteered;
    const canShare = !isFull || hasVolunteered;

    const statCardStyle = hasVolunteered
        ? styles.statCard
        : isFull
        ? [styles.statCard, styles.statCardFull]
        : [styles.statCard, styles.statCardOpen];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <RectButton onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={24} color="#00A3FF" />
                </RectButton>
                <Text style={styles.headerTitle}>Event</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView>
                {event.imageUrl ? (
                    <Image style={styles.coverImage} source={{ uri: event.imageUrl }} />
                ) : (
                    <View style={styles.coverImage} />
                )}

                <View style={styles.content}>
                    <Text style={styles.eventName}>{event.name}</Text>
                    <Text style={styles.organizerLabel}>
                        organized by {organizer.name.first} {organizer.name.last}
                    </Text>
                    <Text style={styles.eventDescription}>{event.description}</Text>

                    <View style={styles.statRow}>
                        <View style={[styles.statCard, { flex: 1 }]}>
                            <Feather name="calendar" size={24} color="#00A3FF" />
                            <Text style={styles.statCaption}>{formattedDate}</Text>
                            <Text style={styles.statCaption}>{formattedTime}</Text>
                        </View>
                        <View style={styles.statCardSpacing} />
                        <View style={[statCardStyle, { flex: 1 }]}>
                            {hasVolunteered && (
                                <>
                                    <Feather name="check" size={24} color="#00A3FF" />
                                    <Text style={styles.statCaption}>Volunteered</Text>
                                </>
                            )}
                            {!hasVolunteered && isFull && (
                                <>
                                    <Feather name="slash" size={24} color="#8FA7B3" />
                                    <Text style={[styles.statCaption, styles.statValueMuted]}>Team is full</Text>
                                </>
                            )}
                            {canVolunteer && (
                                <>
                                    <Text style={[styles.statValue, styles.statValueOpen]}>
                                        {event.volunteersIds.length} of {event.volunteersNeeded}
                                    </Text>
                                    <Text style={styles.statCaption}>Volunteer(s) needed</Text>
                                </>
                            )}
                        </View>
                    </View>

                    <View style={styles.actionsRow}>
                        {canShare && (
                            <BigButton label="Share" color="#00A3FF" featherIconName="share-2" onPress={handleShare} />
                        )}
                        {hasVolunteered && (
                            <>
                                <View style={styles.actionSpacing} />
                                <BigButton label="Call" color="#00A3FF" featherIconName="phone" onPress={handleCall} />
                                <View style={styles.actionSpacing} />
                                <BigButton
                                    label="Text"
                                    color="#00A3FF"
                                    featherIconName="message-circle"
                                    onPress={handleText}
                                />
                            </>
                        )}
                        {canVolunteer && (
                            <>
                                <View style={styles.actionSpacing} />
                                <BigButton
                                    label="Volunteer"
                                    color="#FF8700"
                                    featherIconName="plus"
                                    disabled={isJoining}
                                    onPress={handleJoinEvent}
                                />
                            </>
                        )}
                    </View>

                    <View style={styles.mapPreview}>
                        <MapView
                            style={{ flex: 1 }}
                            initialRegion={{
                                latitude: event.position.latitude,
                                longitude: event.position.longitude,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                            scrollEnabled={false}
                            zoomEnabled={false}
                            rotateEnabled={false}
                            pitchEnabled={false}
                            toolbarEnabled={false}
                        >
                            <Marker
                                coordinate={{
                                    latitude: event.position.latitude,
                                    longitude: event.position.longitude,
                                }}
                            >
                                <Image resizeMode="contain" style={{ width: 48, height: 54 }} source={mapMarkerImg} />
                            </Marker>
                        </MapView>
                    </View>

                    <BigButton
                        label="Get Directions to Event"
                        color="#4D6F80"
                        featherIconName="map-pin"
                        style={styles.directionsButton}
                        onPress={handleGetDirections}
                    />
                </View>
            </ScrollView>
        </View>
    );
}
