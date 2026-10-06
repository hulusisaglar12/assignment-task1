# Volunteam App

## Setting up the fake API (json-server)

Update the file `src/services/api.ts`.

Before running your 'json-server', get your computer's IP address and update your baseURL to `http://your_ip_address_here:3333` and then run:

```
npx json-server --watch db.json --port 3333 --host your_ip_address_here  -m ./node_modules/json-server-auth
```

To access your server online without running json-server locally, you can set your baseURL to:

```
https://my-json-server.typicode.com/<your-github-username>/<your-github-repo>
```

To use `my-json-server`, make sure your `db.json` is located at the repo root.

## Setting up the image upload API

Update the file `src/services/imageApi.ts`.

You can use any hosting service of your preference. In this case, we will use the freeimage.host API: https://freeimage.host/page/api.
Sign up for free at https://freeimage.host, get your API key and add it to the .env file in your root folder.

To run the app in your local environment, you will need to set the FREEIMAGE_API_KEY when starting the app using:

```
FREEIMAGE_API_KEY="insert_your_api_key_here" npx expo start
```

When creating your app build or publishing, import your secret values to EAS running:

```
eas secret:push
```

## Project 1.2 - Event details page

### Features
- The map loads and refits to the user's location and the upcoming events, and does so again each time the user returns to it.
- Each event marker turns grey when the team is full and blue when spots are open. Tapping a marker opens the event details screen, passing the event id as a route param.
- The details screen shows the event's date, time, description, and organizer, and a status box with three states: "Volunteered", "X of Y Volunteer(s) needed", or "Team is full".
- Call and Text appear only for events the user has joined. "Volunteer" appears only for open events the user hasn't joined. Share appears for open events and for joined events. "Get Directions to Event" is always shown and opens the device's maps app.

### Third-party libraries and bundle size
Every library below is either required by the assignment or already part of the starter project. Share and Linking are React Native built-ins, so they add no bundle size.

| Library | Why it's used | Bundle impact |
|---|---|---|
| `react-native-maps` | Map view, event markers, and fitting the map to coordinates (required by the assignment) | Large native module; unavoidable for the map |
| `expo-location` | Reads the user's position to include it in the map fit (already in the starter) | Small |
| `@react-navigation/native`, `@react-navigation/stack` | Navigation between screens and passing route params | Moderate; standard for stack navigation |
| `axios` | HTTP calls to the json-server API (already in the starter) | Small |
| `@expo/vector-icons` | Feather icons for the buttons and status box | Only the Feather glyph set is loaded |
| `expo-splash-screen` | Native splash screen, required by the newer Expo SDK | Small |
| `react-native-worklets` | Required peer dependency of `react-native-reanimated` | Small |

Upgrading to Expo SDK 57 added `expo-splash-screen`, `@expo/vector-icons` (no longer bundled with Expo), and `react-native-worklets`. No other new libraries were added for this assignment.

## Project 1.3 - Create event and data flows

### Data flows
1. **Consume data:** the map requests `GET /events` on load and every time it regains focus. A successful response is saved to AsyncStorage (`getFromNetworkFirst` in `src/services/caching.ts`). If the request fails, the app loads the last saved copy, so the map still works offline. Past events are hidden before display.
2. **Collect data:** the user picks a location by tapping the map (`SelectEventLocation`), then fills in the event form (`CreateEvent`). The form includes a camera or photo-library picker, which checks device permissions first.
3. **Send data:** the picture is uploaded to freeimage.host first, and the returned URL is stored with the event. Then the event is saved with `POST /events`, and the app returns to the map, which fetches the list again.

### Recommended improvements
- **Upload and save in one step.** If the picture upload succeeds but saving the event fails, the picture is left on the image host with no event pointing to it. A server-side endpoint could create the event and upload the image together.
- **Cache invalidation.** The cached event list can be stale until the next successful fetch. Adding the new event to the cached list right after saving would keep the offline view current.
- **Compress before upload.** The picker already reduces quality to 50%. Resizing images to a fixed maximum width would further reduce upload time and storage use.
- **Validate on the server.** Validation only runs in the app. The API should also reject events with missing fields or invalid dates.

### Setup for picture uploads
Image uploads need a free freeimage.host API key. Sign up at https://freeimage.host and copy your key, then start the app with:
```
FREEIMAGE_API_KEY="your_key_here" REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.64 npx expo start -c
```
