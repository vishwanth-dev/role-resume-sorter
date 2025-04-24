
import React from 'react';
import ResumeAnalyzer from '@/components/ResumeAnalyzer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">
          Resume Role Analyzer
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Upload your resume to analyze and categorize your professional role
        </p>
        <ResumeAnalyzer />
      </div>
    </div>
  );
};

export default Index;
