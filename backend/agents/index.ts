/**
 * CodeRabbit Agent System Entry Point
 * Coordinated debugging, testing, and optimization pipeline
 */

import { CodeRabbitAgent } from './CodeRabbitAgent';

// Export main agent
export { CodeRabbitAgent } from './CodeRabbitAgent';

// Export types
export type {
  CodeAnalysisRequest,
  CodeAnalysisResult,
  DebugReport,
  TestResults,
  PerformanceMetrics,
  CodeError,
  CodeWarning
} from './CodeRabbitAgent';

// Export subagents for direct access if needed
export { DebuggerAgent } from './subagents/DebuggerAgent';
export { TesterAgent } from './subagents/TesterAgent';
export { RefinerAgent } from './subagents/RefinerAgent';

// Create singleton instance
const codeRabbit = new CodeRabbitAgent();

/**
 * Quick analysis function for immediate use
 */
export async function analyzeCode(
  code: string,
  language: string,
  context?: string
): Promise<any> {
  return codeRabbit.analyzeCode({
    code,
    language,
    context
  });
}

/**
 * Debug-only analysis
 */
export async function debugCode(code: string, language: string) {
  return codeRabbit.quickDebug(code, language);
}

/**
 * Optimize-only analysis
 */
export async function optimizeCode(code: string, language: string) {
  return codeRabbit.quickOptimize(code, language);
}

// Default export
export default codeRabbit;