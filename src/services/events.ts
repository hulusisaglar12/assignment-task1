import api from './api';
import { Event } from '../types/Event';
import { User } from '../types/User';

export const getEvents = async (): Promise<Event[]> => {
    const response = await api.get<Event[]>('/events');
    return response.data;
};

export const getEventDetails = async (id: string): Promise<Event> => {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
};

export const getUserDetails = async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
};

export const joinEvent = async (eventId: string, volunteersIds: string[]): Promise<Event> => {
    const response = await api.patch<Event>(`/events/${eventId}`, { volunteersIds });
    return response.data;
};

export const createEvent = async (newEvent: Event): Promise<Event> => {
    const response = await api.post<Event>('/events', newEvent);
    return response.data;
};
