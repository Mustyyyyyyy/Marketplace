// Centralized task state machine. Single source of truth.
import { TaskStatus } from '@prisma/client';
import { HttpError } from '../errors';

const transitions: Record<TaskStatus, TaskStatus[]> = {
  DRAFT: ['PUBLISHED', 'CANCELLED'],
  PUBLISHED: ['RECEIVING_OFFERS', 'CANCELLED', 'EXPIRED'],
  RECEIVING_OFFERS: ['OFFER_SELECTED', 'CANCELLED', 'EXPIRED'],
  OFFER_SELECTED: ['ACCEPTED', 'IN_PROGRESS', 'CANCELLED'],
  ACCEPTED: ['IN_PROGRESS', 'CANCELLED', 'DISPUTED'],
  IN_PROGRESS: ['SUBMITTED', 'DISPUTED', 'CANCELLED'],
  SUBMITTED: ['CUSTOMER_REVIEW', 'DISPUTED'],
  CUSTOMER_REVIEW: ['COMPLETED', 'DISPUTED'],
  COMPLETED: [],
  CANCELLED: [],
  EXPIRED: [],
  DISPUTED: ['COMPLETED', 'CANCELLED'],
  SUSPENDED: ['PUBLISHED', 'CANCELLED'],
};

export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  return transitions[from]?.includes(to) ?? false;
}

export function assertTransition(from: TaskStatus, to: TaskStatus) {
  if (!canTransition(from, to)) {
    throw new HttpError(400, `Invalid task transition ${from} -> ${to}`);
  }
}