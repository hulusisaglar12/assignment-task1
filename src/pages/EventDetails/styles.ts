import { StyleSheet } from 'react-native';

export default StyleSheet.create({
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

    coverImage: {
        width: '100%',
        height: 220,
        backgroundColor: '#D3E2E5',
    },

    content: {
        padding: 24,
    },

    eventName: {
        fontFamily: 'Nunito_800ExtraBold',
        color: '#0B2D6B',
        fontSize: 22,
    },

    organizerLabel: {
        fontFamily: 'Nunito_600SemiBold',
        color: '#8FA7B3',
        fontSize: 13,
        marginTop: 2,
        marginBottom: 12,
    },

    eventDescription: {
        fontFamily: 'Nunito_600SemiBold',
        color: '#5C8599',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20,
    },

    statRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },

    statCard: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        backgroundColor: '#E6F6FF',
        borderColor: '#A6DDF9',
    },

    statCardSpacing: {
        width: 12,
    },

    statCardOpen: {
        backgroundColor: '#FFF6EC',
        borderColor: '#FFB95C',
    },

    statCardFull: {
        backgroundColor: '#E9EEF1',
        borderColor: '#D3E2E5',
    },

    statValue: {
        fontFamily: 'Nunito_800ExtraBold',
        color: '#0B2D6B',
        fontSize: 16,
        textAlign: 'center',
    },

    statValueOpen: {
        color: '#FF8700',
    },

    statValueMuted: {
        color: '#8FA7B3',
    },

    statCaption: {
        fontFamily: 'Nunito_600SemiBold',
        color: '#5C8599',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 2,
    },

    actionsRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },

    actionSpacing: {
        width: 8,
    },

    mapPreview: {
        height: 160,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
    },

    directionsButton: {
        marginBottom: 24,
    },
});
