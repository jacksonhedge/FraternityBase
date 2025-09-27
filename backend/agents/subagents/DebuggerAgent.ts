/**
 * Debugger Subagent
 * Identifies and fixes errors, warnings, and code issues
 */

import { CodeAnalysisRequest, DebugReport, CodeError, CodeWarning } from '../CodeRabbitAgent';

export class DebuggerAgent {
  private errorPatterns: Map<string, RegExp[]>;
  private fixStrategies: Map<string, Function>;

  constructor() {
    this.errorPatterns = this.initializeErrorPatterns();
    this.fixStrategies = this.initializeFixStrategies();
  }

  /**
   * Analyze code for errors and warnings
   */
  async analyze(request: CodeAnalysisRequest): Promise<DebugReport> {
    const errors: CodeError[] = [];
    const warnings: CodeWarning[] = [];
    const suggestions: string[] = [];

    // Split code into lines for analysis
    const lines = request.code.split('\n');

    // Language-specific analysis
    switch (request.language.toLowerCase()) {
      case 'typescript':
      case 'javascript':
        this.analyzeJavaScript(lines, errors, warnings, suggestions);
        break;
      case 'python':
        this.analyzePython(lines, errors, warnings, suggestions);
        break;
      case 'java':
        this.analyzeJava(lines, errors, warnings, suggestions);
        break;
      case 'react':
      case 'jsx':
      case 'tsx':
        this.analyzeReact(lines, errors, warnings, suggestions);
        break;
      default:
        this.analyzeGeneric(lines, errors, warnings, suggestions);
    }

    // Attempt to fix critical errors
    let fixedCode: string | undefined;
    if (errors.length > 0) {
      fixedCode = this.attemptAutoFix(request.code, errors, request.language);
    }

    return {
      errors,
      warnings,
      suggestions,
      fixedCode
    };
  }

  /**
   * JavaScript/TypeScript specific analysis
   */
  private analyzeJavaScript(
    lines: string[],
    errors: CodeError[],
    warnings: CodeWarning[],
    suggestions: string[]
  ): void {
    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Check for common errors
      if (line.includes('= =') || line.includes('! =')) {
        errors.push({
          line: lineNum,
          severity: 'error',
          message: 'Space between comparison operators',
          fix: line.replace('= =', '==').replace('! =', '!=')
        });
      }

      // Check for console.log in production
      if (line.includes('console.log')) {
        warnings.push({
          line: lineNum,
          severity: 'warning',
          message: 'console.log found - remove for production',
          suggestion: 'Use a proper logging library or remove'
        });
      }

      // Check for var usage
      if (line.trim().startsWith('var ')) {
        warnings.push({
          line: lineNum,
          severity: 'warning',
          message: 'Use const/let instead of var',
          suggestion: line.replace(/var\s+/, 'const ')
        });
      }

      // Check for missing semicolons (configurable)
      if (!line.trim().endsWith(';') &&
          !line.trim().endsWith('{') &&
          !line.trim().endsWith('}') &&
          line.trim().length > 0 &&
          !line.includes('//') &&
          !line.includes('if') &&
          !line.includes('for') &&
          !line.includes('while')) {
        warnings.push({
          line: lineNum,
          severity: 'info',
          message: 'Missing semicolon',
          suggestion: line + ';'
        });
      }

      // Check for unused variables (basic check)
      const varMatch = line.match(/(?:const|let|var)\s+(\w+)/);
      if (varMatch) {
        const varName = varMatch[1];
        const codeAfter = lines.slice(index + 1).join('\n');
        if (!codeAfter.includes(varName)) {
          warnings.push({
            line: lineNum,
            severity: 'warning',
            message: `Variable '${varName}' appears to be unused`,
            suggestion: 'Remove if not needed'
          });
        }
      }

      // Check for async without await
      if (line.includes('async') && !lines.slice(index, index + 10).join('\n').includes('await')) {
        warnings.push({
          line: lineNum,
          severity: 'warning',
          message: 'async function without await',
          suggestion: 'Remove async or add await'
        });
      }
    });

    // Add general suggestions
    if (!lines.join('\n').includes('use strict') && !lines.join('\n').includes('export')) {
      suggestions.push("Consider adding 'use strict' directive");
    }

    if (lines.join('\n').includes('document.getElementById')) {
      suggestions.push("Consider using querySelector for more flexible element selection");
    }
  }

  /**
   * React/JSX specific analysis
   */
  private analyzeReact(
    lines: string[],
    errors: CodeError[],
    warnings: CodeWarning[],
    suggestions: string[]
  ): void {
    // First run JavaScript analysis
    this.analyzeJavaScript(lines, errors, warnings, suggestions);

    const code = lines.join('\n');

    // Check for missing key props
    if (code.includes('.map(') && !code.includes('key=')) {
      warnings.push({
        line: 0,
        severity: 'warning',
        message: 'Missing key prop in list rendering',
        suggestion: 'Add key prop to mapped elements'
      });
    }

    // Check for direct state mutation
    if (code.includes('this.state.') && code.includes('=')) {
      errors.push({
        line: 0,
        severity: 'error',
        message: 'Direct state mutation detected',
        fix: 'Use setState() instead'
      });
    }

    // Check for useState in loops
    lines.forEach((line, index) => {
      if (line.includes('useState') &&
          (lines[index - 1]?.includes('for') ||
           lines[index - 1]?.includes('while'))) {
        errors.push({
          line: index + 1,
          severity: 'critical',
          message: 'React Hook called in a loop',
          fix: 'Move Hook outside of loop'
        });
      }
    });

    // Check for missing useEffect dependencies
    const useEffectPattern = /useEffect\s*\(\s*\(\)\s*=>/;
    lines.forEach((line, index) => {
      if (useEffectPattern.test(line)) {
        // Simple check for dependency array
        const nextLines = lines.slice(index, index + 10).join(' ');
        if (!nextLines.includes('], [') && !nextLines.includes('], []')) {
          warnings.push({
            line: index + 1,
            severity: 'warning',
            message: 'useEffect might be missing dependency array',
            suggestion: 'Add dependency array to prevent infinite re-renders'
          });
        }
      }
    });

    // Suggestions
    if (!code.includes('React.memo') && code.includes('export default function')) {
      suggestions.push('Consider using React.memo for performance optimization');
    }

    if (code.includes('onClick={() =>')) {
      suggestions.push('Consider using useCallback for event handlers to prevent unnecessary re-renders');
    }
  }

  /**
   * Python specific analysis
   */
  private analyzePython(
    lines: string[],
    errors: CodeError[],
    warnings: CodeWarning[],
    suggestions: string[]
  ): void {
    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Check indentation (Python critical)
      if (line.startsWith(' ') && !line.startsWith('    ')) {
        errors.push({
          line: lineNum,
          severity: 'critical',
          message: 'Incorrect indentation - use 4 spaces',
          fix: line.replace(/^ +/, '    ')
        });
      }

      // Check for print statements (Python 2 vs 3)
      if (line.includes('print ') && !line.includes('print(')) {
        errors.push({
          line: lineNum,
          severity: 'error',
          message: 'Python 2 print statement - use print()',
          fix: line.replace(/print\s+(.+)/, 'print($1)')
        });
      }

      // Check for == None
      if (line.includes('== None') || line.includes('!= None')) {
        warnings.push({
          line: lineNum,
          severity: 'warning',
          message: 'Use "is None" instead of "== None"',
          suggestion: line.replace('== None', 'is None').replace('!= None', 'is not None')
        });
      }

      // Check for bare except
      if (line.trim() === 'except:') {
        warnings.push({
          line: lineNum,
          severity: 'warning',
          message: 'Bare except clause - specify exception type',
          suggestion: 'except Exception:'
        });
      }

      // Check for mutable default arguments
      if (line.includes('def ') && line.includes('=[]')) {
        errors.push({
          line: lineNum,
          severity: 'error',
          message: 'Mutable default argument',
          fix: 'Use None as default and initialize in function'
        });
      }
    });

    // Suggestions
    if (!lines[0].includes('#!/usr/bin/env python')) {
      suggestions.push('Consider adding shebang line for executable scripts');
    }

    if (!lines.join('\n').includes('if __name__')) {
      suggestions.push('Consider adding if __name__ == "__main__": block');
    }
  }

  /**
   * Java specific analysis
   */
  private analyzeJava(
    lines: string[],
    errors: CodeError[],
    warnings: CodeWarning[],
    suggestions: string[]
  ): void {
    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Check for missing semicolons (Java requirement)
      if (!line.trim().endsWith(';') &&
          !line.trim().endsWith('{') &&
          !line.trim().endsWith('}') &&
          line.trim().length > 0 &&
          !line.includes('//') &&
          !line.includes('class') &&
          !line.includes('interface') &&
          !line.includes('if') &&
          !line.includes('for') &&
          !line.includes('while') &&
          !line.includes('switch')) {
        errors.push({
          line: lineNum,
          severity: 'error',
          message: 'Missing semicolon',
          fix: line + ';'
        });
      }

      // Check for naming conventions
      const classMatch = line.match(/class\s+([a-z]\w*)/);
      if (classMatch) {
        warnings.push({
          line: lineNum,
          severity: 'warning',
          message: `Class name '${classMatch[1]}' should start with uppercase`,
          suggestion: `class ${classMatch[1].charAt(0).toUpperCase()}${classMatch[1].slice(1)}`
        });
      }

      // Check for System.out.println
      if (line.includes('System.out.println')) {
        warnings.push({
          line: lineNum,
          severity: 'info',
          message: 'Consider using logging framework instead of System.out',
          suggestion: 'Use Logger or SLF4J'
        });
      }

      // Check for empty catch blocks
      if (line.includes('catch') && lines[index + 1]?.trim() === '{' && lines[index + 2]?.trim() === '}') {
        errors.push({
          line: lineNum,
          severity: 'error',
          message: 'Empty catch block',
          fix: 'Add error handling or logging'
        });
      }
    });
  }

  /**
   * Generic analysis for any language
   */
  private analyzeGeneric(
    lines: string[],
    errors: CodeError[],
    warnings: CodeWarning[],
    suggestions: string[]
  ): void {
    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Check for TODO comments
      if (line.includes('TODO') || line.includes('FIXME')) {
        warnings.push({
          line: lineNum,
          severity: 'info',
          message: 'TODO/FIXME comment found',
          suggestion: 'Address TODO items before production'
        });
      }

      // Check for hardcoded credentials
      if (line.includes('password') && line.includes('=') && line.includes('"')) {
        errors.push({
          line: lineNum,
          severity: 'critical',
          message: 'Potential hardcoded password',
          fix: 'Use environment variables or secure config'
        });
      }

      // Check for long lines
      if (line.length > 120) {
        warnings.push({
          line: lineNum,
          severity: 'info',
          message: `Line too long (${line.length} chars)`,
          suggestion: 'Break into multiple lines'
        });
      }

      // Check for trailing whitespace
      if (line.endsWith(' ') || line.endsWith('\t')) {
        warnings.push({
          line: lineNum,
          severity: 'info',
          message: 'Trailing whitespace',
          suggestion: 'Remove trailing whitespace'
        });
      }
    });

    // General suggestions
    suggestions.push('Consider adding comments for complex logic');
    suggestions.push('Ensure consistent code formatting');
  }

  /**
   * Attempt to automatically fix errors
   */
  private attemptAutoFix(code: string, errors: CodeError[], language: string): string {
    let fixedCode = code;
    const lines = fixedCode.split('\n');

    errors.forEach(error => {
      if (error.fix && error.line > 0 && error.line <= lines.length) {
        // If fix is a replacement string
        if (!error.fix.includes('\n')) {
          lines[error.line - 1] = error.fix;
        }
      }
    });

    return lines.join('\n');
  }

  /**
   * Initialize error patterns for different languages
   */
  private initializeErrorPatterns(): Map<string, RegExp[]> {
    const patterns = new Map();

    patterns.set('javascript', [
      /\b(undefined is not a function)\b/,
      /\b(Cannot read prop\w* of undefined)\b/,
      /\b(is not defined)\b/,
      /\b(\w+ is not a function)\b/
    ]);

    patterns.set('python', [
      /\b(IndentationError)\b/,
      /\b(SyntaxError)\b/,
      /\b(NameError)\b/,
      /\b(TypeError)\b/
    ]);

    return patterns;
  }

  /**
   * Initialize fix strategies
   */
  private initializeFixStrategies(): Map<string, Function> {
    const strategies = new Map();

    strategies.set('missing-semicolon', (line: string) => line + ';');
    strategies.set('var-to-const', (line: string) => line.replace(/\bvar\s+/, 'const '));
    strategies.set('== to ===', (line: string) => line.replace(/==/g, '===').replace(/!=/g, '!=='));

    return strategies;
  }

  /**
   * Check if agent is ready
   */
  isReady(): boolean {
    return true;
  }
}