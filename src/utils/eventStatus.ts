import { Event } from '../types/Event';

export interface EventStatus {
    isFull: boolean;
    hasVolunteered: boolean;
}

export const getEventStatus = (event: Event, currentUserId?: string): EventStatus => {
    const isFull = event.volunteersIds.length >= event.volunteersNeeded;
    const hasVolunteered = !!currentUserId && event.volunteersIds.includes(currentUserId);

    return { isFull, hasVolunteered };
};
