export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: 'guest' | 'user' | 'admin';
  reputation: number;
  joinedAt: Date;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  tags: string[];
  authorId: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
  votes: number;
  views: number;
  answers: Answer[];
  acceptedAnswerId?: string;
}

export interface Answer {
  id: string;
  content: string;
  questionId: string;
  authorId: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
  votes: number;
  isAccepted: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'answer' | 'comment' | 'mention' | 'accepted';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  questionId?: string;
  answerId?: string;
}

export interface Vote {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'question' | 'answer';
  value: 1 | -1;
}