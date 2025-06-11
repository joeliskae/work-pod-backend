export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Calendar {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
}

export interface Tablet {
  id: string;
  name: string;
  location: string;
  calendarId: string; 
  ipAddress: string;  
  // status: 'online' | 'offline' | 'unknown';
  // lastSeen: string;
}


export interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
}
