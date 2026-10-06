# Kart Race App

Mobile app for kart racers, built by Natalia Kowal and Tiebe Vaes for the Intro Mobile course.

Browse tracks, set up your own races on a circuit and reserve a spot to join. Every race has its own chat room so participants can make arrangements. You can also rate tracks and races and manage your own profile.

## Features

- Sign in and register with Firebase Auth
- Overview of available tracks and existing races
- Create your own races on a track
- Reserve spots for a race
- Live chat room per race
- Profile management
- Ratings for tracks and races

## Tech stack

- **React Native and Expo** for the mobile app
- **Expo Router** for file-based navigation between screens (the `app/` folder)
- **TypeScript**
- **Firebase**: Firestore as database (tracks, races, reservations and live chats) and Authentication for accounts

## Project structure

The project lives in `reactproject/`:

- `app/`: all screens (such as `index.tsx` and `profile.tsx`) and the routing
- `components/`: reusable UI components (such as `BottomNav` and `SearchBar`)
- `services/`: all functions that talk to Firebase, split per domain (such as `raceService.ts` and `userService.ts`)

## Getting started

```bash
cd reactproject
npm install
npx expo start
```

Scan the QR code with the Expo Go app on your phone, or press `a` / `i` to run on an emulator.

## Authors

Natalia Kowal and Tiebe Vaes
