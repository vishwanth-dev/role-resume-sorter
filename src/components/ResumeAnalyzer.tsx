
import React, { useState } from 'react';
import { Search, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
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
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('openai_api_key') || '');
  const { toast } = useToast();

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    setResult(null);
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.value;
    setApiKey(key);
    localStorage.setItem('openai_api_key', key);
  };

  const analyzeResume = async () => {
    if (!file) return;
    if (!apiKey) {
      toast({
        title: "API Key Missing",
        description: "Please enter your OpenAI API key to analyze resumes.",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    try {
      // Read the file content
      const fileContent = await file.text();
      
      // Prepare the OpenAI API request
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
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
        <div className="mb-4">
          <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-1">
            OpenAI API Key
          </label>
          <input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="Enter your OpenAI API key"
            className="w-full p-2 border rounded-md"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your API key is stored locally in your browser and never sent to our servers.
          </p>
        </div>

        {!apiKey && (
          <Alert className="mb-4">
            <AlertTitle>API Key Required</AlertTitle>
            <AlertDescription>
              You need to provide your OpenAI API key to use the resume analyzer.
              Get your API key from the <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">OpenAI dashboard</a>.
            </AlertDescription>
          </Alert>
        )}
        
        <FileUploader onFileUpload={handleFileUpload} currentFile={file} />
        
        {file && apiKey && (
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
