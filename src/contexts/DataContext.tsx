import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { generateAIAnswer } from '../lib/gemini';
import { Question, Answer, Notification, Vote, User } from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  questions: Question[];
  notifications: Notification[];
  votes: Vote[];
  isLoading: boolean;
  addQuestion: (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'votes' | 'views' | 'answers' | 'author'>) => Promise<void>;
  addAnswer: (answer: Omit<Answer, 'id' | 'createdAt' | 'updatedAt' | 'votes' | 'isAccepted' | 'author' | 'isAiGenerated'>) => Promise<void>;
  generateAIAnswerForQuestion: (questionId: string) => Promise<void>;
  voteOnQuestion: (questionId: string, value: 1 | -1) => Promise<void>;
  voteOnAnswer: (answerId: string, value: 1 | -1) => Promise<void>;
  acceptAnswer: (questionId: string, answerId: string) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  getUnreadNotificationCount: () => number;
  loadQuestions: () => Promise<void>;
  incrementQuestionViews: (questionId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateUserStats } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
    // Set up real-time subscriptions
    const questionsSubscription = supabase
      .channel('questions_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'questions' }, 
        () => {
          console.log('Questions updated, reloading...');
          loadQuestions();
        }
      )
      .subscribe();

    const answersSubscription = supabase
      .channel('answers_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'answers' }, 
        () => {
          console.log('Answers updated, reloading...');
          loadQuestions();
        }
      )
      .subscribe();

    if (user) {
      loadNotifications();
      loadVotes();
    }

    return () => {
      questionsSubscription.unsubscribe();
      answersSubscription.unsubscribe();
    };
  }, [user]);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      console.log('Loading questions...');
      
      // Load questions with author information
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select(`
          *,
          author:users!questions_author_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (questionsError) throw questionsError;
      console.log('Questions loaded:', questionsData?.length || 0);

      // Load answers with author information for each question
      const questionsWithAnswers = await Promise.all(
        (questionsData || []).map(async (question) => {
          const { data: answersData, error: answersError } = await supabase
            .from('answers')
            .select(`
              *,
              author:users!answers_author_id_fkey(*)
            `)
            .eq('question_id', question.id)
            .order('created_at', { ascending: false });

          if (answersError) throw answersError;

          const answers: Answer[] = (answersData || []).map(answer => ({
            id: answer.id,
            content: answer.content,
            questionId: answer.question_id,
            authorId: answer.author_id,
            author: {
              id: answer.author.id,
              username: answer.author.username,
              email: answer.author.email,
              avatar: answer.author.avatar_url,
              role: answer.author.role,
              reputation: answer.author.reputation,
              badge: answer.author.badge,
              questionsAnswered: answer.author.questions_answered,
              joinedAt: new Date(answer.author.created_at)
            },
            createdAt: new Date(answer.created_at),
            updatedAt: new Date(answer.updated_at),
            votes: answer.votes,
            isAccepted: answer.is_accepted,
            isAiGenerated: answer.is_ai_generated
          }));

          return {
            id: question.id,
            title: question.title,
            description: question.description,
            tags: question.tags,
            authorId: question.author_id,
            author: {
              id: question.author.id,
              username: question.author.username,
              email: question.author.email,
              avatar: question.author.avatar_url,
              role: question.author.role,
              reputation: question.author.reputation,
              badge: question.author.badge,
              questionsAnswered: question.author.questions_answered,
              joinedAt: new Date(question.author.created_at)
            },
            createdAt: new Date(question.created_at),
            updatedAt: new Date(question.updated_at),
            votes: question.votes,
            views: question.views,
            answers,
            acceptedAnswerId: question.accepted_answer_id
          };
        })
      );

      setQuestions(questionsWithAnswers);
      console.log('Final questions with answers:', questionsWithAnswers.length);
    } catch (error) {
      console.error('Error loading questions:', error);
      // Show user-friendly error message
      if (error.message?.includes('relation "users" does not exist')) {
        console.error('Database tables not created yet. Please set up Supabase first.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const notificationsData: Notification[] = (data || []).map(notification => ({
        id: notification.id,
        userId: notification.user_id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.is_read,
        createdAt: new Date(notification.created_at),
        questionId: notification.question_id,
        answerId: notification.answer_id
      }));

      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadVotes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const votesData: Vote[] = (data || []).map(vote => ({
        id: vote.id,
        userId: vote.user_id,
        targetId: vote.target_id,
        targetType: vote.target_type,
        value: vote.value
      }));

      setVotes(votesData);
    } catch (error) {
      console.error('Error loading votes:', error);
    }
  };

  const addQuestion = async (questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'votes' | 'views' | 'answers' | 'author'>) => {
    if (!user) throw new Error('User must be logged in to ask questions');

    try {
      console.log('Adding question:', questionData);
      const { data, error } = await supabase
        .from('questions')
        .insert({
          title: questionData.title,
          description: questionData.description,
          tags: questionData.tags,
          author_id: user.id,
          votes: 0,
          views: 0
        })
        .select()
        .single();

      if (error) throw error;
      console.log('Question added successfully:', data);

      await loadQuestions();
    } catch (error) {
      console.error('Error adding question:', error);
      throw error;
    }
  };

  const addAnswer = async (answerData: Omit<Answer, 'id' | 'createdAt' | 'updatedAt' | 'votes' | 'isAccepted' | 'author' | 'isAiGenerated'>) => {
    if (!user) throw new Error('User must be logged in to answer questions');

    try {
      const { data, error } = await supabase
        .from('answers')
        .insert({
          content: answerData.content,
          question_id: answerData.questionId,
          author_id: user.id,
          votes: 0,
          is_accepted: false,
          is_ai_generated: false
        })
        .select()
        .single();

      if (error) throw error;

      // Update user stats
      await updateUserStats(user.id);

      // Create notification for question author
      const question = questions.find(q => q.id === answerData.questionId);
      if (question && question.authorId !== user.id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: question.authorId,
            type: 'answer',
            title: 'New Answer',
            message: `${user.username} answered your question "${question.title}"`,
            is_read: false,
            question_id: question.id,
            answer_id: data.id
          });
      }

      await loadQuestions();
      if (user) {
        await loadNotifications();
      }
    } catch (error) {
      console.error('Error adding answer:', error);
      throw error;
    }
  };

  const generateAIAnswerForQuestion = async (questionId: string) => {
    try {
      const question = questions.find(q => q.id === questionId);
      if (!question) throw new Error('Question not found');

      // Check if AI answer already exists
      const existingAIAnswer = question.answers.find(a => a.isAiGenerated);
      if (existingAIAnswer) {
        throw new Error('AI answer already exists for this question');
      }

      const aiAnswer = await generateAIAnswer(question.title, question.description);

      const { data, error } = await supabase
        .from('answers')
        .insert({
          content: aiAnswer,
          question_id: questionId,
          author_id: 'ai-assistant', // Special ID for AI
          votes: 0,
          is_accepted: false,
          is_ai_generated: true
        })
        .select()
        .single();

      if (error) throw error;

      await loadQuestions();
    } catch (error) {
      console.error('Error generating AI answer:', error);
      throw error;
    }
  };

  const voteOnQuestion = async (questionId: string, value: 1 | -1) => {
    if (!user) throw new Error('User must be logged in to vote');

    try {
      const existingVote = votes.find(v => 
        v.userId === user.id && v.targetId === questionId && v.targetType === 'question'
      );

      if (existingVote) {
        if (existingVote.value === value) {
          // Remove vote
          await supabase
            .from('votes')
            .delete()
            .eq('id', existingVote.id);

          await supabase
            .from('questions')
            .update({ votes: questions.find(q => q.id === questionId)!.votes - value })
            .eq('id', questionId);
        } else {
          // Change vote
          await supabase
            .from('votes')
            .update({ value })
            .eq('id', existingVote.id);

          const currentVotes = questions.find(q => q.id === questionId)!.votes;
          await supabase
            .from('questions')
            .update({ votes: currentVotes - existingVote.value + value })
            .eq('id', questionId);
        }
      } else {
        // New vote
        await supabase
          .from('votes')
          .insert({
            user_id: user.id,
            target_id: questionId,
            target_type: 'question',
            value
          });

        await supabase
          .from('questions')
          .update({ votes: questions.find(q => q.id === questionId)!.votes + value })
          .eq('id', questionId);
      }

      await loadVotes();
      await loadQuestions();
    } catch (error) {
      console.error('Error voting on question:', error);
      throw error;
    }
  };

  const voteOnAnswer = async (answerId: string, value: 1 | -1) => {
    if (!user) throw new Error('User must be logged in to vote');

    try {
      const existingVote = votes.find(v => 
        v.userId === user.id && v.targetId === answerId && v.targetType === 'answer'
      );

      // Find current answer votes
      let currentAnswerVotes = 0;
      for (const question of questions) {
        const answer = question.answers.find(a => a.id === answerId);
        if (answer) {
          currentAnswerVotes = answer.votes;
          break;
        }
      }

      if (existingVote) {
        if (existingVote.value === value) {
          // Remove vote
          await supabase
            .from('votes')
            .delete()
            .eq('id', existingVote.id);

          await supabase
            .from('answers')
            .update({ votes: currentAnswerVotes - value })
            .eq('id', answerId);
        } else {
          // Change vote
          await supabase
            .from('votes')
            .update({ value })
            .eq('id', existingVote.id);

          await supabase
            .from('answers')
            .update({ votes: currentAnswerVotes - existingVote.value + value })
            .eq('id', answerId);
        }
      } else {
        // New vote
        await supabase
          .from('votes')
          .insert({
            user_id: user.id,
            target_id: answerId,
            target_type: 'answer',
            value
          });

        await supabase
          .from('answers')
          .update({ votes: currentAnswerVotes + value })
          .eq('id', answerId);
      }

      await loadVotes();
      await loadQuestions();
    } catch (error) {
      console.error('Error voting on answer:', error);
      throw error;
    }
  };

  const acceptAnswer = async (questionId: string, answerId: string) => {
    if (!user) throw new Error('User must be logged in');

    const question = questions.find(q => q.id === questionId);
    if (!question || question.authorId !== user.id) {
      throw new Error('Only question author can accept answers');
    }

    try {
      // Update question with accepted answer
      await supabase
        .from('questions')
        .update({ accepted_answer_id: answerId })
        .eq('id', questionId);

      // Mark answer as accepted
      await supabase
        .from('answers')
        .update({ is_accepted: true })
        .eq('id', answerId);

      // Mark other answers as not accepted
      await supabase
        .from('answers')
        .update({ is_accepted: false })
        .eq('question_id', questionId)
        .neq('id', answerId);

      await loadQuestions();
    } catch (error) {
      console.error('Error accepting answer:', error);
      throw error;
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const incrementQuestionViews = async (questionId: string) => {
    try {
      const question = questions.find(q => q.id === questionId);
      if (question) {
        await supabase
          .from('questions')
          .update({ views: question.views + 1 })
          .eq('id', questionId);

        // Update local state
        setQuestions(prev => prev.map(q => 
          q.id === questionId ? { ...q, views: q.views + 1 } : q
        ));
      }
    } catch (error) {
      console.error('Error incrementing question views:', error);
    }
  };

  const getUnreadNotificationCount = () => {
    if (!user) return 0;
    return notifications.filter(n => n.userId === user.id && !n.isRead).length;
  };

  const value = {
    questions,
    notifications,
    votes,
    isLoading,
    addQuestion,
    addAnswer,
    generateAIAnswerForQuestion,
    voteOnQuestion,
    voteOnAnswer,
    acceptAnswer,
    markNotificationRead,
    getUnreadNotificationCount,
    loadQuestions,
    incrementQuestionViews
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};