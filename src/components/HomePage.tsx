import React, { useState } from 'react';
import { Filter, ChevronDown, TrendingUp, Clock, MessageSquare, Sparkles, Star, Users } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import QuestionCard from './QuestionCard';
import { Question } from '../types';

interface HomePageProps {
  onQuestionClick: (question: Question) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onQuestionClick }) => {
  const { questions, isLoading } = useData();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [sortBy, setSortBy] = useState<'newest' | 'votes' | 'views'>('newest');
  const [filterBy, setFilterBy] = useState<'all' | 'unanswered' | 'answered'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = Array.from(new Set(questions.flatMap(q => q.tags)));

  const filteredQuestions = questions
    .filter(question => {
      if (filterBy === 'unanswered' && question.answers.length > 0) return false;
      if (filterBy === 'answered' && question.answers.length === 0) return false;
      if (selectedTags.length > 0 && !selectedTags.some(tag => question.tags.includes(tag))) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'votes':
          return b.votes - a.votes;
        case 'views':
          return b.views - a.views;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const getSortIcon = (sort: string) => {
    switch (sort) {
      case 'votes': return <TrendingUp className="h-4 w-4" />;
      case 'views': return <MessageSquare className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold gradient-text">
                  Questions
                </h1>
                <p className="mt-1 text-sm lg:text-base" style={{ color: 'var(--text-secondary)' }}>
                  {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''} found
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Sort dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none glass-effect rounded-2xl pl-4 pr-12 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/50 focus:border-[color:var(--accent-primary)]/50 transition-all duration-300 shadow-sm hover:shadow-md w-full sm:w-auto"
                    style={{ color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                  >
                    <option value="newest">Newest</option>
                    <option value="votes">Most Votes</option>
                    <option value="views">Most Views</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 pointer-events-none">
                    {getSortIcon(sortBy)}
                    <ChevronDown className="h-4 w-4" style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                </div>

                {/* Filter dropdown */}
                <div className="relative">
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value as any)}
                    className="appearance-none glass-effect rounded-2xl pl-4 pr-12 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/50 focus:border-[color:var(--accent-primary)]/50 transition-all duration-300 shadow-sm hover:shadow-md w-full sm:w-auto"
                    style={{ color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                  >
                    <option value="all">All Questions</option>
                    <option value="unanswered">Unanswered</option>
                    <option value="answered">Answered</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: 'var(--text-tertiary)' }} />
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4 lg:space-y-6">
              {isLoading ? (
                <div className="text-center py-12 lg:py-16">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-[var(--accent-primary)]/20 via-[var(--accent-secondary)]/20 to-[var(--accent-tertiary)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Loading questions...</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Please wait while we fetch the latest questions.</p>
                </div>
              ) : 
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-12 lg:py-16">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-[var(--accent-primary)]/20 via-[var(--accent-secondary)]/20 to-[var(--accent-tertiary)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="h-10 w-10 lg:h-12 lg:w-12" style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                  <div className="max-w-md mx-auto" style={{ color: 'var(--text-tertiary)' }}>
                    {questions.length === 0 ? (
                      <>
                        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No questions yet!</h3>
                        {user && (
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Be the first to ask a question and start the conversation.</p>
                        )}
                      </>
                    ) : (
                      <>
                        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No questions match your filters</h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Try adjusting your search criteria or clearing the filters.</p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                filteredQuestions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    onClick={() => onQuestionClick(question)}
                  />
                ))
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full xl:w-80 space-y-6">
            {/* Filter by Tags */}
            <div className="glass-effect rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 card-hover">
              <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
                <div className="w-8 h-8 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] rounded-xl flex items-center justify-center mr-3 shadow-lg glow-effect">
                  <Filter className="h-4 w-4 text-white" />
                </div>
                Filter by Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedTags.includes(tag)
                        ? 'bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] text-white shadow-lg transform scale-105 glow-effect'
                        : 'glass-effect hover:bg-[color:var(--bg-tertiary)] hover:scale-105'
                    }`}
                    style={{ color: selectedTags.includes(tag) ? 'white' : 'var(--text-secondary)' }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="mt-4 text-sm font-medium transition-colors"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Statistics */}
            <div className="glass-effect rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 card-hover">
              <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mr-3 shadow-lg glow-effect">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                Community Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 glass-effect rounded-2xl border" style={{ borderColor: 'var(--accent-primary)' }}>
                  <span className="font-medium flex items-center" style={{ color: 'var(--text-secondary)' }}>
                    <MessageSquare className="h-4 w-4 mr-2" style={{ color: 'var(--accent-primary)' }} />
                    Total Questions
                  </span>
                  <span className="text-xl font-bold gradient-text">
                    {questions.length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 glass-effect rounded-2xl border" style={{ borderColor: 'rgb(34 197 94)' }}>
                  <span className="font-medium flex items-center" style={{ color: 'var(--text-secondary)' }}>
                    <Star className="h-4 w-4 mr-2 text-green-500" />
                    Answered
                  </span>
                  <span className="text-xl font-bold text-green-500">
                    {questions.filter(q => q.answers.length > 0).length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 glass-effect rounded-2xl border" style={{ borderColor: 'rgb(249 115 22)' }}>
                  <span className="font-medium flex items-center" style={{ color: 'var(--text-secondary)' }}>
                    <Clock className="h-4 w-4 mr-2 text-orange-500" />
                    Unanswered
                  </span>
                  <span className="text-xl font-bold text-orange-500">
                    {questions.filter(q => q.answers.length === 0).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Popular Tags */}
            <div className="glass-effect rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 card-hover">
              <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
                <div className="w-8 h-8 bg-gradient-to-r from-[var(--accent-secondary)] to-[var(--accent-primary)] rounded-xl flex items-center justify-center mr-3 shadow-lg glow-effect">
                  <Users className="h-4 w-4 text-white" />
                </div>
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 8).map((tag) => (
                  <span
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium glass-effect hover:bg-[color:var(--bg-tertiary)] transition-all duration-300 cursor-pointer hover:scale-105 shadow-sm hover:shadow-md"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Welcome Message for New Users */}
            {!user && (
              <div className="glass-effect border rounded-3xl p-6 shadow-lg glow-effect" style={{ borderColor: 'var(--accent-primary)' }}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg glow-effect">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Join StackIt</h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Sign up to ask questions, provide answers, and build your reputation in the community.
                  </p>
                  <div className="space-y-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-[var(--accent-primary)] rounded-full"></div>
                      <span>Ask questions and get answers</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-[var(--accent-secondary)] rounded-full"></div>
                      <span>Build your reputation</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-[var(--accent-tertiary)] rounded-full"></div>
                      <span>Connect with developers</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;