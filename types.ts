
import { Session, User } from '@supabase/supabase-js';

export enum UserRole {
  ADMIN = 'admin',
  DEPT_HEAD = 'department_head',
  TEACHER = 'teacher'
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department_id?: string;
}

export interface AppContextType {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  logout: () => void;
}

export interface Department {
  id: string;
  name: string;
  created_at: string;
}

export interface Teacher {
  id: string;
  full_name: string;
  employee_id: string;
  department_id: string;
  profile_id?: string;
  departments?: { name: string }; // For joins
}

export interface SchoolYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}

export interface Activity {
  id: string;
  name: string;
  date: string;
  description?: string;
  school_year_id: string;
}

export enum ParticipationStatus {
  ORGANIZER = 'organizer',
  ATTENDED = 'attended',
  LATE = 'late',
  LEFT_EARLY = 'left_early',
  ABSENT = 'absent'
}

export interface Participation {
  id?: string;
  teacher_id: string;
  activity_id: string;
  status: ParticipationStatus;
  notes?: string;
  teachers?: { full_name: string; departments: { name: string } }; // For joins
  activities?: { name: string; date: string }; // For joins
}
