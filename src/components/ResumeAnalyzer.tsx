import React, { useState, useEffect } from "react";
import { Search, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import FileUploader from "./FileUploader";
import ResultsDisplay from "./ResultsDisplay";
import { supabase } from "@/integrations/supabase/client";

export type AnalysisResult = {
  role: string;
  confidence: number;
  keywords: string[];
  experience: string;
  education: string;
  skills: {
    technical: string[];
    soft: string[];
  };
  industry: string;
  seniority: string;
};

const ResumeAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [apiKey, setApiKey] = useState<string>(
    () => localStorage.getItem("openai_api_key") || ""
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    setResult(null);
    setErrorMessage(null);
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.value;
    setApiKey(key);
    localStorage.setItem("openai_api_key", key);
    setErrorMessage(null); // Clear any previous error when API key is changed
  };

  // Check if there are previous analyses in Supabase when component mounts
  useEffect(() => {
    const fetchPreviousAnalyses = async () => {
      try {
        const { data, error } = await supabase
          .from("resume_analyses")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          console.log("Found previous analysis:", data[0]);
        }
      } catch (err) {
        console.error("Error fetching previous analyses:", err);
      }
    };

    fetchPreviousAnalyses();
  }, []);

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
    setErrorMessage(null);

    try {
      // Read the file content
      const fileContent = await file.text();

      // Validate file content
      if (!fileContent.trim()) {
        throw new Error(
          "The uploaded file appears to be empty. Please check the file and try again."
        );
      }

      // Truncate content if it's too long (approximately 4000 characters)
      const truncatedContent =
        fileContent.length > 4000
          ? fileContent.substring(0, 4000) + "..."
          : fileContent;

      // Prepare the OpenAI API request with enhanced system prompt
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are an expert resume analyzer. Analyze the provided resume and return ONLY a raw JSON object (no markdown, no code blocks, no formatting) with the following structure:

{
  "role": "specific job title based on experience and skills",
  "confidence": number between 0.1 and 1.0,
  "keywords": ["at least 3 relevant skills or technologies"],
  "experience": "specific years of experience",
  "education": "highest education level",
  "skills": {
    "technical": ["at least 3 technical skills"],
    "soft": ["at least 3 soft skills"]
  },
  "industry": "specific industry sector",
  "seniority": "specific level (Entry, Mid, Senior, Lead, etc.)"
}

IMPORTANT:
- Return ONLY the raw JSON object
- Do not include any markdown formatting, code blocks, or backticks
- Do not include any explanations or additional text
- Do not return default or empty values
- Be specific and detailed in your analysis
- Ensure all arrays have at least 3 items
- Confidence should be between 0.1 and 1.0
- Role should be a specific job title
- Industry should be a specific sector
- Seniority should be a specific level`,
              },
              {
                role: "user",
                content: truncatedContent,
              },
            ],
            temperature: 0.1,
            max_tokens: 500,
          }),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        const errorMsg = responseData.error?.message || "Analysis failed";
        console.error("OpenAI API error:", responseData.error);

        if (responseData.error?.type === "insufficient_quota") {
          setErrorMessage(
            "Your OpenAI account has insufficient quota. Please check your billing details or use a different API key. You can get a new API key from the OpenAI dashboard."
          );
        } else if (responseData.error?.type === "invalid_request_error") {
          setErrorMessage(
            "There was an issue with the API request. Please check your API key and try again."
          );
        } else if (responseData.error?.type === "model_not_found") {
          setErrorMessage(
            "The selected model is not available. Please try again with a different model or check your API access."
          );
        } else if (errorMsg.includes("Request too large")) {
          setErrorMessage(
            "The resume content is too large to process. Please try with a shorter resume or contact support for assistance."
          );
        } else {
          setErrorMessage(errorMsg);
        }

        throw new Error(errorMsg);
      }

      let analysisResult;
      try {
        const content = responseData.choices[0].message.content.trim();
        // Remove any markdown code block formatting if present
        const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();

        // Check if the response starts with a JSON object
        if (!cleanContent.startsWith("{")) {
          throw new Error("Invalid response format from the model");
        }
        analysisResult = JSON.parse(cleanContent);

        // Validate the analysis result
        if (
          analysisResult.role === "unknown" ||
          analysisResult.confidence === 0 ||
          analysisResult.keywords.length === 0 ||
          analysisResult.skills.technical.length === 0 ||
          analysisResult.skills.soft.length === 0 ||
          analysisResult.industry === "unknown" ||
          analysisResult.seniority === "unknown"
        ) {
          throw new Error(
            "The analysis result is incomplete or contains default values. Please try again."
          );
        }
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        setErrorMessage(
          "The analysis result was not in the expected format. Please try again."
        );
        throw new Error("Failed to parse analysis result");
      }

      // Combine all analysis data into keywords array for storage
      const allKeywords = [
        ...analysisResult.keywords,
        `Experience: ${analysisResult.experience}`,
        `Education: ${analysisResult.education}`,
        `Industry: ${analysisResult.industry}`,
        `Seniority: ${analysisResult.seniority}`,
        ...analysisResult.skills.technical.map(
          (skill) => `Technical: ${skill}`
        ),
        ...analysisResult.skills.soft.map((skill) => `Soft: ${skill}`),
      ];

      // Store the analysis result in Supabase
      const { error: supabaseError } = await supabase
        .from("resume_analyses")
        .insert({
          file_name: file.name,
          role: analysisResult.role,
          confidence: analysisResult.confidence,
          keywords: allKeywords,
        });

      if (supabaseError) {
        console.error("Supabase error:", supabaseError);
        setErrorMessage("Failed to save analysis results to database");
        throw new Error("Failed to save analysis results");
      }

      setResult(analysisResult);
      toast({
        title: "Analysis Complete",
        description: "Your resume has been successfully analyzed and saved.",
      });
    } catch (error) {
      console.error("Analysis error:", error);

      if (!errorMessage) {
        toast({
          title: "Analysis Failed",
          description:
            error instanceof Error
              ? error.message
              : "There was an error analyzing your resume. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-4">
          <label
            htmlFor="api-key"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
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
            Your API key is stored locally in your browser and never sent to our
            servers.
          </p>
        </div>

        {!apiKey && (
          <Alert className="mb-4">
            <AlertTitle>API Key Required</AlertTitle>
            <AlertDescription>
              You need to provide your OpenAI API key to use the resume
              analyzer. Get your API key from the{" "}
              <a
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                OpenAI dashboard
              </a>
              .
            </AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert className="mb-4" variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
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

        {analyzing && <Progress value={66} className="mt-4" />}
      </Card>

      {result && <ResultsDisplay result={result} />}
    </div>
  );
};

export default ResumeAnalyzer;
