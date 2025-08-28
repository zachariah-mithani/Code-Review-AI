import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Filter, FileText, Download, Link, Copy, AlertCircle, AlertTriangle, Info, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalysisResult, AnalysisIssue } from "@shared/schema";

interface AnalysisResultsProps {
  analysisResult: AnalysisResult | null;
  isAnalyzing: boolean;
  onExportPDF: () => void;
  onExportJSON: () => void;
  onShare: () => void;
  onCopyOptimized: () => void;
}

export function AnalysisResults({
  analysisResult,
  isAnalyzing,
  onExportPDF,
  onExportJSON,
  onShare,
  onCopyOptimized,
}: AnalysisResultsProps) {
  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'suggestion':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'optimization':
        return <Zap className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  const getIssueColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-amber-500';
      case 'suggestion':
        return 'bg-blue-500';
      case 'optimization':
        return 'bg-emerald-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getIssueTextColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-700';
      case 'warning':
        return 'text-amber-700';
      case 'suggestion':
        return 'text-blue-700';
      case 'optimization':
        return 'text-emerald-700';
      default:
        return 'text-slate-700';
    }
  };

  const formatLastAnalyzed = () => {
    if (!analysisResult) return '';
    return 'Just now';
  };

  return (
    <div className="space-y-6">
      {/* Analysis Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Analysis Summary</CardTitle>
            <div className="flex items-center space-x-2">
              {isAnalyzing && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
              {analysisResult && (
                <span className="text-xs text-slate-500">
                  Last analyzed: {formatLastAnalyzed()}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {analysisResult ? (
            <>
              {/* Overall Score */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Code Quality Score</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {analysisResult.qualityScore}
                  </span>
                </div>
                <Progress value={analysisResult.qualityScore} className="h-2" />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">
                    {analysisResult.summary.totalIssues}
                  </div>
                  <div className="text-sm text-slate-600">Issues Found</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">
                    {analysisResult.summary.totalIssues}
                  </div>
                  <div className="text-sm text-slate-600">Suggestions</div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Info className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p>Click "Analyze Code" to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Issues & Suggestions */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Issues & Suggestions</CardTitle>
              <Button variant="ghost" size="sm">
                <Filter className="w-4 h-4 mr-1" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {analysisResult.issues.map((issue, index) => (
                <div
                  key={index}
                  className="border-b border-slate-100 p-4 hover:bg-slate-50 transition-colors duration-200 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    <div className={cn("flex-shrink-0 w-2 h-2 rounded-full mt-2", getIssueColor(issue.type))} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={cn("text-sm font-medium", getIssueTextColor(issue.type))}>
                          {issue.category}
                        </span>
                        <span className="text-xs text-slate-500">
                          {issue.line > 0 ? `Line ${issue.line}` : 'General'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 mt-1">{issue.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Optimized Code Suggestion */}
      {analysisResult?.optimizedCode && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Optimized Code</CardTitle>
              <Button variant="ghost" size="sm" onClick={onCopyOptimized}>
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-code-bg text-code-text p-4 text-sm font-mono leading-relaxed rounded-lg overflow-x-auto">
              <pre className="whitespace-pre-wrap">
                {analysisResult.optimizedCode}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Options */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>Export Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                onClick={onExportPDF}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export as PDF
              </Button>
              <Button
                onClick={onExportJSON}
                className="w-full bg-slate-600 hover:bg-slate-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export as JSON
              </Button>
              <Button
                onClick={onShare}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Link className="w-4 h-4 mr-2" />
                Generate Share Link
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
