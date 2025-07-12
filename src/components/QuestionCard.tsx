import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Eye, ArrowUp, User, CheckCircle, Clock, Award } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  onClick: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onClick }) => {
  const { isDark } = useTheme();
  const hasAcceptedAnswer = question.answers.some(answer => answer.isAccepted);

  return (
    <div 
      onClick={onClick}
      className="group glass-effect rounded-3xl p-6 lg:p-8 hover:shadow-2xl transition-all duration-500 cursor-pointer hover:border-[color:var(--accent-primary)]/50 hover:bg-[color:var(--bg-tertiary)] transform hover:-translate-y-2 hover:scale-[1.02] card-hover glow-effect"
    >
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3">
            <h3 className="text-lg lg:text-xl font-semibold group-hover:text-[color:var(--accent-primary)] transition-colors line-clamp-2 flex-1 leading-tight" style={{ color: 'var(--text-primary)' }}>
              {question.title}
            </h3>
            {hasAcceptedAnswer && (
              <div className="flex items-center space-x-1 text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full text-xs font-medium border border-green-500/20 shadow-sm">
                <CheckCircle className="h-3 w-3" />
                <span>Solved</span>
              </div>
            )}
          </div>
          
          <div 
            className="text-sm lg:text-base line-clamp-3 mb-6 leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
            dangerouslySetInnerHTML={{ __html: question.description }}
          />
          
          <div className="flex flex-wrap gap-2 mb-6">
            {question.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium glass-effect hover:bg-[color:var(--bg-tertiary)] transition-all duration-300 border shadow-sm"
                style={{ color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        {/* Stats - Desktop */}
        <div className="hidden lg:flex flex-col items-center space-y-4 text-sm">
          <div className="flex flex-col items-center space-y-2 p-4 glass-effect rounded-2xl shadow-sm border min-w-[80px]" style={{ borderColor: 'var(--accent-primary)' }}>
            <div className="flex items-center space-x-1" style={{ color: 'var(--accent-primary)' }}>
              <ArrowUp className="h-4 w-4" />
              <span className="font-semibold text-lg">{question.votes}</span>
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>votes</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2 p-4 glass-effect rounded-2xl shadow-sm border min-w-[80px]" style={{ borderColor: 'rgb(34 197 94)' }}>
            <div className="flex items-center space-x-1 text-green-500">
              <MessageSquare className="h-4 w-4" />
              <span className="font-semibold text-lg">{question.answers.length}</span>
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>answers</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2 p-4 glass-effect rounded-2xl shadow-sm border min-w-[80px]" style={{ borderColor: 'var(--accent-secondary)' }}>
            <div className="flex items-center space-x-1" style={{ color: 'var(--accent-secondary)' }}>
              <Eye className="h-4 w-4" />
              <span className="font-semibold text-lg">{question.views}</span>
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>views</span>
          </div>
        </div>
      </div>
      
      {/* Stats - Mobile */}
      <div className="lg:hidden flex items-center justify-between text-sm mb-6">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-1 glass-effect px-3 py-1.5 rounded-full" style={{ color: 'var(--accent-primary)' }}>
            <ArrowUp className="h-4 w-4" />
            <span className="font-semibold">{question.votes}</span>
          </div>
          <div className="flex items-center space-x-1 glass-effect px-3 py-1.5 rounded-full text-green-500">
            <MessageSquare className="h-4 w-4" />
            <span className="font-semibold">{question.answers.length}</span>
          </div>
          <div className="flex items-center space-x-1 glass-effect px-3 py-1.5 rounded-full" style={{ color: 'var(--accent-secondary)' }}>
            <Eye className="h-4 w-4" />
            <span className="font-semibold">{question.views}</span>
          </div>
        </div>
      </div>
      
      <div className="pt-6 border-t flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-4" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] rounded-full flex items-center justify-center shadow-lg glow-effect">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{question.author.username}</span>
            <div className="flex items-center space-x-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              <Award className="h-3 w-3" />
              <span>{question.author.reputation} reputation</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1 text-xs glass-effect px-3 py-2 rounded-full" style={{ color: 'var(--text-tertiary)' }}>
          <Clock className="h-3 w-3" />
          <span>{formatDistanceToNow(question.createdAt, { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;