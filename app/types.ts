export const MOVEMENT_STATES = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
} as const;

export type MovementState = typeof MOVEMENT_STATES[keyof typeof MOVEMENT_STATES];
