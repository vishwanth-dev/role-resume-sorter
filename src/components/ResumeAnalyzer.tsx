
import React, { useState } from 'react';
import { Upload, FileText, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
      // Simulate analysis with mock data (replace with actual analysis logic)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResult: AnalysisResult = {
        role: "Software Engineer",
        confidence: 0.89,
        keywords: ["React", "JavaScript", "TypeScript", "Full Stack", "API Development"]
      };
      
      setResult(mockResult);
      toast({
        title: "Analysis Complete",
        description: "Your resume has been successfully analyzed.",
      });
    } catch (error) {
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
      </Card>

      {result && <ResultsDisplay result={result} />}
    </div>
  );
};

export default ResumeAnalyzer;
