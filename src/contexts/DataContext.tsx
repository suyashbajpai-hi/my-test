import React, { createContext, useContext, useState, useEffect } from 'react';
import { Question, Answer, Notification, Vote } from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  questions: Question[];
  notifications: Notification[];
  votes: Vote[];
  addQuestion: (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'votes' | 'views' | 'answers'>) => void;
  addAnswer: (answer: Omit<Answer, 'id' | 'createdAt' | 'updatedAt' | 'votes' | 'isAccepted'>) => void;
  voteOnQuestion: (questionId: string, value: 1 | -1) => void;
  voteOnAnswer: (answerId: string, value: 1 | -1) => void;
  acceptAnswer: (questionId: string, answerId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  getUnreadNotificationCount: () => number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Mock data
const mockQuestions: Question[] = [
  {
    id: '1',
    title: 'How to join 2 columns in a data set to make a separate column in SQL?',
    description: '<p>I do not have the code for it as I am a beginner. An example would be nice!</p>',
    tags: ['sql', 'joins', 'database'],
    authorId: '1',
    author: {
      id: '1',
      username: 'john_doe',
      email: 'john@example.com',
      role: 'user',
      reputation: 1250,
      joinedAt: new Date('2023-01-15')
    },
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
    votes: 5,
    views: 127,
    answers: [],
    acceptedAnswerId: undefined
  },
  {
    id: '2',
    title: 'React component not re-rendering after state change',
    description: '<p>I have a React component that uses useState, but it\'s not re-rendering when I update the state. What could be the issue?</p>',
    tags: ['react', 'javascript', 'hooks'],
    authorId: '2',
    author: {
      id: '2',
      username: 'jane_smith',
      email: 'jane@example.com',
      role: 'admin',
      reputation: 3450,
      joinedAt: new Date('2022-11-20')
    },
    createdAt: new Date('2024-01-14T15:45:00Z'),
    updatedAt: new Date('2024-01-14T15:45:00Z'),
    votes: 12,
    views: 89,
    answers: [],
    acceptedAnswerId: undefined
  }
];

const mockAnswers: Answer[] = [
  {
    id: '1',
    content: '<p>You can use a JOIN statement in SQL. Here\'s an example:</p><pre><code>SELECT CONCAT(column1, \' \', column2) AS combined_column FROM your_table;</code></pre>',
    questionId: '1',
    authorId: '3',
    author: {
      id: '3',
      username: 'dev_guru',
      email: 'guru@example.com',
      role: 'user',
      reputation: 2890,
      joinedAt: new Date('2023-03-10')
    },
    createdAt: new Date('2024-01-15T11:00:00Z'),
    updatedAt: new Date('2024-01-15T11:00:00Z'),
    votes: 3,
    isAccepted: false
  }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);

  // Initialize answers in questions
  useEffect(() => {
    setQuestions(prev => prev.map(q => ({
      ...q,
      answers: mockAnswers.filter(a => a.questionId === q.id)
    })));
  }, []);

  const addQuestion = (questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'votes' | 'views' | 'answers'>) => {
    if (!user) return;

    const newQuestion: Question = {
      ...questionData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      votes: 0,
      views: 0,
      answers: [],
      author: user
    };

    setQuestions(prev => [newQuestion, ...prev]);
  };

  const addAnswer = (answerData: Omit<Answer, 'id' | 'createdAt' | 'updatedAt' | 'votes' | 'isAccepted'>) => {
    if (!user) return;

    const newAnswer: Answer = {
      ...answerData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      votes: 0,
      isAccepted: false,
      author: user
    };

    setQuestions(prev => prev.map(q => 
      q.id === answerData.questionId 
        ? { ...q, answers: [...q.answers, newAnswer] }
        : q
    ));

    // Add notification to question author
    const question = questions.find(q => q.id === answerData.questionId);
    if (question && question.authorId !== user.id) {
      const notification: Notification = {
        id: Date.now().toString(),
        userId: question.authorId,
        type: 'answer',
        title: 'New Answer',
        message: `${user.username} answered your question "${question.title}"`,
        isRead: false,
        createdAt: new Date(),
        questionId: question.id,
        answerId: newAnswer.id
      };
      setNotifications(prev => [notification, ...prev]);
    }
  };

  const voteOnQuestion = (questionId: string, value: 1 | -1) => {
    if (!user) return;

    const existingVote = votes.find(v => 
      v.userId === user.id && v.targetId === questionId && v.targetType === 'question'
    );

    if (existingVote) {
      if (existingVote.value === value) {
        // Remove vote
        setVotes(prev => prev.filter(v => v.id !== existingVote.id));
        setQuestions(prev => prev.map(q => 
          q.id === questionId ? { ...q, votes: q.votes - value } : q
        ));
      } else {
        // Change vote
        setVotes(prev => prev.map(v => 
          v.id === existingVote.id ? { ...v, value } : v
        ));
        setQuestions(prev => prev.map(q => 
          q.id === questionId ? { ...q, votes: q.votes - existingVote.value + value } : q
        ));
      }
    } else {
      // New vote
      const newVote: Vote = {
        id: Date.now().toString(),
        userId: user.id,
        targetId: questionId,
        targetType: 'question',
        value
      };
      setVotes(prev => [...prev, newVote]);
      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, votes: q.votes + value } : q
      ));
    }
  };

  const voteOnAnswer = (answerId: string, value: 1 | -1) => {
    if (!user) return;

    const existingVote = votes.find(v => 
      v.userId === user.id && v.targetId === answerId && v.targetType === 'answer'
    );

    if (existingVote) {
      if (existingVote.value === value) {
        // Remove vote
        setVotes(prev => prev.filter(v => v.id !== existingVote.id));
        setQuestions(prev => prev.map(q => ({
          ...q,
          answers: q.answers.map(a => 
            a.id === answerId ? { ...a, votes: a.votes - value } : a
          )
        })));
      } else {
        // Change vote
        setVotes(prev => prev.map(v => 
          v.id === existingVote.id ? { ...v, value } : v
        ));
        setQuestions(prev => prev.map(q => ({
          ...q,
          answers: q.answers.map(a => 
            a.id === answerId ? { ...a, votes: a.votes - existingVote.value + value } : a
          )
        })));
      }
    } else {
      // New vote
      const newVote: Vote = {
        id: Date.now().toString(),
        userId: user.id,
        targetId: answerId,
        targetType: 'answer',
        value
      };
      setVotes(prev => [...prev, newVote]);
      setQuestions(prev => prev.map(q => ({
        ...q,
        answers: q.answers.map(a => 
          a.id === answerId ? { ...a, votes: a.votes + value } : a
        )
      })));
    }
  };

  const acceptAnswer = (questionId: string, answerId: string) => {
    if (!user) return;

    const question = questions.find(q => q.id === questionId);
    if (!question || question.authorId !== user.id) return;

    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { 
            ...q, 
            acceptedAnswerId: answerId,
            answers: q.answers.map(a => ({
              ...a,
              isAccepted: a.id === answerId
            }))
          }
        : q
    ));
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  };

  const getUnreadNotificationCount = () => {
    if (!user) return 0;
    return notifications.filter(n => n.userId === user.id && !n.isRead).length;
  };

  const value = {
    questions,
    notifications,
    votes,
    addQuestion,
    addAnswer,
    voteOnQuestion,
    voteOnAnswer,
    acceptAnswer,
    markNotificationRead,
    getUnreadNotificationCount
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};