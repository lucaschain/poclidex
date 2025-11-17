/**
 * Types for tracking loading progress across different phases
 */

export type LoadingPhase = 'pokemon' | 'sprite' | 'evolution' | 'abilities' | 'moves';
export type LoadingStatus = 'pending' | 'loading' | 'complete';

export interface LoadingPhaseInfo {
  phase: LoadingPhase;
  label: string;
  status: LoadingStatus;
}
