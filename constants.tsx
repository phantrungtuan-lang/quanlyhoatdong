
import { ParticipationStatus } from './types';

export const PARTICIPATION_STATUSES: Record<ParticipationStatus, { label: string; color: string; bgColor: string }> = {
  [ParticipationStatus.ORGANIZER]: { label: 'Tham gia tổ chức', color: 'text-purple-800', bgColor: 'bg-purple-100' },
  [ParticipationStatus.ATTENDED]: { label: 'Tham gia', color: 'text-green-800', bgColor: 'bg-green-100' },
  [ParticipationStatus.LATE]: { label: 'Tham gia muộn', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
  [ParticipationStatus.LEFT_EARLY]: { label: 'Vắng giữa hoạt động', color: 'text-orange-800', bgColor: 'bg-orange-100' },
  [ParticipationStatus.ABSENT]: { label: 'Vắng', color: 'text-red-800', bgColor: 'bg-red-100' },
};
