export interface Announcement {
  id: number;
  title: string;
  date: string;
  category: string;
  description: string;
}

export interface LeaveRequest {
  id: number;
  employee: string;
  type: string;
  from: string;
  to: string;
  days: number;
  status: 'Approved' | 'Pending' | 'Declined';
}

export interface Employee {
  id: number;
  name: string;
  role: string;
  department: string;
  email: string;
}

export interface Policy {
  id: number;
  title: string;
  summary: string;
  content: string;
  updated: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
