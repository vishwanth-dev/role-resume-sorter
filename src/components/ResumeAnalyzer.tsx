
import React, { useState } from 'react';
import { Search, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import FileUploader from './FileUploader';
import ResultsDisplay from './ResultsDisplay';

export type AnalysisResult = {
  role: string;
  confidence: number;
  keywords: string[];
};

const ResumeAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    setResult(null);
  };

  const analyzeResume = async () => {
    if (!file) return;

    setAnalyzing(true);
    try {
      // Read the file content
      const fileContent = await file.text();
      
      // Prepare the OpenAI API request
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // You'll need to set this up
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a professional resume analyzer. Analyze the resume content and provide a job role categorization, confidence score, and key skills detected. Return the response in JSON format with fields: role (string), confidence (number between 0-1), and keywords (array of strings).'
            },
            {
              role: 'user',
              content: fileContent
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      const analysisResult = JSON.parse(data.choices[0].message.content);
      
      setResult(analysisResult);
      toast({
        title: "Analysis Complete",
        description: "Your resume has been successfully analyzed.",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <FileUploader onFileUpload={handleFileUpload} currentFile={file} />
        
        {file && (
          <div className="mt-4 flex justify-center">
            <Button
              onClick={analyzeResume}
              disabled={analyzing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {analyzing ? (
                <>
                  <Search className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Analyze Resume
                </>
              )}
            </Button>
          </div>
        )}
        
        {analyzing && (
          <Progress value={66} className="mt-4" />
        )}
      </Card>

      {result && <ResultsDisplay result={result} />}
    </div>
  );
};

export default ResumeAnalyzer;
