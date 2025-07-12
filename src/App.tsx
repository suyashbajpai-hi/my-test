import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import HomePage from './components/HomePage';
import AskQuestionPage from './components/AskQuestionPage';
import QuestionDetailPage from './components/QuestionDetailPage';
import ProfilePage from './components/ProfilePage';
import { Question } from './types';

type PageType = 'home' | 'ask' | 'question' | 'profile';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const handleQuestionClick = (question: Question) => {
    setSelectedQuestion(question);
    setCurrentPage('question');
  };

  const handleAskQuestion = () => {
    setCurrentPage('ask');
  };

  const handleProfile = () => {
    setCurrentPage('profile');
  };

  const handleHome = () => {
    setCurrentPage('home');
    setSelectedQuestion(null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'ask':
        return <AskQuestionPage onBack={handleHome} />;
      case 'question':
        return selectedQuestion ? (
          <QuestionDetailPage question={selectedQuestion} onBack={handleHome} />
        ) : (
          <HomePage onQuestionClick={handleQuestionClick} />
        );
      case 'profile':
        return <ProfilePage onBack={handleHome} />;
      case 'home':
      default:
        return <HomePage onQuestionClick={handleQuestionClick} />;
    }
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <div className="min-h-screen relative overflow-hidden">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 grid-pattern grid-pattern-dark opacity-30"></div>
            {/* Main content */}
            <div className="relative z-10">
              <Header 
                onAskQuestion={handleAskQuestion} 
                onHome={handleHome} 
                onProfile={handleProfile}
              />
              <main className="relative">
                {renderPage()}
              </main>
            </div>
          </div>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;