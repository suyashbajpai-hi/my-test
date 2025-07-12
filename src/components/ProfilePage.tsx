import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Award, Calendar, Star, MessageSquare, TrendingUp, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { getBadgeForAnswerCount, getNextBadge, badges } from '../utils/badges';
import { formatDistanceToNow } from 'date-fns';

interface ProfilePageProps {
  onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { questions } = useData();
  const { isDark } = useTheme();
  const [userQuestions, setUserQuestions] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      // Get user's questions
      const myQuestions = questions.filter(q => q.authorId === user.id);
      setUserQuestions(myQuestions);

      // Get user's answers
      const myAnswers: any[] = [];
      questions.forEach(question => {
        question.answers.forEach(answer => {
          if (answer.authorId === user.id) {
            myAnswers.push({
              ...answer,
              questionTitle: question.title,
              questionId: question.id
            });
          }
        });
      });
      setUserAnswers(myAnswers);
    }
  }, [user, questions]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center glass-effect rounded-3xl p-8 lg:p-12 shadow-2xl max-w-md w-full">
          <div className="w-16 h-16 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg glow-effect">
            <User className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Please sign in to view profile</h2>
          <button
            onClick={onBack}
            className="bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] hover:from-[var(--accent-primary)]/90 hover:via-[var(--accent-secondary)]/90 hover:to-[var(--accent-tertiary)]/90 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg glow-effect"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const currentBadge = getBadgeForAnswerCount(user.questionsAnswered);
  const nextBadge = getNextBadge(user.questionsAnswered);
  const progressToNext = nextBadge ? 
    ((user.questionsAnswered - currentBadge.requirement) / (nextBadge.requirement - currentBadge.requirement)) * 100 : 100;

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center font-medium mb-6 glass-effect px-4 py-2.5 rounded-2xl hover:bg-[color:var(--bg-tertiary)] transition-all duration-300 shadow-sm hover:shadow-md"
            style={{ color: 'var(--accent-primary)' }}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info */}
            <div className="glass-effect rounded-3xl p-6 lg:p-8 shadow-2xl">
              <div className="text-center">
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg glow-effect">
                  <User className="h-10 w-10 lg:h-12 lg:w-12 text-white" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-2 gradient-text">{user.username}</h1>
                <p className="text-sm lg:text-base mb-4" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                
                {/* Badge */}
                <div className="inline-flex items-center space-x-2 glass-effect px-4 py-2 rounded-full border shadow-sm mb-4" style={{ borderColor: 'var(--accent-primary)' }}>
                  <span className="text-lg">{currentBadge.icon}</span>
                  <span className="font-semibold" style={{ color: 'var(--accent-primary)' }}>{currentBadge.name}</span>
                </div>
                
                <div className="flex items-center justify-center space-x-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDistanceToNow(user.joinedAt, { addSuffix: true })}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="glass-effect rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
                <TrendingUp className="h-5 w-5 mr-2" style={{ color: 'var(--accent-primary)' }} />
                Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 glass-effect rounded-2xl">
                  <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Reputation</span>
                  <span className="text-xl font-bold gradient-text">{user.reputation}</span>
                </div>
                <div className="flex justify-between items-center p-3 glass-effect rounded-2xl">
                  <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Questions Asked</span>
                  <span className="text-xl font-bold text-blue-500">{userQuestions.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 glass-effect rounded-2xl">
                  <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Answers Given</span>
                  <span className="text-xl font-bold text-green-500">{user.questionsAnswered}</span>
                </div>
                <div className="flex justify-between items-center p-3 glass-effect rounded-2xl">
                  <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Accepted Answers</span>
                  <span className="text-xl font-bold text-yellow-500">
                    {userAnswers.filter(a => a.isAccepted).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Badge Progress */}
            <div className="glass-effect rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
                <Award className="h-5 w-5 mr-2" style={{ color: 'var(--accent-primary)' }} />
                Badge Progress
              </h3>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl mb-2">{currentBadge.icon}</div>
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{currentBadge.name}</div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{currentBadge.description}</div>
                </div>

                {nextBadge && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                        Progress to {nextBadge.name}
                      </span>
                      <span className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
                        {user.questionsAnswered}/{nextBadge.requirement}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div 
                        className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progressToNext, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                      {nextBadge.requirement - user.questionsAnswered} more answers needed
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* All Badges */}
            <div className="glass-effect rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
                <Target className="h-5 w-5 mr-2" style={{ color: 'var(--accent-primary)' }} />
                All Badges
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {badges.map((badge) => {
                  const isEarned = user.questionsAnswered >= badge.requirement;
                  return (
                    <div
                      key={badge.name}
                      className={`p-3 rounded-2xl text-center transition-all duration-300 ${
                        isEarned 
                          ? 'glass-effect border border-[color:var(--accent-primary)] shadow-lg' 
                          : 'bg-gray-100 dark:bg-gray-800 opacity-50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{badge.icon}</div>
                      <div className={`text-xs font-medium ${isEarned ? 'text-[color:var(--text-primary)]' : 'text-gray-500'}`}>
                        {badge.name}
                      </div>
                      <div className={`text-xs ${isEarned ? 'text-[color:var(--text-secondary)]' : 'text-gray-400'}`}>
                        {badge.requirement} answers
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Questions */}
            <div className="glass-effect rounded-3xl p-6 lg:p-8 shadow-2xl">
              <h3 className="text-xl font-semibold mb-6 flex items-center" style={{ color: 'var(--text-primary)' }}>
                <MessageSquare className="h-6 w-6 mr-2" style={{ color: 'var(--accent-primary)' }} />
                Recent Questions ({userQuestions.length})
              </h3>
              
              {userQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-[var(--accent-primary)]/20 via-[var(--accent-secondary)]/20 to-[var(--accent-tertiary)]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8" style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                  <p style={{ color: 'var(--text-secondary)' }}>No questions asked yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userQuestions.slice(0, 5).map((question) => (
                    <div key={question.id} className="glass-effect rounded-2xl p-4 hover:bg-[color:var(--bg-tertiary)] transition-all duration-300">
                      <h4 className="font-semibold mb-2 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                        {question.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        <span className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>{question.votes} votes</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{question.answers.length} answers</span>
                        </span>
                        <span>{formatDistanceToNow(question.createdAt, { addSuffix: true })}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {question.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium glass-effect"
                            style={{ color: 'var(--accent-primary)' }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Answers */}
            <div className="glass-effect rounded-3xl p-6 lg:p-8 shadow-2xl">
              <h3 className="text-xl font-semibold mb-6 flex items-center" style={{ color: 'var(--text-primary)' }}>
                <Star className="h-6 w-6 mr-2" style={{ color: 'var(--accent-primary)' }} />
                Recent Answers ({userAnswers.length})
              </h3>
              
              {userAnswers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-[var(--accent-primary)]/20 via-[var(--accent-secondary)]/20 to-[var(--accent-tertiary)]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8" style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                  <p style={{ color: 'var(--text-secondary)' }}>No answers given yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userAnswers.slice(0, 5).map((answer) => (
                    <div key={answer.id} className="glass-effect rounded-2xl p-4 hover:bg-[color:var(--bg-tertiary)] transition-all duration-300">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold line-clamp-2 flex-1" style={{ color: 'var(--text-primary)' }}>
                          {answer.questionTitle}
                        </h4>
                        {answer.isAccepted && (
                          <div className="flex items-center space-x-1 text-green-500 bg-green-500/10 px-2 py-1 rounded-full text-xs font-medium ml-2">
                            <Star className="h-3 w-3" />
                            <span>Accepted</span>
                          </div>
                        )}
                      </div>
                      <div 
                        className="text-sm line-clamp-2 mb-3" 
                        style={{ color: 'var(--text-secondary)' }}
                        dangerouslySetInnerHTML={{ __html: answer.content }}
                      />
                      <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        <span className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>{answer.votes} votes</span>
                        </span>
                        <span>{formatDistanceToNow(answer.createdAt, { addSuffix: true })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;