import axios, { AxiosResponse } from 'axios';
import { getFromCache } from './caching';

const api = axios.create({
    // Before running your 'json-server', get your computer's IP address and
    // update your baseURL to `http://your_ip_address_here:3333` and then run:
    // `npx json-server --watch db.json --port 3333 --host your_ip_address_here`
    //
    // To access your server online without running json-server locally,
    // you can set your baseURL to:
    // `https://my-json-server.typicode.com/<your-github-username>/<your-github-repo>`
    //
    // To use `my-json-server`, make sure your `db.json` is located at the repo root.

    baseURL: 'http://192.168.1.64:3333',
});

// `json-server-auth` only enforces write permissions when a routes/rules
// file is supplied (none is configured in this project yet), but attach the
// cached access token whenever one is available so requests are already
// correctly authenticated if/when that protection is added.
api.interceptors.request.use(async (config) => {
    try {
        const accessToken = await getFromCache<string>('accessToken');
        if (accessToken) {
            config.headers = { ...config.headers, Authorization: `Bearer ${accessToken}` };
        }
    } catch {
        // No cached token yet (e.g. before login) — proceed unauthenticated.
    }
    return config;
});

export const authenticateUser = (email: string, password: string): Promise<AxiosResponse> => {
    return api.post(`/login`, { email, password });
};

export default api;
