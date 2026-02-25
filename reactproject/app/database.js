import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('padel.db');

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS wedstrijden (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      range TEXT,
      niveau TEXT,
      datum TEXT,
      club TEXT,
      gemengd INTEGER,
      competitie INTEGER
    );

    CREATE TABLE IF NOT EXISTS spelers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wedstrijd_id INTEGER,
      handle TEXT,
      level INTEGER,
      FOREIGN KEY (wedstrijd_id) REFERENCES wedstrijden(id)
    );
  `);
}

export default db;


// Alle wedstrijden ophalen (met spelers)
export function getCompetitions() {
  const wedstrijden = db.getAllSync('SELECT * FROM wedstrijden');

  return wedstrijden.map(w => {
    const spelers = db.getAllSync(
      'SELECT * FROM spelers WHERE wedstrijd_id = ?', [w.id]
    );
    return {
      ...w,
      gemengd: w.gemengd === 1,
      competitie: w.competitie === 1,
      spelers
    };
  });
}
export function addCompetition(wedstrijd) {
  const { range, niveau, datum, club, gemengd, competitie, spelers } = wedstrijd;

  const result = db.runSync(
    `INSERT INTO wedstrijden (range, niveau, datum, club, gemengd, competitie)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [range, niveau, datum, club, gemengd ? 1 : 0, competitie ? 1 : 0]
  );

  const wedstrijdId = result.lastInsertRowId;

  // Spelers koppelen
  spelers.forEach(speler => {
    db.runSync(
      `INSERT INTO spelers (wedstrijd_id, handle, level) VALUES (?, ?, ?)`,
      [wedstrijdId, speler.handle, speler.level]
    );
  });
}

// Wedstrijd verwijderen
export function deleteCompetition(id) {
  db.runSync('DELETE FROM spelers WHERE wedstrijd_id = ?', [id]);
  db.runSync('DELETE FROM wedstrijden WHERE id = ?', [id]);
}