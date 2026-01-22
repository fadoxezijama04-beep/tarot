
export enum GestureState {
  IDLE = 'IDLE',           // Fist: Stacked
  SHUFFLING = 'SHUFFLING', // Open Palm: Spread
  SELECTING = 'SELECTING', // Pointing: Picking one
  REVEALING = 'REVEALING', // Waving: Flipped
}

export interface HandData {
  landmarks: { x: number; y: number; z: number }[];
  gesture: 'FIST' | 'OPEN' | 'POINTING' | 'WAVING' | 'UNKNOWN';
  x: number; // Normalized center X
  y: number; // Normalized center Y
  velocity: { x: number; y: number };
}

export interface TarotCardInfo {
  id: number;
  name: string;
  image: string;
  description: string;
}
