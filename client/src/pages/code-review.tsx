import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Code, Share2, Filter, Copy, FileText, Download, Link } from "lucide-react";
import { CodeEditor } from "@/components/code-editor";
import { AnalysisResults } from "@/components/analysis-results";
import { LoadingOverlay } from "@/components/loading-overlay";
import { ErrorModal } from "@/components/error-modal";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AnalysisResult } from "@shared/schema";

export default function CodeReview() {
  const [code, setCode] = useState(`def analyze_data(data):
    results = []
    for item in data:
        if item['status'] == 'active':
            if item['score'] > 50:
                item['category'] = 'high'
            elif item['score'] > 20:
                item['category'] = 'medium'
            else:
                item['category'] = 'low'
            
            # Calculate weighted score
            weighted = item['score'] * 1.5
            if weighted > 100:
                weighted = 100
            
            results.append({
                'id': item['id'],
                'name': item['name'],
                'category': item['category'],
                'weighted_score': weighted,
                'processed_at': str(datetime.now())
            })
    
    return results

# Usage example
sample_data = [
    {'id': 1, 'name': 'User A', 'score': 85, 'status': 'active'},
    {'id': 2, 'name': 'User B', 'score': 45, 'status': 'inactive'},
    {'id': 3, 'name': 'User C', 'score': 92, 'status': 'active'}
]

processed = analyze_data(sample_data)
print(processed)`);
  
  const [language, setLanguage] = useState("python");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisId, setAnalysisId] = useState<number | null>(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();

  const analyzeCodeMutation = useMutation({
    mutationFn: async ({ code, language }: { code: string; language: string }) => {
      const response = await apiRequest("POST", "/api/analyze", { code, language });
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      setAnalysisId(data.id);
      toast({
        title: "Analysis Complete",
        description: `Found ${data.summary.totalIssues} issues with a quality score of ${data.qualityScore}%`,
      });
    },
    onError: (error: any) => {
      setErrorMessage(error.message || "Failed to analyze code. Please try again.");
      setShowError(true);
    },
  });

  const handleAnalyze = () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please enter some code to analyze",
        variant: "destructive",
      });
      return;
    }
    analyzeCodeMutation.mutate({ code, language });
  };

  const handleClear = () => {
    setCode("");
    setAnalysisResult(null);
    setAnalysisId(null);
  };

  const handleSave = () => {
    localStorage.setItem("savedCode", JSON.stringify({ code, language }));
    toast({
      title: "Code Saved",
      description: "Your code has been saved locally",
    });
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    toast({
      title: "Export PDF",
      description: "PDF export functionality will be implemented",
    });
  };

  const handleExportJSON = () => {
    if (!analysisResult) return;
    
    const dataStr = JSON.stringify(analysisResult, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `code-analysis-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Export Complete",
      description: "Analysis results exported as JSON",
    });
  };

  const handleShare = () => {
    if (!analysisId) return;
    
    const shareUrl = `${window.location.origin}/analysis/${analysisId}`;
    navigator.clipboard.writeText(shareUrl);
    
    toast({
      title: "Share Link Copied",
      description: "Analysis share link copied to clipboard",
    });
  };

  const handleCopyOptimized = () => {
    if (!analysisResult?.optimizedCode) return;
    
    navigator.clipboard.writeText(analysisResult.optimizedCode);
    toast({
      title: "Copied",
      description: "Optimized code copied to clipboard",
    });
  };

  const lineCount = code.split('\n').length;
  const charCount = code.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Code className="text-white" size={16} />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">AI Code Review Assistant</h1>
                <p className="text-sm text-slate-600">Analyze, optimize, and improve your code</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-slate-600">
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  API Connected
                </span>
              </div>
              <Button onClick={handleShare} disabled={!analysisId} className="bg-blue-600 hover:bg-blue-700">
                <Share2 size={16} className="mr-2" />
                Share Analysis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Code Input Section */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Code Input</h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-slate-700">Language:</label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="typescript">TypeScript</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleClear} className="text-slate-600 hover:text-slate-800">
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
              
              <CodeEditor
                value={code}
                onChange={setCode}
                language={language}
                className="min-h-96"
              />
              
              <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button 
                      onClick={handleAnalyze}
                      disabled={analyzeCodeMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Code size={16} className="mr-2" />
                      Analyze Code
                    </Button>
                    <Button variant="secondary" onClick={handleSave}>
                      <FileText size={16} className="mr-2" />
                      Save
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <span>{lineCount} lines</span>
                    <span>•</span>
                    <span>{charCount} characters</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Analysis Results Section */}
          <div className="lg:col-span-1">
            <AnalysisResults
              analysisResult={analysisResult}
              isAnalyzing={analyzeCodeMutation.isPending}
              onExportPDF={handleExportPDF}
              onExportJSON={handleExportJSON}
              onShare={handleShare}
              onCopyOptimized={handleCopyOptimized}
            />
          </div>
        </div>
      </main>

      {/* Loading Overlay */}
      <LoadingOverlay show={analyzeCodeMutation.isPending} />

      {/* Error Modal */}
      <ErrorModal
        show={showError}
        message={errorMessage}
        onClose={() => setShowError(false)}
        onRetry={handleAnalyze}
      />
    </div>
  );
}
