import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, ArrowUp, ArrowDown, User, Check, Eye, MessageSquare, Award, Clock, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Question, Answer } from '../types';
import RichTextEditor from './RichTextEditor';

interface QuestionDetailPageProps {
  question: Question;
  onBack: () => void;
}

const QuestionDetailPage: React.FC<QuestionDetailPageProps> = ({ question, onBack }) => {
  const { user } = useAuth();
  const { voteOnQuestion, voteOnAnswer, acceptAnswer, addAnswer, votes } = useData();
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
          : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 hover:scale-105'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {direction === 'up' ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium mb-6 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-gray-200/50 hover:bg-white/95 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Questions
          </button>
        </div>

        {/* Question */}
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-6 lg:p-8 mb-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Voting - Desktop */}
            <div className="hidden lg:flex flex-col items-center space-y-4 bg-gray-50/80 rounded-3xl p-6 shadow-sm border border-gray-200/50">
              <VoteButton
                direction="up"
                onClick={() => handleVote(question.id, 'question', 1)}
                active={questionVote?.value === 1}
                disabled={!user}
              />
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
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
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 leading-tight">{question.title}</h1>
              
              <div 
                className="prose prose-lg max-w-none text-gray-700 mb-8 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: question.description }}
              />

              <div className="flex flex-wrap gap-2 mb-8">
                {question.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 text-blue-800 border border-blue-200 hover:from-blue-200 hover:via-purple-200 hover:to-pink-200 transition-all duration-300 shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Mobile Voting */}
              <div className="lg:hidden flex items-center justify-center space-x-6 mb-8 bg-gray-50/80 rounded-2xl p-4">
                <VoteButton
                  direction="up"
                  onClick={() => handleVote(question.id, 'question', 1)}
                  active={questionVote?.value === 1}
                  disabled={!user}
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
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
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2 bg-gray-100/80 px-3 py-2 rounded-full">
                    <Eye className="h-4 w-4" />
                    <span>{question.views} views</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-100/80 px-3 py-2 rounded-full">
                    <MessageSquare className="h-4 w-4" />
                    <span>{question.answers.length} answers</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-100/80 px-3 py-2 rounded-full">
                    <Clock className="h-4 w-4" />
                    <span>{formatDistanceToNow(question.createdAt, { addSuffix: true })}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl px-4 py-3 border border-gray-200/50">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{question.author.username}</span>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
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
                    className={`bg-white/90 backdrop-blur-sm border rounded-3xl p-6 lg:p-8 shadow-2xl transition-all duration-300 ${
                      answer.isAccepted 
                        ? 'border-green-300 bg-gradient-to-r from-green-50/50 via-emerald-50/50 to-green-50/50' 
                        : 'border-gray-200/50'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      {/* Voting - Desktop */}
                      <div className="hidden lg:flex flex-col items-center space-y-4 bg-gray-50/80 rounded-3xl p-6 shadow-sm border border-gray-200/50">
                        <VoteButton
                          direction="up"
                          onClick={() => handleVote(answer.id, 'answer', 1)}
                          active={answerVote?.value === 1}
                          disabled={!user}
                        />
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
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
                            className="p-3 rounded-2xl hover:bg-green-100 text-gray-600 hover:text-green-600 transition-all duration-300 border-2 border-dashed border-gray-300 hover:border-green-300"
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
                        {answer.isAccepted && (
                          <div className="flex items-center mb-4 text-green-600 font-semibold bg-green-50 px-4 py-2 rounded-2xl border border-green-200">
                            <Check className="h-4 w-4 mr-2" />
                            Accepted Answer
                          </div>
                        )}

                        {/* Mobile Voting */}
                        <div className="lg:hidden flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-4">
                            <VoteButton
                              direction="up"
                              onClick={() => handleVote(answer.id, 'answer', 1)}
                              active={answerVote?.value === 1}
                              disabled={!user}
                            />
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                              {answer.votes}
                            </span>
                            <VoteButton
                              direction="down"
                              onClick={() => handleVote(answer.id, 'answer', -1)}
                              active={answerVote?.value === -1}
                              disabled={!user}
                            />
                          </div>
                          
                          {isQuestionOwner && !question.acceptedAnswerId && (
                            <button
                              onClick={() => handleAcceptAnswer(answer.id)}
                              className="p-2 rounded-xl hover:bg-green-100 text-gray-600 hover:text-green-600 transition-all duration-300 border border-gray-300 hover:border-green-300"
                              title="Accept this answer"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        
                        <div 
                          className="prose prose-lg max-w-none text-gray-700 mb-6 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: answer.content }}
                        />

                        <div className="flex items-center justify-end">
                          <div className="flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl px-4 py-3 border border-gray-200/50">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900 text-sm">{answer.author.username}</span>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <Award className="h-3 w-3" />
                                <span>{answer.author.reputation} rep</span>
                                <span>•</span>
                                <span>{formatDistanceToNow(answer.createdAt, { addSuffix: true })}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Answer Form */}
        {user ? (
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-6 lg:p-8 shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
              Your Answer
            </h3>
            <form onSubmit={handleSubmitAnswer}>
              <div className="mb-6">
                <RichTextEditor
                  value={answerContent}
                  onChange={setAnswerContent}
                  placeholder="Write your answer here. Be clear and provide examples if possible."
                  minHeight="250px"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !answerContent.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:from-blue-400 disabled:via-purple-400 disabled:to-pink-400 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    'Submit Answer'
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50 border border-gray-200/50 rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <User className="h-8 w-8 text-white" />
            </div>
            <p className="text-gray-600 text-lg mb-4">Please sign in to submit an answer.</p>
            <p className="text-gray-500 text-sm">Join our community to help others and share your knowledge.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetailPage;