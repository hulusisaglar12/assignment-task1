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

You can use any hosting service of your preference. In this case, we will use ImgBB API: https://api.imgbb.com/.
Sign up for free at https://imgbb.com/signup, get your API key and add it to the .env file in your root folder.

To run the app in your local environment, you will need to set the IMGBB_API_KEY when starting the app using:

```
IMGBB_API_KEY="insert_your_api_key_here" npx expo start
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
