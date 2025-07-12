import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Eye, ArrowUp, User, CheckCircle, Clock, Award } from 'lucide-react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  onClick: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onClick }) => {
  const hasAcceptedAnswer = question.answers.some(answer => answer.isAccepted);

  return (
    <div 
      onClick={onClick}
      className="group bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-6 lg:p-8 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 cursor-pointer hover:border-blue-300/50 hover:bg-white/95 transform hover:-translate-y-2 hover:scale-[1.02]"
    >
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 flex-1 leading-tight">
              {question.title}
            </h3>
            {hasAcceptedAnswer && (
              <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-3 py-1.5 rounded-full text-xs font-medium border border-green-200 shadow-sm">
                <CheckCircle className="h-3 w-3" />
                <span>Solved</span>
              </div>
            )}
          </div>
          
          <div 
            className="text-gray-600 text-sm lg:text-base line-clamp-3 mb-6 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: question.description }}
          />
          
          <div className="flex flex-wrap gap-2 mb-6">
            {question.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 text-blue-800 hover:from-blue-200 hover:via-purple-200 hover:to-pink-200 transition-all duration-300 border border-blue-200/50 shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        {/* Stats - Desktop */}
        <div className="hidden lg:flex flex-col items-center space-y-4 text-sm">
          <div className="flex flex-col items-center space-y-2 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl shadow-sm border border-gray-200/50 min-w-[80px]">
            <div className="flex items-center space-x-1 text-blue-600">
              <ArrowUp className="h-4 w-4" />
              <span className="font-semibold text-lg">{question.votes}</span>
            </div>
            <span className="text-xs text-gray-500 font-medium">votes</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl shadow-sm border border-gray-200/50 min-w-[80px]">
            <div className="flex items-center space-x-1 text-green-600">
              <MessageSquare className="h-4 w-4" />
              <span className="font-semibold text-lg">{question.answers.length}</span>
            </div>
            <span className="text-xs text-gray-500 font-medium">answers</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl shadow-sm border border-gray-200/50 min-w-[80px]">
            <div className="flex items-center space-x-1 text-purple-600">
              <Eye className="h-4 w-4" />
              <span className="font-semibold text-lg">{question.views}</span>
            </div>
            <span className="text-xs text-gray-500 font-medium">views</span>
          </div>
        </div>
      </div>
      
      {/* Stats - Mobile */}
      <div className="lg:hidden flex items-center justify-between text-sm mb-6">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-1 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
            <ArrowUp className="h-4 w-4" />
            <span className="font-semibold">{question.votes}</span>
          </div>
          <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            <MessageSquare className="h-4 w-4" />
            <span className="font-semibold">{question.answers.length}</span>
          </div>
          <div className="flex items-center space-x-1 text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full">
            <Eye className="h-4 w-4" />
            <span className="font-semibold">{question.views}</span>
          </div>
        </div>
      </div>
      
      <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{question.author.username}</span>
            <div className="flex items-center space-x-1 text-gray-500 text-xs">
              <Award className="h-3 w-3" />
              <span>{question.author.reputation} reputation</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1 text-gray-500 text-xs bg-gray-50 px-3 py-2 rounded-full border border-gray-200/50">
          <Clock className="h-3 w-3" />
          <span>{formatDistanceToNow(question.createdAt, { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;