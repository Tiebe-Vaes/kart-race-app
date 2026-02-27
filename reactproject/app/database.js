import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('karting.db');

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      location TEXT,
      length TEXT,
      price_per_session REAL,
      price_unit TEXT,
      surface TEXT,
      indoor INTEGER,
      rental_karts INTEGER
    );

    CREATE TABLE IF NOT EXISTS track_features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      track_id INTEGER,
      feature TEXT,
      FOREIGN KEY (track_id) REFERENCES tracks(id)
    );

    CREATE TABLE IF NOT EXISTS drivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      display_name TEXT,
      level REAL
    );

    CREATE TABLE IF NOT EXISTS races (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      track_id INTEGER,
      title TEXT,
      date_time TEXT,
      skill_min REAL,
      skill_max REAL,
      min_drivers INTEGER,
      max_drivers INTEGER,
      type TEXT,
      entry_fee REAL,
      confirmed INTEGER,
      FOREIGN KEY (track_id) REFERENCES tracks(id)
    );

    CREATE TABLE IF NOT EXISTS race_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      race_id INTEGER,
      driver_id INTEGER,
      paid INTEGER,
      FOREIGN KEY (race_id) REFERENCES races(id),
      FOREIGN KEY (driver_id) REFERENCES drivers(id)
    );
  `);

  const trackColumns = db.getAllSync(`PRAGMA table_info(tracks)`);
  const hasPriceColumn = trackColumns.some(
    (column) => column.name === 'price_per_session'
  );
  const hasPriceUnitColumn = trackColumns.some(
    (column) => column.name === 'price_unit'
  );

  if (!hasPriceColumn) {
    db.execSync(`ALTER TABLE tracks ADD COLUMN price_per_session REAL DEFAULT 0`);
  }

  if (!hasPriceUnitColumn) {
    db.execSync(`ALTER TABLE tracks ADD COLUMN price_unit TEXT DEFAULT 'per 10 min'`);
  }
}

export default db;

export function getTracks() {
  const tracks = db.getAllSync('SELECT * FROM tracks');

  return tracks.map((track) => {
    const features = db.getAllSync(
      'SELECT feature FROM track_features WHERE track_id = ?',
      [track.id]
    );

    return {
      ...track,
      pricePerSession: track.price_per_session ?? 0,
      priceUnit: track.price_unit ?? 'per 10 min',
      indoor: track.indoor === 1,
      rentalKarts: track.rental_karts === 1,
      features: features.map((item) => item.feature),
    };
  });
}
export function addTrack(track) {
  const {
    name,
    location,
    length,
    pricePerSession,
    priceUnit,
    surface,
    indoor,
    rentalKarts,
    features,
  } = track;

  const result = db.runSync(
    `INSERT INTO tracks (name, location, length, price_per_session, price_unit, surface, indoor, rental_karts)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      location,
      length,
      pricePerSession,
      priceUnit,
      surface,
      indoor ? 1 : 0,
      rentalKarts ? 1 : 0,
    ]
  );

  const trackId = result.lastInsertRowId;

  features.forEach((feature) => {
    db.runSync(
      `INSERT INTO track_features (track_id, feature) VALUES (?, ?)`,
      [trackId, feature]
    );
  });
}

export function deleteTrack(id) {
  db.runSync('DELETE FROM track_features WHERE track_id = ?', [id]);
  db.runSync('DELETE FROM tracks WHERE id = ?', [id]);
}

export function getDrivers() {
  const drivers = db.getAllSync('SELECT * FROM drivers');

  return drivers.map((driver) => ({
    id: driver.id,
    displayName: driver.display_name,
    level: driver.level,
  }));
}

export function addDriver(driver) {
  const { displayName, level } = driver;

  const result = db.runSync(
    `INSERT INTO drivers (display_name, level)
     VALUES (?, ?)`,
    [displayName, level]
  );

  return result.lastInsertRowId;
}

export function getRaces() {
  const races = db.getAllSync('SELECT * FROM races ORDER BY date_time ASC');

  return races.map((race) => ({
    id: race.id,
    trackId: race.track_id,
    title: race.title,
    dateTime: race.date_time,
    skillMin: race.skill_min,
    skillMax: race.skill_max,
    minDrivers: race.min_drivers,
    maxDrivers: race.max_drivers,
    type: race.type,
    entryFee: race.entry_fee,
    confirmed: race.confirmed === 1,
  }));
}

export function addRace(race) {
  const {
    trackId,
    title,
    dateTime,
    skillMin,
    skillMax,
    minDrivers,
    maxDrivers,
    type,
    entryFee,
    confirmed,
  } = race;

  const result = db.runSync(
    `INSERT INTO races (
      track_id, title, date_time, skill_min, skill_max,
      min_drivers, max_drivers, type, entry_fee, confirmed
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      trackId,
      title,
      dateTime,
      skillMin,
      skillMax,
      minDrivers,
      maxDrivers,
      type,
      entryFee,
      confirmed ? 1 : 0,
    ]
  );

  return result.lastInsertRowId;
}

export function getRaceParticipants() {
  const participants = db.getAllSync('SELECT * FROM race_participants');

  return participants.map((participant) => ({
    id: participant.id,
    raceId: participant.race_id,
    driverId: participant.driver_id,
    paid: participant.paid === 1,
  }));
}

export function addRaceParticipant(participant) {
  const { raceId, driverId, paid } = participant;

  const result = db.runSync(
    `INSERT INTO race_participants (race_id, driver_id, paid)
     VALUES (?, ?, ?)`,
    [raceId, driverId, paid ? 1 : 0]
  );

  return result.lastInsertRowId;
}

export function ensureKartingSeedData() {
  const existingTracks = getTracks();

  if (existingTracks.length === 0) {
    [
      {
        name: 'Worldkarts Kortrijk',
        location: 'Kortrijk',
        length: '520m',
        pricePerSession: 32,
        priceUnit: 'per 10 min',
        surface: 'indoor',
        indoor: true,
        rentalKarts: true,
        features: ['timing', 'kids', 'events'],
      },
      {
        name: 'Eupen Karting',
        location: 'Eupen',
        length: '1.1km',
        pricePerSession: 45,
        priceUnit: 'per 15 min',
        surface: 'outdoor',
        indoor: false,
        rentalKarts: true,
        features: ['league', 'night racing'],
      },
      {
        name: 'Inkart Puurs',
        location: 'Puurs',
        length: '800m',
        pricePerSession: 36,
        priceUnit: 'per 10 min',
        surface: 'indoor',
        indoor: true,
        rentalKarts: true,
        features: ['corporate', 'electric karts'],
      },
      {
        name: 'Karting Genk',
        location: 'Genk',
        length: '1.3km',
        pricePerSession: 52,
        priceUnit: 'per 20 min',
        surface: 'outdoor',
        indoor: false,
        rentalKarts: false,
        features: ['pro track', 'championships'],
      },
    ].forEach((track) => addTrack(track));
  }

  db.execSync(`
    UPDATE tracks SET price_per_session = 32 WHERE name = 'Worldkarts Kortrijk' AND (price_per_session IS NULL OR price_per_session = 0);
    UPDATE tracks SET price_per_session = 45 WHERE name = 'Eupen Karting' AND (price_per_session IS NULL OR price_per_session = 0);
    UPDATE tracks SET price_per_session = 36 WHERE name = 'Inkart Puurs' AND (price_per_session IS NULL OR price_per_session = 0);
    UPDATE tracks SET price_per_session = 52 WHERE name = 'Karting Genk' AND (price_per_session IS NULL OR price_per_session = 0);
    UPDATE tracks SET price_unit = 'per 10 min' WHERE name = 'Worldkarts Kortrijk' AND (price_unit IS NULL OR price_unit = '');
    UPDATE tracks SET price_unit = 'per 15 min' WHERE name = 'Eupen Karting' AND (price_unit IS NULL OR price_unit = '');
    UPDATE tracks SET price_unit = 'per 10 min' WHERE name = 'Inkart Puurs' AND (price_unit IS NULL OR price_unit = '');
    UPDATE tracks SET price_unit = 'per 20 min' WHERE name = 'Karting Genk' AND (price_unit IS NULL OR price_unit = '');
  `);

  const allTracks = getTracks();
  const existingDrivers = getDrivers();

  if (existingDrivers.length === 0) {
    [
      { displayName: 'Noah', level: 3.5 },
      { displayName: 'Liam', level: 4.0 },
      { displayName: 'Emma', level: 3.8 },
      { displayName: 'Mila', level: 4.2 },
    ].forEach((driver) => addDriver(driver));
  }

  const allDrivers = getDrivers();
  const existingRaces = getRaces();

  if (existingRaces.length === 0 && allTracks.length > 0) {
    const worldkartsId = allTracks.find(
      (track) => track.name === 'Worldkarts Kortrijk'
    )?.id;
    const genkId = allTracks.find((track) => track.name === 'Karting Genk')?.id;

    if (worldkartsId) {
      addRace({
        trackId: worldkartsId,
        title: 'Friday Sprint Session',
        dateTime: '2026-03-20 19:30',
        skillMin: 3,
        skillMax: 5,
        minDrivers: 4,
        maxDrivers: 8,
        type: 'competitief',
        entryFee: 35,
        confirmed: true,
      });
    }

    if (genkId) {
      addRace({
        trackId: genkId,
        title: 'Sunday Fun Race',
        dateTime: '2026-03-22 14:00',
        skillMin: 2,
        skillMax: 4,
        minDrivers: 4,
        maxDrivers: 10,
        type: 'recreatief',
        entryFee: 28,
        confirmed: false,
      });
    }
  }

  const allRaces = getRaces();
  const existingParticipants = getRaceParticipants();

  if (
    existingParticipants.length === 0 &&
    allRaces.length > 0 &&
    allDrivers.length > 0
  ) {
    const race = allRaces[0];

    allDrivers.slice(0, 4).forEach((driver, index) => {
      if (race.id && driver.id) {
        addRaceParticipant({
          raceId: race.id,
          driverId: driver.id,
          paid: index < 3,
        });
      }
    });
  }
}