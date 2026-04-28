export interface AttendanceStats {
  courseId: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
  warning: boolean;
}
