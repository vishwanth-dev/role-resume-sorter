import React from "react";
import { Card } from "@/components/ui/card";
import type { AnalysisResult } from "./ResumeAnalyzer";

interface ResultsDisplayProps {
  result: AnalysisResult;
}

const ResultsDisplay = ({ result }: ResultsDisplayProps) => {
  return (
    <Card className="p-6 bg-white">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        Analysis Results
      </h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Detected Role
          </h3>
          <p className="text-xl font-semibold text-blue-600">{result.role}</p>
          <p className="text-sm text-gray-600 mt-1">
            Industry: {result.industry}
          </p>
          <p className="text-sm text-gray-600">Seniority: {result.seniority}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Confidence Score
          </h3>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 rounded-full h-2"
              style={{ width: `${result.confidence * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {Math.round(result.confidence * 100)}% match
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Experience & Education
          </h3>
          <p className="text-sm text-gray-700">{result.experience}</p>
          <p className="text-sm text-gray-700 mt-1">{result.education}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Technical Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.skills.technical.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Soft Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.skills.soft.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Key Keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ResultsDisplay;
