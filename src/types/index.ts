export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'external' | 'superadmin';
  employeeId?: string | null;
  department?: string | null;
  company?: string | null;
  accessibleProjects?: string[];
  accessibleBrands?: string[];
  hasPendingInvitation?: boolean;
  invitedBy?: string;
  isEmailVerified?: boolean;
  createdAt?: string;
}

export interface Brand {
  _id: string;
  name: string;
  description?: string;
  company?: string;
  department?: string;
  status?: 'active' | 'inactive';
  members?: User[];
  createdBy?: string | User;
  projectCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  brandId: string;
  brand?: Brand;
  progress?: number;
  status?: 'active' | 'completed' | 'on-hold';
  startDate?: string;
  endDate?: string;
  tasks?: Task[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  projectId: string;
  project?: Project;
  assignedTo?: string | User; // Can be string ID or populated User object
  assignedUser?: User;
  createdBy?: string | User; // Can be string ID or populated User object
  createdByUser?: User;
  status: 'pending' | 'in-progress' | 'on-hold' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  isRecurring?: boolean;
  recurrence?: 'daily' | 'weekly' | 'monthly';
  comments?: Comment[];
  links?: string[];
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Comment {
  _id: string;
  text: string;
  userId: string;
  user?: User;
  createdAt: string;
}

export interface DashboardStats {
  totalBrands: number;
  totalProjects: number;
  totalTasks: number;
  tasksByStatus: {
    pending: number;
    'in-progress': number;
    'on-hold': number;
    completed: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

