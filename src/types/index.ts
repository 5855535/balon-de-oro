export type Role = 'admin' | 'voter';

export type Position = 'Portero' | 'Cierre' | 'Ala' | 'Pívot' | 'Jugador';

export type AwardCategory = 'ballon_dor' | 'guante_oro' | 'quinteto_ideal' | 'goleador';

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  role: Role;
  accessCode: string;
  hasVoted: boolean;
  votedAt?: string | null;
}

export interface Nominee {
  id: string;
  name: string;
  nickname?: string;
  team: string;
  position?: string;
  photoUrl?: string;
  description?: string;
  categories: AwardCategory[];
  hidden?: boolean;
}

export interface FormationSlot {
  label: string;
  roleName: string;
  topPct: string;
  leftPct: string;
}

export interface FutsalFormation {
  id: string;
  name: string;
  subtitle: string;
  slots: [FormationSlot, FormationSlot, FormationSlot, FormationSlot, FormationSlot];
}

export const FUTSAL_FORMATIONS: FutsalFormation[] = [
  {
    id: '1-2-1',
    name: '1-2-1 (El Rombo Clásico)',
    subtitle: '1 Portero, 1 Cierre, 2 Alas y 1 Pívot',
    slots: [
      { label: 'Portero', roleName: 'Guardameta', topPct: '84%', leftPct: '50%' },
      { label: 'Cierre', roleName: 'Último Hombre', topPct: '62%', leftPct: '50%' },
      { label: 'Ala Izq', roleName: 'Banda Izquierda', topPct: '42%', leftPct: '22%' },
      { label: 'Ala Der', roleName: 'Banda Derecha', topPct: '42%', leftPct: '78%' },
      { label: 'Pívot', roleName: 'Punta Definidor', topPct: '18%', leftPct: '50%' },
    ],
  },
  {
    id: '2-2',
    name: '2-2 (El Cuadrado)',
    subtitle: '1 Portero, 2 Cierres y 2 Atacantes',
    slots: [
      { label: 'Portero', roleName: 'Guardameta', topPct: '84%', leftPct: '50%' },
      { label: 'Defensa 1', roleName: 'Cierre Izquierdo', topPct: '60%', leftPct: '32%' },
      { label: 'Defensa 2', roleName: 'Cierre Derecho', topPct: '60%', leftPct: '68%' },
      { label: 'Delantero 1', roleName: 'Punta Izquierda', topPct: '25%', leftPct: '32%' },
      { label: 'Delantero 2', roleName: 'Punta Derecha', topPct: '25%', leftPct: '68%' },
    ],
  },
  {
    id: '1-1-2',
    name: '1-1-2 (La Y Ofensiva)',
    subtitle: '1 Portero, 1 Cierre, 1 Creador y 2 Puntas',
    slots: [
      { label: 'Portero', roleName: 'Guardameta', topPct: '84%', leftPct: '50%' },
      { label: 'Cierre', roleName: 'Base Defensiva', topPct: '65%', leftPct: '50%' },
      { label: 'Creador', roleName: 'Cerebro Central', topPct: '44%', leftPct: '50%' },
      { label: 'Punta 1', roleName: 'Extremo Ofensivo', topPct: '20%', leftPct: '26%' },
      { label: 'Punta 2', roleName: 'Extremo Ofensivo', topPct: '20%', leftPct: '74%' },
    ],
  },
  {
    id: '1-3-0',
    name: '1-3-0 (Cuatro en Línea / Rotación)',
    subtitle: '1 Portero, 3 Medios dinámicos y 1 Falso 9',
    slots: [
      { label: 'Portero', roleName: 'Guardameta', topPct: '84%', leftPct: '50%' },
      { label: 'Medio Izq', roleName: 'Ala / Rotación', topPct: '48%', leftPct: '20%' },
      { label: 'Medio Centro', roleName: 'Organizador', topPct: '54%', leftPct: '50%' },
      { label: 'Medio Der', roleName: 'Ala / Rotación', topPct: '48%', leftPct: '80%' },
      { label: 'Falso 9', roleName: 'Conector / Llegador', topPct: '24%', leftPct: '50%' },
    ],
  },
  {
    id: '2-1-1',
    name: '2-1-1 (Pirámide de Contención)',
    subtitle: '1 Portero, 2 Cierres firmes, 1 Conector y 1 Pívot',
    slots: [
      { label: 'Portero', roleName: 'Guardameta', topPct: '84%', leftPct: '50%' },
      { label: 'Cierre 1', roleName: 'Defensa Marcador', topPct: '62%', leftPct: '30%' },
      { label: 'Cierre 2', roleName: 'Defensa Marcador', topPct: '62%', leftPct: '70%' },
      { label: 'Medio', roleName: 'Equilibrio Central', topPct: '40%', leftPct: '50%' },
      { label: 'Pívot', roleName: 'Referencia de Gol', topPct: '18%', leftPct: '50%' },
    ],
  },
];

export interface QuintetoBallot {
  formationId: string;
  players: [string, string, string, string, string]; // 5 nominee IDs
}

export interface UserBallot {
  ballon_dor?: string[]; // IDs in ranking order: 1st (index 0) gets 15pts, etc.
  guante_oro?: string[]; // IDs in ranking order: 1st, 2nd, 3rd...
  quinteto_ideal?: QuintetoBallot;
  goleador?: string[];   // IDs in ranking order
}

export interface StoredVote {
  id: string;
  userId: string;
  categoryId: AwardCategory;
  ballot: any;
  createdAt: string;
}

export interface GalaSettings {
  votingOpen: boolean;
  revealedCategory: AwardCategory | null;
  title: string;
}

// Points system for Ballon d'Or top 10
export const BALLON_DOR_POINTS = [15, 12, 10, 8, 7, 5, 4, 3, 2, 1];
export const GUANTE_ORO_POINTS = [10, 7, 5, 3, 1];
export const GOLEADOR_POINTS = [15, 12, 10, 8, 5];

export interface CategoryInfo {
  id: AwardCategory;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  maxSelections?: number;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'ballon_dor',
    title: "Ballon d'Or",
    subtitle: 'Mejor Jugador de la Temporada',
    description: 'El máximo galardón individual del futsal. Toca a cada jugador para asignarle automáticamente su puesto en tu Top 10.',
    tag: 'PREMIO PRINCIPAL',
    maxSelections: 10,
  },
  {
    id: 'guante_oro',
    title: 'Guante de Oro',
    subtitle: 'Mejor Portero de la Temporada',
    description: 'Reconocimiento al guardián más decisivo. Toca 3 porteros para armar tu podio (1º, 2º y 3º).',
    tag: 'TROFEO YACHINE',
    maxSelections: 3,
  },
  {
    id: 'quinteto_ideal',
    title: 'Mejor Equipo',
    subtitle: 'Quinteto Ideal de Futsal',
    description: 'Elige tu esquema táctico favorito entre 5 formaciones y alinea a los 5 mejores jugadores de la temporada.',
    tag: 'DREAM TEAM',
    maxSelections: 5,
  },
  {
    id: 'goleador',
    title: 'Mejor Goleador',
    subtitle: 'Generador y Definidor Supremo',
    description: 'Toca 5 jugadores para ordenar a los artilleros que más ocasiones y goles generaron en la temporada.',
    tag: 'TROFEO GERD MÜLLER',
    maxSelections: 5,
  },
];
