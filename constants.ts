
import { TarotCardInfo } from './types';

export const THEME = {
  indigo: '#1a1a2e',
  deepPurple: '#16213e',
  mysticPurple: '#0f3460',
  gold: '#c5a059',
  etherealGold: '#f0d78c',
  glowPurple: '#7b2cbf',
};

export const GESTURE_THRESHOLDS = {
  FIST_HOLD_TIME: 500,
  WAVE_ANGLE_THRESHOLD: 10,
  FLIP_ANIMATION_DURATION: 800,
  SHUFFLE_FOLLOW_SMOOTHING: 0.15,
};

export const TAROT_DECK: TarotCardInfo[] = [
  { id: 0, name: "The Fool", image: "https://picsum.photos/id/10/400/600", description: "New beginnings, optimism, trust in life." },
  { id: 1, name: "The Magician", image: "https://picsum.photos/id/11/400/600", description: "Action, power, manifestation." },
  { id: 2, name: "The High Priestess", image: "https://picsum.photos/id/12/400/600", description: "Intuition, sacred knowledge, subconscious." },
  { id: 3, name: "The Empress", image: "https://picsum.photos/id/13/400/600", description: "Femininity, beauty, nature, abundance." },
  { id: 4, name: "The Emperor", image: "https://picsum.photos/id/14/400/600", description: "Authority, structure, a father figure." },
  { id: 5, name: "The Hierophant", image: "https://picsum.photos/id/15/400/600", description: "Spiritual wisdom, religious beliefs, tradition." },
  { id: 6, name: "The Lovers", image: "https://picsum.photos/id/16/400/600", description: "Love, harmony, relationships." },
  { id: 7, name: "The Chariot", image: "https://picsum.photos/id/17/400/600", description: "Control, willpower, success, action." },
  { id: 8, name: "Strength", image: "https://picsum.photos/id/18/400/600", description: "Strength, courage, persuasion, influence." },
  { id: 9, name: "The Hermit", image: "https://picsum.photos/id/19/400/600", description: "Soul-searching, introspection, being alone." },
  { id: 10, name: "Wheel of Fortune", image: "https://picsum.photos/id/20/400/600", description: "Good luck, karma, life cycles, destiny." },
  { id: 11, name: "Justice", image: "https://picsum.photos/id/21/400/600", description: "Justice, fairness, truth, cause and effect." },
  { id: 12, name: "The Hanged Man", image: "https://picsum.photos/id/22/400/600", description: "Pause, surrender, letting go, new perspectives." },
  { id: 13, name: "Death", image: "https://picsum.photos/id/23/400/600", description: "Endings, change, transformation, transition." },
  { id: 14, name: "Temperance", image: "https://picsum.photos/id/24/400/600", description: "Balance, moderation, patience, purpose." },
  { id: 15, name: "The Devil", image: "https://picsum.photos/id/25/400/600", description: "Shadow self, attachment, addiction, restriction." },
  { id: 16, name: "The Tower", image: "https://picsum.photos/id/26/400/600", description: "Sudden change, upheaval, chaos, revelation." },
  { id: 17, name: "The Star", image: "https://picsum.photos/id/27/400/600", description: "Hope, faith, purpose, renewal, spirituality." },
  { id: 18, name: "The Moon", image: "https://picsum.photos/id/28/400/600", description: "Illusion, fear, anxiety, subconscious, intuition." },
  { id: 19, name: "The Sun", image: "https://picsum.photos/id/29/400/600", description: "Positivity, fun, warmth, success, vitality." },
  { id: 20, name: "Judgement", image: "https://picsum.photos/id/30/400/600", description: "Judgement, rebirth, inner calling, absolution." },
  { id: 21, name: "The World", image: "https://picsum.photos/id/31/400/600", description: "Completion, integration, accomplishment, travel." },
];
