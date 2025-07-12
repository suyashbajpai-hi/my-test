import React, { useState } from 'react';
import { ArrowLeft, X, Sparkles, HelpCircle, Lightbulb, Tag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import RichTextEditor from './RichTextEditor';

interface AskQuestionPageProps {
  onBack: () => void;
}

const AskQuestionPage: React.FC<AskQuestionPageProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { addQuestion } = useData();
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    
    if (formData.title.trim().length < 10) {
      setError('Title must be at least 10 characters long');
      return;
    }
    
    if (formData.description.trim().length < 20) {
      setError('Description must be at least 20 characters long');
      return;
    }
    
    if (formData.tags.length === 0) {
      setError('Please add at least one tag');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addQuestion({
        title: formData.title.trim(),
        description: formData.description,
        tags: formData.tags,
        authorId: user.id,
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        tags: []
      });
      
      onBack();
    } catch (err) {
      console.error('Failed to submit question:', err);
      setError('Failed to submit question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center glass-effect rounded-3xl p-8 lg:p-12 shadow-2xl max-w-md w-full">
          <div className="w-16 h-16 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg glow-effect">
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Please sign in to ask a question</h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Join our community to start asking questions and sharing knowledge.</p>
          <button
            onClick={onBack}
            className="bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] hover:from-[var(--accent-primary)]/90 hover:via-[var(--accent-secondary)]/90 hover:to-[var(--accent-tertiary)]/90 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg glow-effect"
          >
            Go back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center font-medium mb-6 glass-effect px-4 py-2.5 rounded-2xl hover:bg-[color:var(--bg-tertiary)] transition-all duration-300 shadow-sm hover:shadow-md"
            style={{ color: 'var(--accent-primary)' }}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Questions
          </button>
          
          <div className="glass-effect rounded-3xl p-6 lg:p-8 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] rounded-2xl flex items-center justify-center shadow-lg glow-effect">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold gradient-text">
                  Ask a Question
                </h1>
                <p className="mt-1 text-sm lg:text-base" style={{ color: 'var(--text-secondary)' }}>
                  Get help from the community by asking a clear, specific question.
                </p>
              </div>
            </div>

            {/* Tips Section */}
            <div className="glass-effect rounded-2xl p-6 mb-8 border" style={{ borderColor: 'var(--accent-primary)' }}>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Tips for asking a great question:</h3>
                  <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    <li>• Be specific and clear about what you're trying to achieve</li>
                    <li>• Include relevant code, error messages, or examples</li>
                    <li>• Mention what you've already tried</li>
                    <li>• Use relevant tags to help others find your question</li>
                  </ul>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl flex items-center space-x-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex-shrink-0"></div>
                  <span>{error}</span>
                </div>
              )}

              {/* Title */}
              <div className="space-y-3">
                <label htmlFor="title" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Be specific and imagine you're asking a question to another person"
                  className="w-full px-4 py-3 glass-effect rounded-2xl focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/50 focus:border-[color:var(--accent-primary)]/50 focus:bg-[color:var(--bg-tertiary)] transition-all duration-300"
                  style={{ color: 'var(--text-primary)' }}
                  maxLength={200}
                />
                <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-2">
                  <span style={{ color: 'var(--text-tertiary)' }}>
                    Be specific and clear about what you're asking
                  </span>
                  <span className={`font-medium ${formData.title.length < 10 ? 'text-red-400' : 'text-green-400'}`}>
                    {formData.title.length}/200 characters (minimum 10)
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Description *
                </label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                  placeholder="Provide all the details someone would need to help you. Include any code, error messages, or relevant context."
                  minHeight="300px"
                />
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  Include code snippets, error messages, and what you've already tried
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold flex items-center" style={{ color: 'var(--text-primary)' }}>
                  <Tag className="h-4 w-4 mr-2" />
                  Tags *
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium glass-effect border shadow-sm"
                      style={{ color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 transition-colors"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagInputKeyPress}
                    placeholder="Add tags (e.g., react, javascript, css)"
                    className="flex-1 px-4 py-3 glass-effect rounded-2xl focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/50 focus:border-[color:var(--accent-primary)]/50 focus:bg-[color:var(--bg-tertiary)] transition-all duration-300"
                    style={{ color: 'var(--text-primary)' }}
                    disabled={formData.tags.length >= 5}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={!tagInput.trim() || formData.tags.length >= 5}
                    className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-2xl transition-all duration-300 font-medium shadow-sm hover:shadow-md"
                  >
                    Add Tag
                  </button>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  Add up to 5 tags to categorize your question ({formData.tags.length}/5)
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <button
                  type="button"
                  onClick={onBack}
                  className="px-6 py-3 glass-effect rounded-2xl transition-all duration-300 font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] hover:from-[var(--accent-primary)]/90 hover:via-[var(--accent-secondary)]/90 hover:to-[var(--accent-tertiary)]/90 disabled:from-[var(--accent-primary)]/50 disabled:via-[var(--accent-secondary)]/50 disabled:to-[var(--accent-tertiary)]/50 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl glow-effect"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Posting Question...</span>
                    </div>
                  ) : (
                    'Post Question'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskQuestionPage;