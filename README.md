# Intro Mobile Project

**Auteurs:** Natalia Kowal, Tiebe Vaes

## Beschrijving
Dit is ons project voor het vak Intro Mobile. We hebben een applicatie gebouwd voor (kart)racers. In de app kan je verschillende tracks bekijken, zelf racen aanmaken op deze circuits en een plekje reserveren om mee te doen. Daarnaast zit er voor elke race een chatroom bij in de app zodat de deelnemers met elkaar kunnen afspreken. Je kunt ook tracks en races raten, en uiteraard je eigen profiel beheren.

## Functionaliteiten
- Inloggen en registreren via Firebase Auth
- Overzicht van beschikbare tracks en bestaande races
- Zelf races aanmaken op een bepaalde track
- Spots reserveren voor een race
- Live chatrooms per race (om samen te communiceren)
- Profielbeheer
- Beoordelingssysteem (ratings)

## Gebruikte Technologieen
We hebben de app gebouwd met:

- **React Native & Expo:** Voor de mobiele app zelf.
- **Expo Router:** Voor navigatie tussen de schermen (dit gebruikt een file-based routing systeem in de app/ folder).
- **TypeScript:** Om het overzicht te bewaren en typefouten te verminderen.
- **Firebase:**
  - *Firestore* als database (voor de tracks, races, reserveringen en de live chats).
  - *Authentication* voor het aanmaken en inloggen van accounts.

## Belangrijke folders
Het project staat vooral in de reactproject/ map:
- app/: Bevat alle schermen (zoals index.tsx, profile.tsx) en de routing.
- components/: Onze herbruikbare UI componenten (zoals de BottomNav of SearchBar).
- services/: Alle functies die met Firebase of de backend communiceren, weggewerkt in aparte bestanden (zoals raceService.ts en userService.ts).

## Hoe start je het project?

1. Open de terminal in dit project en ga naar de reactproject map:
   ```bash
   cd reactproject
   ```
2. Installeer de packages:
   ```bash
   npm install
   ```
3. Start de development server:
   ```bash
   npx expo start
   ```
4. Gebruik de Expo Go app op je telefoon om de QR code te scannen, of druk op a / i om via een emulator te runnen.
