export interface Player {
    handle: string,
    level: number
}
export interface Competition {
    id?: number;
    range: string;
    niveau: string;
    datum: string;
    club: string;
    gemengd: boolean;
    competitie: boolean;
    spelers: Player[];
}