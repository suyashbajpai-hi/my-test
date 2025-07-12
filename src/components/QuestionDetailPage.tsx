import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, ArrowUp, ArrowDown, User, Check, Eye, MessageSquare, Award, Clock, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { Question, Answer } from '../types';
import RichTextEditor from './RichTextEditor';

interface QuestionDetailPageProps {
  question: Question;
  onBack: () => void;
}

const QuestionDetailPage: React.FC<QuestionDetailPageProps> = ({ question, onBack }) => {
  const { user } = useAuth();
  const { voteOnQuestion, voteOnAnswer, acceptAnswer, addAnswer, votes } = useData();
  const { isDark } = useTheme();
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // In a real implementation, you'd make an API call to increment views
  }, [question.id]);

  const getUserVote = (targetId: string, targetType: 'question' | 'answer') => {
    if (!user) return null;
    return votes.find(v => 
      v.userId === user.id && 
      v.targetId === targetId && 
      v.targetType === targetType
    );
  };

  const handleVote = (targetId: string, targetType: 'question' | 'answer', value: 1 | -1) => {
    if (!user) return;
    
    if (targetType === 'question') {
      voteOnQuestion(targetId, value);
    } else {
      voteOnAnswer(targetId, value);
    }
  };

  const handleAcceptAnswer = (answerId: string) => {
    if (!user || user.id !== question.authorId) return;
    acceptAnswer(question.id, answerId);
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !answerContent.trim()) return;

    setIsSubmitting(true);
    try {
      addAnswer({
        content: answerContent,
        questionId: question.id,
        authorId: user.id,
        author: user
      });
      setAnswerContent('');
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const questionVote = getUserVote(question.id, 'question');
  const isQuestionOwner = user?.id === question.authorId;

  const VoteButton: React.FC<{ 
    direction: 'up' | 'down'; 
    onClick: () => void; 
    active: boolean; 
    disabled: boolean 
  }> = ({ direction, onClick, active, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-3 rounded-2xl transition-all duration-300 ${
        active
          ? direction === 'up' 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-110'
            : 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg transform scale-110'
          : 'hover:bg-[color:var(--bg-tertiary)] hover:scale-105'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ color: active ? 'white' : 'var(--text-tertiary)' }}
    >
      {direction === 'up' ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
    </button>
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center font-medium mb-6 glass-effect px-4 py-2.5 rounded-2xl hover:bg-[color:var(--bg-tertiary)] transition-all duration-300 shadow-sm hover:shadow-md"
            style={{ color: 'var(--accent-primary)' }}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Questions
          </button>
        </div>

        {/* Question */}
        <div className="glass-effect rounded-3xl p-6 lg:p-8 mb-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Voting - Desktop */}
            <div className="hidden lg:flex flex-col items-center space-y-4 glass-effect rounded-3xl p-6 shadow-sm">
              <VoteButton
                direction="up"
                onClick={() => handleVote(question.id, 'question', 1)}
                active={questionVote?.value === 1}
                disabled={!user}
              />
              <span className="text-3xl font-bold gradient-text">
                {question.votes}
              </span>
              <VoteButton
                direction="down"
                onClick={() => handleVote(question.id, 'question', -1)}
                active={questionVote?.value === -1}
                disabled={!user}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl lg:text-3xl font-bold mb-6 leading-tight" style={{ color: 'var(--text-primary)' }}>{question.title}</h1>
              
              <div 
                className="prose prose-lg max-w-none mb-8 leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
                dangerouslySetInnerHTML={{ __html: question.description }}
              />

              <div className="flex flex-wrap gap-2 mb-8">
                {question.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium glass-effect border hover:bg-[color:var(--bg-tertiary)] transition-all duration-300 shadow-sm"
                    style={{ color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Mobile Voting */}
              <div className="lg:hidden flex items-center justify-center space-x-6 mb-8 glass-effect rounded-2xl p-4">
                <VoteButton
                  direction="up"
                  onClick={() => handleVote(question.id, 'question', 1)}
                  active={questionVote?.value === 1}
                  disabled={!user}
                />
                <span className="text-2xl font-bold gradient-text">
                  {question.votes}
                </span>
                <VoteButton
                  direction="down"
                  onClick={() => handleVote(question.id, 'question', -1)}
                  active={questionVote?.value === -1}
                  disabled={!user}
                />
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  <div className="flex items-center space-x-2 glass-effect px-3 py-2 rounded-full">
                    <Eye className="h-4 w-4" />
                    <span>{question.views} views</span>
                  </div>
                  <div className="flex items-center space-x-2 glass-effect px-3 py-2 rounded-full">
                    <MessageSquare className="h-4 w-4" />
                    <span>{question.answers.length} answers</span>
                  </div>
                  <div className="flex items-center space-x-2 glass-effect px-3 py-2 rounded-full">
                    <Clock className="h-4 w-4" />
                    <span>{formatDistanceToNow(question.createdAt, { addSuffix: true })}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 glass-effect rounded-2xl px-4 py-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] rounded-full flex items-center justify-center shadow-lg glow-effect">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{question.author.username}</span>
                    <div className="flex items-center space-x-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                      <Award className="h-3 w-3" />
                      <span>{question.author.reputation} reputation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center" style={{ color: 'var(--text-primary)' }}>
            <Star className="h-6 w-6 mr-2 text-yellow-500" />
            {question.answers.length} Answer{question.answers.length !== 1 ? 's' : ''}
          </h2>

          <div className="space-y-6">
            {question.answers
              .sort((a, b) => {
                if (a.isAccepted && !b.isAccepted) return -1;
                if (!a.isAccepted && b.isAccepted) return 1;
                return b.votes - a.votes;
              })
              .map((answer) => {
                const answerVote = getUserVote(answer.id, 'answer');
                
                return (
                  <div
                    key={answer.id}
                    className={`glass-effect rounded-3xl p-6 lg:p-8 shadow-2xl transition-all duration-300 ${
                      answer.isAccepted 
                        ? 'border-green-500/30 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10' 
                        : ''
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      {/* Voting - Desktop */}
                      <div className="hidden lg:flex flex-col items-center space-y-4 glass-effect rounded-3xl p-6 shadow-sm">
                        <VoteButton
                          direction="up"
                          onClick={() => handleVote(answer.id, 'answer', 1)}
                          active={answerVote?.value === 1}
                          disabled={!user}
                        />
                        <span className="text-2xl font-bold gradient-text">
                          {answer.votes}
                        </span>
                        <VoteButton
                          direction="down"
                          onClick={() => handleVote(answer.id, 'answer', -1)}
                          active={answerVote?.value === -1}
                          disabled={!user}
                        />
                        
                        {/* Accept Answer Button */}
                        {isQuestionOwner && !question.acceptedAnswerId && (
                          <button
                            onClick={() => handleAcceptAnswer(answer.id)}
                            className="p-3 rounded-2xl hover:bg-green-500/10 transition-all duration-300 border-2 border-dashed hover:border-green-500/50"
                            style={{ color: 'var(--text-tertiary)', borderColor: 'var(--border-color)' }}
                            title="Accept this answer"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                        )}
                        
                        {answer.isAccepted && (
                          <div className="p-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
                            <Check className="h-5 w-5" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div 
                          className="prose prose-lg max-w-none mb-6 leading-relaxed"
                          style={{ color: 'var(--text-secondary)' }}
                          dangerouslySetInnerHTML={{ __html: answer.content }}
                        />

                        {/* Mobile Voting */}
                        <div className="lg:hidden flex items-center justify-center space-x-6 mb-6 glass-effect rounded-2xl p-4">
                          <VoteButton
                            direction="up"
                            onClick={() => handleVote(answer.id, 'answer', 1)}
                            active={answerVote?.value === 1}
                            disabled={!user}
                          />
                          <span className="text-xl font-bold gradient-text">
                            {answer.votes}
                          </span>
                          <VoteButton
                            direction="down"
                            onClick={() => handleVote(answer.id, 'answer', -1)}
                            active={answerVote?.value === -1}
                            disabled={!user}
                          />
                          
                          {isQuestionOwner && !question.acceptedAnswerId && (
                            <button
                              onClick={() => handleAcceptAnswer(answer.id)}
                              className="p-2 rounded-xl hover:bg-green-500/10 transition-all duration-300 border hover:border-green-500/50"
                              style={{ color: 'var(--text-tertiary)', borderColor: 'var(--border-color)' }}
                              title="Accept this answer"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          
                          {answer.isAccepted && (
                            <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] rounded-full flex items-center justify-center shadow-lg">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{answer.author.username}</span>
                              <div className="flex items-center space-x-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                <Award className="h-3 w-3" />
                                <span>{answer.author.reputation} reputation</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 text-xs glass-effect px-3 py-2 rounded-full" style={{ color: 'var(--text-tertiary)' }}>
                            <Clock className="h-3 w-3" />
                            <span>{formatDistanceToNow(answer.createdAt, { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Add Answer */}
        {user && (
          <div className="glass-effect rounded-3xl p-6 lg:p-8 shadow-2xl">
            <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Your Answer</h3>
            <form onSubmit={handleSubmitAnswer} className="space-y-6">
              <RichTextEditor
                value={answerContent}
                onChange={setAnswerContent}
                placeholder="Write your answer here. Be helpful and provide clear explanations."
                minHeight="200px"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !answerContent.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] hover:from-[var(--accent-primary)]/90 hover:via-[var(--accent-secondary)]/90 hover:to-[var(--accent-tertiary)]/90 disabled:from-[var(--accent-primary)]/50 disabled:via-[var(--accent-secondary)]/50 disabled:to-[var(--accent-tertiary)]/50 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl glow-effect"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Posting Answer...</span>
                    </div>
                  ) : (
                    'Post Answer'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetailPage;