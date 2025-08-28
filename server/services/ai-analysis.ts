import { AnalysisResult, AnalysisIssue } from "@shared/schema";

// Using Hugging Face API for free AI code analysis
const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/bigscience/bloom-560m";
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || "";

export async function analyzeCode(code: string, language: string): Promise<AnalysisResult> {
  // Use comprehensive rule-based analysis - it's reliable and thorough
  const result = createBasicAnalysis(code, language);
  
  // Add intelligent insights based on code patterns
  result.issues.push(...generateAdvancedInsights(code, language));
  
  // Group similar issues together
  result.issues = groupSimilarIssues(result.issues);
  
  // Update summary with new issues
  result.summary = {
    totalIssues: result.issues.length,
    errorCount: result.issues.filter(i => i.type === "error").length,
    warningCount: result.issues.filter(i => i.type === "warning").length,
    suggestionCount: result.issues.filter(i => i.type === "suggestion").length,
    optimizationCount: result.issues.filter(i => i.type === "optimization").length,
  };
  
  return result;
}

// Group similar issues to reduce repetition
function groupSimilarIssues(issues: AnalysisIssue[]): AnalysisIssue[] {
  const groupedMap = new Map<string, AnalysisIssue[]>();
  
  // Group issues by message and category
  issues.forEach(issue => {
    const key = `${issue.message}-${issue.category}`;
    if (!groupedMap.has(key)) {
      groupedMap.set(key, []);
    }
    groupedMap.get(key)!.push(issue);
  });
  
  // Convert groups back to single issues with line ranges
  const groupedIssues: AnalysisIssue[] = [];
  
  groupedMap.forEach((similarIssues, key) => {
    if (similarIssues.length === 1) {
      groupedIssues.push(similarIssues[0]);
    } else {
      // Create a grouped issue with line ranges
      const lines = similarIssues.map(i => i.line).sort((a, b) => a - b);
      const firstIssue = similarIssues[0];
      
      let lineInfo = "";
      if (lines.length === 2) {
        lineInfo = ` (lines ${lines[0]} and ${lines[1]})`;
      } else if (lines.length <= 5) {
        lineInfo = ` (lines ${lines.join(', ')})`;
      } else {
        lineInfo = ` (${lines.length} occurrences)`;
      }
      
      groupedIssues.push({
        ...firstIssue,
        line: lines[0], // Use first line as primary
        message: firstIssue.message + lineInfo
      });
    }
  });
  
  return groupedIssues;
}

// Generate advanced insights based on code patterns
function generateAdvancedInsights(code: string, language: string): AnalysisIssue[] {
  const insights: AnalysisIssue[] = [];
  const lines = code.split('\n');
  
  // Code complexity analysis
  const codeComplexity = calculateComplexity(code);
  if (codeComplexity > 10) {
    insights.push({
      type: "optimization",
      severity: "medium",
      line: 0,
      message: `Code complexity is high (${codeComplexity}). Consider breaking into smaller functions.`,
      category: "Code Complexity"
    });
  }
  
  // Documentation analysis
  const hasDocumentation = checkDocumentation(code, language);
  if (!hasDocumentation) {
    insights.push({
      type: "suggestion",
      severity: "low",
      line: 0,
      message: "Consider adding documentation comments to improve code maintainability.",
      category: "Documentation"
    });
  }
  
  // Performance insights
  const performanceIssues = findPerformanceIssues(code, language);
  insights.push(...performanceIssues);
  
  return insights;
}

function calculateComplexity(code: string): number {
  let complexity = 1;
  const patterns = [
    /if\s*\(/g,
    /else\s*if\s*\(/g,
    /while\s*\(/g,
    /for\s*\(/g,
    /switch\s*\(/g,
    /catch\s*\(/g,
    /&&/g,
    /\|\|/g
  ];
  
  patterns.forEach(pattern => {
    const matches = code.match(pattern);
    if (matches) {
      complexity += matches.length;
    }
  });
  
  return complexity;
}

function checkDocumentation(code: string, language: string): boolean {
  if (language === 'javascript' || language === 'typescript') {
    return code.includes('/**') || code.includes('//');
  }
  if (language === 'python') {
    return code.includes('"""') || code.includes('#');
  }
  if (language === 'java') {
    return code.includes('/**') || code.includes('//');
  }
  return false;
}

function findPerformanceIssues(code: string, language: string): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];
  const lines = code.split('\n');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Check for inefficient loops
    if (language === 'javascript' || language === 'typescript') {
      if (line.includes('for') && line.includes('.length')) {
        issues.push({
          type: "optimization",
          severity: "low",
          line: lineNum,
          message: "Consider caching array length in loop for better performance",
          category: "Performance"
        });
      }
      
      // Check for repeated DOM queries
      if (line.includes('document.') && line.includes('querySelector')) {
        issues.push({
          type: "optimization",
          severity: "medium",
          line: lineNum,
          message: "Consider caching DOM queries to avoid repeated lookups",
          category: "Performance"
        });
      }
    }
    
    if (language === 'python') {
      // Check for inefficient string concatenation
      if (line.includes('+=') && line.includes('"')) {
        issues.push({
          type: "optimization",
          severity: "medium",
          line: lineNum,
          message: "Consider using join() for string concatenation in loops",
          category: "Performance"
        });
      }
    }
  });
  
  return issues;
}





// Comprehensive code analysis function
function createBasicAnalysis(code: string, language: string): AnalysisResult {
  const lines = code.split('\n');
  const issues: AnalysisIssue[] = [];
  let qualityScore = 85;

  // Language-specific analysis
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();
    
    // JavaScript/TypeScript specific checks
    if (language === 'javascript' || language === 'typescript') {
      // Variable declaration improvements
      if (line.includes('var ')) {
        issues.push({
          type: 'suggestion',
          severity: 'medium',
          line: lineNum,
          message: 'Consider using let or const instead of var for better scoping',
          category: 'Modern JavaScript'
        });
        qualityScore -= 8;
      }
      
      // Equality checks
      if (line.includes('==') && !line.includes('===') && !line.includes('!=') && !line.includes('!==')) {
        issues.push({
          type: 'warning',
          severity: 'medium',
          line: lineNum,
          message: 'Use strict equality (===) instead of loose equality (==)',
          category: 'Best Practices'
        });
        qualityScore -= 10;
      }
      
      // Console statements
      if (line.includes('console.log') || line.includes('console.warn') || line.includes('console.error')) {
        issues.push({
          type: 'warning',
          severity: 'low',
          line: lineNum,
          message: 'Remove console statements in production code',
          category: 'Code Quality'
        });
        qualityScore -= 3;
      }
      
      // Function improvements
      if (line.includes('function(') && !line.includes('function (')) {
        issues.push({
          type: 'suggestion',
          severity: 'low',
          line: lineNum,
          message: 'Add space after function keyword for better readability',
          category: 'Code Style'
        });
        qualityScore -= 2;
      }
      
      // Arrow function suggestions
      if (line.includes('function(') && line.includes('return ') && line.split('return').length === 2) {
        issues.push({
          type: 'optimization',
          severity: 'low',
          line: lineNum,
          message: 'Consider using arrow function for concise syntax',
          category: 'Modern JavaScript'
        });
        qualityScore -= 3;
      }
      
      // Error handling
      if (line.includes('try {') && !code.includes('catch')) {
        issues.push({
          type: 'error',
          severity: 'high',
          line: lineNum,
          message: 'Try block should have corresponding catch block',
          category: 'Error Handling'
        });
        qualityScore -= 15;
      }
      
      // Security checks
      if (line.includes('eval(') || line.includes('innerHTML')) {
        issues.push({
          type: 'error',
          severity: 'high',
          line: lineNum,
          message: 'Avoid eval() and innerHTML for security reasons',
          category: 'Security'
        });
        qualityScore -= 20;
      }
    }
    
    // Python specific checks
    if (language === 'python') {
      // Import organization
      if (trimmedLine.startsWith('import ') && lineNum > 10) {
        issues.push({
          type: 'suggestion',
          severity: 'medium',
          line: lineNum,
          message: 'Imports should be at the top of the file (PEP 8)',
          category: 'PEP 8 Style'
        });
        qualityScore -= 8;
      }
      
      // Function naming
      if (trimmedLine.startsWith('def ') && /def [A-Z]/.test(trimmedLine)) {
        issues.push({
          type: 'warning',
          severity: 'medium',
          line: lineNum,
          message: 'Function names should be lowercase with underscores (snake_case)',
          category: 'PEP 8 Style'
        });
        qualityScore -= 8;
      }
      
      // Exception handling
      if (trimmedLine.includes('except:') && !trimmedLine.includes('except Exception:')) {
        issues.push({
          type: 'warning',
          severity: 'high',
          line: lineNum,
          message: 'Avoid bare except clauses, specify exception type',
          category: 'Error Handling'
        });
        qualityScore -= 12;
      }
      
      // String formatting
      if (line.includes('print(') && line.includes('+')) {
        issues.push({
          type: 'suggestion',
          severity: 'low',
          line: lineNum,
          message: 'Consider using f-strings or .format() for string formatting',
          category: 'Modern Python'
        });
        qualityScore -= 3;
      }
      
      // Dictionary access patterns (only suggest for potentially unsafe access)
      if (line.includes("['") && line.includes("']") && !line.includes("=") && !line.includes("if ")) {
        issues.push({
          type: 'suggestion',
          severity: 'low',
          line: lineNum,
          message: 'Consider using .get() method for safer dictionary access',
          category: 'Best Practices'
        });
        qualityScore -= 3;
      }
      
      // Missing imports
      if (line.includes('datetime.now()') && !code.includes('import datetime') && !code.includes('from datetime')) {
        issues.push({
          type: 'error',
          severity: 'high',
          line: lineNum,
          message: 'Missing import for datetime module',
          category: 'Import Error'
        });
        qualityScore -= 20;
      }
      
      // Data mutation in loops (only flag actual mutations)
      if (line.includes('for ') && line.includes(' in ') && 
          (line.includes('del ') || line.includes('.pop(') || line.includes('.remove('))) {
        issues.push({
          type: 'warning',
          severity: 'medium',
          line: lineNum,
          message: 'Modifying dictionary/list structure during iteration can cause issues',
          category: 'Data Safety'
        });
        qualityScore -= 10;
      }
      
      // List comprehension opportunities
      if (line.includes('for ') && line.includes('append(') && code.includes('results = []')) {
        issues.push({
          type: 'optimization',
          severity: 'low',
          line: lineNum,
          message: 'Consider using list comprehension for better performance',
          category: 'Performance'
        });
        qualityScore -= 5;
      }
    }
    
    // Java specific checks
    if (language === 'java') {
      // Class naming
      if (trimmedLine.startsWith('class ') && /class [a-z]/.test(trimmedLine)) {
        issues.push({
          type: 'warning',
          severity: 'medium',
          line: lineNum,
          message: 'Class names should start with uppercase (PascalCase)',
          category: 'Java Conventions'
        });
        qualityScore -= 8;
      }
      
      // Method naming
      if (trimmedLine.includes('public ') && /public [A-Z]/.test(trimmedLine) && !trimmedLine.includes('class')) {
        issues.push({
          type: 'warning',
          severity: 'medium',
          line: lineNum,
          message: 'Method names should start with lowercase (camelCase)',
          category: 'Java Conventions'
        });
        qualityScore -= 8;
      }
    }
    
    // General code quality checks
    if (line.length > 120) {
      issues.push({
        type: 'suggestion',
        severity: 'low',
        line: lineNum,
        message: 'Line exceeds 120 characters, consider breaking it up',
        category: 'Code Style'
      });
      qualityScore -= 2;
    }
    
    // Magic numbers (exclude common values and literals)
    const magicNumberMatch = line.match(/\b(\d{2,})\b/);
    if (magicNumberMatch && !line.includes('//') && !line.includes('#') && 
        !line.includes('range(') && !line.includes('print(') && 
        !['10', '100', '1000'].includes(magicNumberMatch[1])) {
      issues.push({
        type: 'suggestion',
        severity: 'medium',
        line: lineNum,
        message: 'Consider extracting magic numbers into named constants',
        category: 'Maintainability'
      });
      qualityScore -= 5;
    }
    
    // TODO/FIXME comments
    if (line.includes('TODO') || line.includes('FIXME')) {
      issues.push({
        type: 'warning',
        severity: 'low',
        line: lineNum,
        message: 'TODO/FIXME comment found - consider addressing',
        category: 'Code Quality'
      });
      qualityScore -= 3;
    }
  });

  // Global checks
  const codeContent = code.toLowerCase();
  
  // Check for proper error handling
  if (codeContent.includes('try') && !codeContent.includes('catch') && !codeContent.includes('except')) {
    issues.push({
      type: 'error',
      severity: 'high',
      line: 0,
      message: 'Error handling appears incomplete',
      category: 'Error Handling'
    });
    qualityScore -= 15;
  }
  
  // Check for function complexity (basic heuristic)
  const functionCount = (codeContent.match(/function|def /g) || []).length;
  const lineCount = lines.length;
  if (functionCount > 0 && lineCount / functionCount > 50) {
    issues.push({
      type: 'optimization',
      severity: 'medium',
      line: 0,
      message: 'Functions appear to be quite large, consider breaking them down',
      category: 'Code Organization'
    });
    qualityScore -= 10;
  }

  // Ensure quality score doesn't go below 0
  qualityScore = Math.max(0, qualityScore);

  // Generate optimized code suggestion if there are issues
  let optimizedCode = undefined;
  if (issues.length > 0 && (language === 'javascript' || language === 'typescript')) {
    optimizedCode = generateOptimizedJavaScript(code, issues);
  }

  return {
    qualityScore,
    issues,
    optimizedCode,
    summary: {
      totalIssues: issues.length,
      errorCount: issues.filter(i => i.type === 'error').length,
      warningCount: issues.filter(i => i.type === 'warning').length,
      suggestionCount: issues.filter(i => i.type === 'suggestion').length,
      optimizationCount: issues.filter(i => i.type === 'optimization').length,
    }
  };
}

// Generate optimized JavaScript code
function generateOptimizedJavaScript(code: string, issues: AnalysisIssue[]): string {
  let optimized = code;
  
  // Fix common issues
  optimized = optimized.replace(/var /g, 'const ');
  optimized = optimized.replace(/==/g, '===');
  optimized = optimized.replace(/!=/g, '!==');
  optimized = optimized.replace(/console\.log\([^)]*\);?\s*\n?/g, '');
  optimized = optimized.replace(/function\(/g, 'function (');
  
  return optimized;
}
