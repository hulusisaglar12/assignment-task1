import axios, { AxiosResponse } from 'axios';
import { getEnvironentVariable } from '../utils';

// Pictures are uploaded to freeimage.host, a free image hosting service
// (https://freeimage.host/page/api). The upload returns a public URL that is
// stored with the event.
//
// Get a free API key by signing up at https://freeimage.host, then set
// FREEIMAGE_API_KEY when starting the app:
// 'FREEIMAGE_API_KEY="insert_your_api_key_here" npx expo start'
//
// When creating your app build or publishing, do not forget to run 'eas secret:push' command
// to import your secret values to EAS.

const UPLOAD_URL = 'https://freeimage.host/api/1/upload/';

export const uploadImage = (imageBase64: string): Promise<AxiosResponse> => {
    const data = new FormData();
    data.append('key', getEnvironentVariable('FREEIMAGE_API_KEY') as string);
    data.append('action', 'upload');
    data.append('source', imageBase64);

    return axios.post(UPLOAD_URL, data);
};

export const getUploadedImageUrl = (response: AxiosResponse): string => response.data.image.url;
