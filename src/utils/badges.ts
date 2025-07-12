export interface Badge {
  name: string;
  description: string;
  color: string;
  icon: string;
  requirement: number;
}

export const badges: Badge[] = [
  {
    name: 'Newcomer',
    description: 'Welcome to the community!',
    color: 'bg-gray-500',
    icon: '🌱',
    requirement: 0
  },
  {
    name: 'Helper',
    description: 'Answered 5 questions',
    color: 'bg-green-500',
    icon: '🤝',
    requirement: 5
  },
  {
    name: 'Contributor',
    description: 'Answered 15 questions',
    color: 'bg-blue-500',
    icon: '💡',
    requirement: 15
  },
  {
    name: 'Expert',
    description: 'Answered 30 questions',
    color: 'bg-purple-500',
    icon: '🎯',
    requirement: 30
  },
  {
    name: 'Master',
    description: 'Answered 50 questions',
    color: 'bg-yellow-500',
    icon: '👑',
    requirement: 50
  },
  {
    name: 'Legend',
    description: 'Answered 100 questions',
    color: 'bg-red-500',
    icon: '🏆',
    requirement: 100
  }
];

export function getBadgeForAnswerCount(answerCount: number): Badge {
  // Find the highest badge the user qualifies for
  const qualifiedBadges = badges.filter(badge => answerCount >= badge.requirement);
  return qualifiedBadges[qualifiedBadges.length - 1] || badges[0];
}

export function getNextBadge(answerCount: number): Badge | null {
  const currentBadge = getBadgeForAnswerCount(answerCount);
  const currentIndex = badges.findIndex(badge => badge.name === currentBadge.name);
  return currentIndex < badges.length - 1 ? badges[currentIndex + 1] : null;
}