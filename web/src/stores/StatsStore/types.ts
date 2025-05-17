export interface UserStat {
  userId: string;
  name: string;
  username: string;
  profilePicture?: string;
  department: string;
  graduationYear: string;
  loginCount: number;
  signupTime?: Date;
  loginTimes: Date[];
  logoutTimes: Date[];
  totalTimeSpent: number;
  totalLogins: number;
}

export interface UserStatsState {
  stats: UserStat[];
  loading: boolean;
  selectedDate: Date;
}

export interface UserStatsActions {
  fetchStats: (date: Date) => Promise<void>;
  setSelectedDate: (date: Date) => void;
}