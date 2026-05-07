export interface UserStats {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  studyHours: number;
  socialMediaMinutes: number;
  petHealth: number;
  xp: number;
  level: number;
  inventory: string[];
  achievements: string[];
  isAdmin: boolean;
  hasCompletedTutorial?: boolean;
  coins: number;
  potions: {
    health: number;
    mana: number; // For future magic/focus features
  };
  createdAt: any;
  updatedAt: any;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirementType: 'study' | 'health' | 'social';
  requirementValue: number;
}

export interface Reward {
  id: string;
  name: string;
  type: 'cosmetic' | 'badge';
  image: string;
}
