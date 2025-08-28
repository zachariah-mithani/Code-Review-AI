import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  className?: string;
}

export function CodeEditor({ value, onChange, language, className }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (textareaRef.current && preRef.current) {
      // Sync scroll position
      const textarea = textareaRef.current;
      const pre = preRef.current;
      
      const syncScroll = () => {
        pre.scrollTop = textarea.scrollTop;
        pre.scrollLeft = textarea.scrollLeft;
      };
      
      textarea.addEventListener('scroll', syncScroll);
      return () => textarea.removeEventListener('scroll', syncScroll);
    }
  }, []);

  // Simple syntax highlighting for JavaScript
  const highlightCode = (code: string, lang: string) => {
    if (lang === 'javascript' || lang === 'typescript') {
      return code
        .replace(/\b(function|const|let|var|if|else|for|while|return|class|extends|import|export|from|async|await|try|catch|finally)\b/g, '<span class="text-blue-400">$1</span>')
        .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-purple-400">$1</span>')
        .replace(/\b\d+\b/g, '<span class="text-green-400">$1</span>')
        .replace(/"([^"]*)"/g, '<span class="text-green-400">"$1"</span>')
        .replace(/'([^']*)'/g, '<span class="text-green-400">\'$1\'</span>')
        .replace(/\/\/.*$/gm, '<span class="text-gray-500">$&</span>')
        .replace(/\/\*[\s\S]*?\*\//g, '<span class="text-gray-500">$&</span>');
    }
    
    if (lang === 'python') {
      return code
        .replace(/\b(def|class|if|elif|else|for|while|return|import|from|try|except|finally|with|as|lambda|yield|async|await)\b/g, '<span class="text-blue-400">$1</span>')
        .replace(/\b(True|False|None)\b/g, '<span class="text-purple-400">$1</span>')
        .replace(/\b\d+\b/g, '<span class="text-green-400">$1</span>')
        .replace(/"([^"]*)"/g, '<span class="text-green-400">"$1"</span>')
        .replace(/'([^']*)'/g, '<span class="text-green-400">\'$1\'</span>')
        .replace(/#.*$/gm, '<span class="text-gray-500">$&</span>');
    }
    
    return code;
  };

  const lines = value.split('\n');
  const lineNumbers = lines.map((_, index) => index + 1);

  return (
    <div className={cn("relative", className)}>
      <div className="bg-code-bg text-code-text overflow-auto">
        <div className="flex min-h-full">
          {/* Line Numbers */}
          <div className="text-slate-500 p-4 pr-2 select-none text-sm font-mono leading-6 bg-slate-800">
            {lineNumbers.map((num) => (
              <div key={num} className="h-6">
                {num}
              </div>
            ))}
          </div>
          
          {/* Code Display */}
          <div className="flex-1 relative">
            <pre
              ref={preRef}
              className="p-4 text-sm font-mono leading-6 text-transparent overflow-auto h-full absolute inset-0 pointer-events-none"
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              <code
                dangerouslySetInnerHTML={{
                  __html: highlightCode(value, language)
                }}
              />
            </pre>
            
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-full bg-transparent text-transparent resize-none outline-none font-mono text-sm leading-6 p-4 relative z-10 caret-white"
              style={{ 
                whiteSpace: 'pre-wrap', 
                wordBreak: 'break-word',
                caretColor: '#e2e8f0'
              }}
              placeholder="Paste your code here..."
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
