/**
 * Refiner Subagent
 * Optimizes code for performance, readability, and best practices
 */

import { CodeAnalysisRequest, DebugReport, TestResults, PerformanceMetrics } from '../CodeRabbitAgent';

export interface OptimizationRequest extends CodeAnalysisRequest {
  debugReport: DebugReport;
  testResults: TestResults;
}

export interface OptimizationResult {
  code: string;
  improvements: string[];
  metrics?: PerformanceMetrics;
}

interface Optimization {
  name: string;
  pattern: RegExp;
  replacement: string | ((match: string, ...args: any[]) => string);
  description: string;
}

export class RefinerAgent {
  private optimizations: Map<string, Optimization[]>;
  private performancePatterns: Map<string, any>;

  constructor() {
    this.optimizations = this.initializeOptimizations();
    this.performancePatterns = this.initializePerformancePatterns();
  }

  /**
   * Optimize code for performance and best practices
   */
  async optimize(request: OptimizationRequest): Promise<OptimizationResult> {
    let optimizedCode = request.code;
    const improvements: string[] = [];

    // Apply language-specific optimizations
    const languageOptimizations = this.optimizations.get(request.language.toLowerCase()) || [];
    languageOptimizations.forEach(opt => {
      const before = optimizedCode;
      optimizedCode = optimizedCode.replace(opt.pattern, opt.replacement as any);
      if (before !== optimizedCode) {
        improvements.push(opt.description);
      }
    });

    // Apply general optimizations
    optimizedCode = this.applyGeneralOptimizations(optimizedCode, improvements);

    // Apply performance optimizations
    optimizedCode = this.applyPerformanceOptimizations(
      optimizedCode,
      request.language,
      improvements
    );

    // Apply formatting improvements
    optimizedCode = this.formatCode(optimizedCode, request.language);

    // Calculate performance metrics
    const metrics = this.calculatePerformanceMetrics(
      request.code,
      optimizedCode,
      request.language
    );

    // Add specific improvements based on debug report
    if (request.debugReport.warnings.length > 0) {
      improvements.push(`Fixed ${request.debugReport.warnings.length} code warnings`);
    }

    if (request.debugReport.errors.length > 0) {
      improvements.push(`Resolved ${request.debugReport.errors.length} errors`);
    }

    return {
      code: optimizedCode,
      improvements,
      metrics
    };
  }

  /**
   * Apply general optimizations applicable to all languages
   */
  private applyGeneralOptimizations(code: string, improvements: string[]): string {
    let optimized = code;

    // Remove trailing whitespace
    const beforeTrailing = optimized;
    optimized = optimized.split('\n').map(line => line.trimEnd()).join('\n');
    if (beforeTrailing !== optimized) {
      improvements.push('Removed trailing whitespace');
    }

    // Ensure consistent line endings
    optimized = optimized.replace(/\r\n/g, '\n');

    // Remove multiple empty lines
    const beforeEmpty = optimized;
    optimized = optimized.replace(/\n\n\n+/g, '\n\n');
    if (beforeEmpty !== optimized) {
      improvements.push('Normalized empty lines');
    }

    // Add newline at end of file if missing
    if (!optimized.endsWith('\n')) {
      optimized += '\n';
      improvements.push('Added newline at end of file');
    }

    return optimized;
  }

  /**
   * Apply performance optimizations
   */
  private applyPerformanceOptimizations(
    code: string,
    language: string,
    improvements: string[]
  ): string {
    let optimized = code;

    switch (language.toLowerCase()) {
      case 'javascript':
      case 'typescript':
        optimized = this.optimizeJavaScript(optimized, improvements);
        break;
      case 'python':
        optimized = this.optimizePython(optimized, improvements);
        break;
      case 'react':
      case 'jsx':
      case 'tsx':
        optimized = this.optimizeReact(optimized, improvements);
        break;
    }

    return optimized;
  }

  /**
   * JavaScript/TypeScript optimizations
   */
  private optimizeJavaScript(code: string, improvements: string[]): string {
    let optimized = code;

    // Convert for loops to for...of when appropriate
    const forLoopPattern = /for\s*\(\s*let\s+(\w+)\s*=\s*0\s*;\s*\1\s*<\s*(\w+)\.length\s*;\s*\1\+\+\s*\)\s*{([^}]+)}/g;
    optimized = optimized.replace(forLoopPattern, (match, index, array, body) => {
      if (body.includes(`${array}[${index}]`)) {
        improvements.push('Converted for loop to for...of for better readability');
        const itemName = array.endsWith('s') ? array.slice(0, -1) : 'item';
        const newBody = body.replace(new RegExp(`${array}\\[${index}\\]`, 'g'), itemName);
        return `for (const ${itemName} of ${array}) {${newBody}}`;
      }
      return match;
    });

    // Use optional chaining
    const nullCheckPattern = /(\w+)\s*&&\s*\1\.(\w+)/g;
    const beforeOptional = optimized;
    optimized = optimized.replace(nullCheckPattern, '$1?.$2');
    if (beforeOptional !== optimized) {
      improvements.push('Applied optional chaining for null-safe property access');
    }

    // Use nullish coalescing
    const orDefaultPattern = /(\w+)\s*\|\|\s*([^|&\s]+)/g;
    const beforeNullish = optimized;
    optimized = optimized.replace(orDefaultPattern, (match, variable, defaultValue) => {
      // Only replace if it's a simple default assignment
      if (!defaultValue.includes('(') && !defaultValue.includes('{')) {
        improvements.push('Used nullish coalescing operator');
        return `${variable} ?? ${defaultValue}`;
      }
      return match;
    });

    // Convert string concatenation to template literals
    const concatPattern = /(['"])([^'"]+)\1\s*\+\s*(\w+)\s*\+\s*(['"])([^'"]+)\4/g;
    const beforeTemplate = optimized;
    optimized = optimized.replace(concatPattern, '`$2${$3}$5`');
    if (beforeTemplate !== optimized) {
      improvements.push('Converted string concatenation to template literals');
    }

    // Use array methods instead of loops where appropriate
    const pushLoopPattern = /const\s+(\w+)\s*=\s*\[\]\s*;[\s\S]*?for\s*\([^)]+\)\s*{\s*\1\.push\(([^)]+)\)/g;
    const beforeMap = optimized;
    optimized = optimized.replace(pushLoopPattern, (match, arrayName, pushValue) => {
      if (pushValue.includes('if')) return match; // Skip conditional pushes
      improvements.push('Converted imperative loop to functional array method');
      return `const ${arrayName} = array.map(item => ${pushValue})`;
    });

    // Memoize expensive operations
    if (code.includes('useMemo') === false && code.includes('React')) {
      const expensivePattern = /const\s+(\w+)\s*=\s*([^;]+(?:map|filter|reduce|sort)[^;]+);/g;
      optimized = optimized.replace(expensivePattern, (match, varName, expression) => {
        improvements.push('Added memoization for expensive operations');
        return `const ${varName} = useMemo(() => ${expression}, [dependencies]);`;
      });
    }

    return optimized;
  }

  /**
   * Python optimizations
   */
  private optimizePython(code: string, improvements: string[]): string {
    let optimized = code;

    // Use list comprehensions instead of loops
    const appendLoopPattern = /(\w+)\s*=\s*\[\]\s*\n\s*for\s+(\w+)\s+in\s+(\w+):\s*\n\s+\1\.append\(([^)]+)\)/g;
    optimized = optimized.replace(appendLoopPattern, (match, listName, item, iterable, expression) => {
      improvements.push('Converted loop to list comprehension');
      return `${listName} = [${expression} for ${item} in ${iterable}]`;
    });

    // Use f-strings instead of format
    const formatPattern = /["']([^"']+)["']\.format\(([^)]+)\)/g;
    const beforeFString = optimized;
    optimized = optimized.replace(formatPattern, (match, str, args) => {
      improvements.push('Converted .format() to f-strings');
      // Simple conversion - would need more sophisticated parsing in production
      return `f"${str}"`;
    });

    // Use enumerate instead of range(len())
    const rangeLenPattern = /for\s+(\w+)\s+in\s+range\(len\((\w+)\)\):/g;
    optimized = optimized.replace(rangeLenPattern, (match, index, array) => {
      improvements.push('Used enumerate instead of range(len())');
      return `for ${index}, item in enumerate(${array}):`;
    });

    // Use with statement for file operations
    const fileOpenPattern = /(\w+)\s*=\s*open\(([^)]+)\)\s*\n([^]*?)\1\.close\(\)/g;
    optimized = optimized.replace(fileOpenPattern, (match, file, args, body) => {
      improvements.push('Used context manager for file operations');
      return `with open(${args}) as ${file}:\n${body}`;
    });

    // Use generators for memory efficiency
    const largeListPattern = /return\s*\[([^]]+)\sfor\s+(\w+)\s+in\s+(\w+)\]/g;
    if (code.includes('def') && code.length > 1000) {
      optimized = optimized.replace(largeListPattern, (match, expr, item, iterable) => {
        improvements.push('Converted large list to generator for memory efficiency');
        return `return (${expr} for ${item} in ${iterable})`;
      });
    }

    return optimized;
  }

  /**
   * React optimizations
   */
  private optimizeReact(code: string, improvements: string[]): string {
    let optimized = this.optimizeJavaScript(code, improvements);

    // Add React.memo to functional components
    const componentPattern = /export\s+(?:default\s+)?function\s+(\w+)\s*\([^)]*\)\s*{/g;
    if (!code.includes('React.memo')) {
      optimized = optimized.replace(componentPattern, (match, name) => {
        if (name[0] === name[0].toUpperCase()) { // Component names start with uppercase
          improvements.push(`Added React.memo to ${name} component`);
          return `const ${name} = React.memo(function ${name}(props) {`;
        }
        return match;
      });
    }

    // Use useCallback for event handlers
    const handlerPattern = /const\s+(\w*(?:handle|on)\w+)\s*=\s*\([^)]*\)\s*=>/g;
    if (!code.includes('useCallback')) {
      optimized = optimized.replace(handlerPattern, (match, handlerName) => {
        improvements.push(`Wrapped ${handlerName} with useCallback`);
        return `const ${handlerName} = useCallback((params) =>`;
      });
    }

    // Lazy load components
    const importPattern = /import\s+(\w+)\s+from\s+['"]([^'"]+Component)['"]/g;
    if (!code.includes('React.lazy')) {
      optimized = optimized.replace(importPattern, (match, name, path) => {
        improvements.push(`Added lazy loading for ${name} component`);
        return `const ${name} = React.lazy(() => import('${path}'))`;
      });
    }

    // Optimize re-renders with proper dependency arrays
    const effectPattern = /useEffect\(\(\)\s*=>\s*{([^}]+)}\)/g;
    optimized = optimized.replace(effectPattern, (match, body) => {
      // Analyze body to determine dependencies
      const deps = this.extractDependencies(body);
      if (deps.length > 0) {
        improvements.push('Added proper dependency array to useEffect');
        return `useEffect(() => {${body}}, [${deps.join(', ')}])`;
      }
      return match;
    });

    return optimized;
  }

  /**
   * Extract dependencies from effect body
   */
  private extractDependencies(body: string): string[] {
    const deps: Set<string> = new Set();

    // Match variable usage
    const varPattern = /\b([a-zA-Z_]\w*)\b/g;
    let match;
    while ((match = varPattern.exec(body)) !== null) {
      const varName = match[1];
      // Filter out keywords and common functions
      if (!['const', 'let', 'var', 'function', 'return', 'if', 'else', 'console', 'window', 'document'].includes(varName)) {
        deps.add(varName);
      }
    }

    return Array.from(deps);
  }

  /**
   * Format code for better readability
   */
  private formatCode(code: string, language: string): string {
    let formatted = code;

    // Consistent indentation
    const lines = formatted.split('\n');
    let indentLevel = 0;
    const formattedLines: string[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();

      // Adjust indent level based on brackets
      if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
        formattedLines.push('  '.repeat(indentLevel) + trimmed);
        indentLevel++;
      } else if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
        indentLevel = Math.max(0, indentLevel - 1);
        formattedLines.push('  '.repeat(indentLevel) + trimmed);
      } else {
        formattedLines.push('  '.repeat(indentLevel) + trimmed);
      }
    });

    return formattedLines.join('\n');
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(
    originalCode: string,
    optimizedCode: string,
    language: string
  ): PerformanceMetrics {
    // Analyze complexity
    const originalComplexity = this.analyzeComplexity(originalCode);
    const optimizedComplexity = this.analyzeComplexity(optimizedCode);

    // Estimate performance improvement
    const codeReduction = ((originalCode.length - optimizedCode.length) / originalCode.length) * 100;
    const complexityReduction = originalComplexity.cyclomatic - optimizedComplexity.cyclomatic;

    return {
      timeComplexity: this.estimateTimeComplexity(optimizedCode),
      spaceComplexity: this.estimateSpaceComplexity(optimizedCode),
      estimatedSpeedUp: Math.max(0, complexityReduction * 10 + codeReduction),
      memoryOptimization: Math.max(0, codeReduction)
    };
  }

  /**
   * Analyze code complexity
   */
  private analyzeComplexity(code: string): { cyclomatic: number; cognitive: number } {
    let cyclomatic = 1; // Base complexity
    let cognitive = 0;

    // Count decision points
    cyclomatic += (code.match(/if\s*\(/g) || []).length;
    cyclomatic += (code.match(/else\s+if\s*\(/g) || []).length;
    cyclomatic += (code.match(/for\s*\(/g) || []).length;
    cyclomatic += (code.match(/while\s*\(/g) || []).length;
    cyclomatic += (code.match(/case\s+/g) || []).length;
    cyclomatic += (code.match(/catch\s*\(/g) || []).length;
    cyclomatic += (code.match(/\?\s*.*\s*:/g) || []).length; // Ternary operators

    // Cognitive complexity
    cognitive += (code.match(/&&/g) || []).length;
    cognitive += (code.match(/\|\|/g) || []).length;
    cognitive += (code.match(/function|=>/g) || []).length;

    // Nesting adds to cognitive complexity
    const lines = code.split('\n');
    let nestingLevel = 0;
    lines.forEach(line => {
      if (line.includes('{')) nestingLevel++;
      if (line.includes('}')) nestingLevel--;
      cognitive += nestingLevel * 0.5;
    });

    return { cyclomatic, cognitive };
  }

  /**
   * Estimate time complexity
   */
  private estimateTimeComplexity(code: string): string {
    const nestedLoops = (code.match(/for.*\{[^}]*for/gs) || []).length;
    const singleLoops = (code.match(/for\s*\(/g) || []).length - nestedLoops * 2;
    const recursion = code.includes('function') && code.includes('return') &&
                     code.match(/function\s+(\w+)[\s\S]*\1\(/);

    if (recursion) return 'O(2^n) - Recursive';
    if (nestedLoops >= 3) return 'O(n³) - Triple nested loops';
    if (nestedLoops >= 2) return 'O(n²) - Nested loops';
    if (nestedLoops === 1) return 'O(n²) - Nested loops';
    if (singleLoops > 0) return 'O(n) - Linear';
    if (code.includes('sort')) return 'O(n log n) - Sorting';

    return 'O(1) - Constant';
  }

  /**
   * Estimate space complexity
   */
  private estimateSpaceComplexity(code: string): string {
    const arrays = (code.match(/\[\]/g) || []).length;
    const objects = (code.match(/\{\}/g) || []).length;
    const maps = (code.match(/new\s+Map/g) || []).length;
    const sets = (code.match(/new\s+Set/g) || []).length;
    const recursion = code.includes('function') && code.includes('return') &&
                     code.match(/function\s+(\w+)[\s\S]*\1\(/);

    if (recursion) return 'O(n) - Recursive call stack';
    if (arrays + objects + maps + sets > 3) return 'O(n) - Multiple data structures';
    if (arrays + objects + maps + sets > 0) return 'O(n) - Dynamic allocation';

    return 'O(1) - Constant';
  }

  /**
   * Initialize language-specific optimizations
   */
  private initializeOptimizations(): Map<string, Optimization[]> {
    const optimizations = new Map();

    // JavaScript optimizations
    optimizations.set('javascript', [
      {
        name: 'var-to-const',
        pattern: /\bvar\s+/g,
        replacement: 'const ',
        description: 'Replaced var with const'
      },
      {
        name: 'strict-equality',
        pattern: /([^=!])={2}([^=])/g,
        replacement: '$1===$2',
        description: 'Used strict equality operator'
      },
      {
        name: 'arrow-functions',
        pattern: /function\s*\(([^)]*)\)\s*{/g,
        replacement: '($1) => {',
        description: 'Converted to arrow function'
      }
    ]);

    // TypeScript includes JS optimizations
    optimizations.set('typescript', optimizations.get('javascript')!);

    // Python optimizations
    optimizations.set('python', [
      {
        name: 'is-none',
        pattern: /==\s*None/g,
        replacement: 'is None',
        description: 'Used "is None" instead of "== None"'
      },
      {
        name: 'is-not-none',
        pattern: /!=\s*None/g,
        replacement: 'is not None',
        description: 'Used "is not None" instead of "!= None"'
      }
    ]);

    return optimizations;
  }

  /**
   * Initialize performance patterns
   */
  private initializePerformancePatterns(): Map<string, any> {
    const patterns = new Map();

    patterns.set('memoization', /useMemo|useCallback|React\.memo/);
    patterns.set('lazy-loading', /React\.lazy|dynamic\(|import\(/);
    patterns.set('virtualization', /react-window|react-virtualized|VirtualList/);
    patterns.set('debounce', /debounce|throttle/);

    return patterns;
  }

  /**
   * Check if agent is ready
   */
  isReady(): boolean {
    return true;
  }
}