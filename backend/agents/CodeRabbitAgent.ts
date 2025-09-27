/**
 * CodeRabbit Main Agent
 * Coordinates debugging, testing, and optimization of code responses
 */

import { DebuggerAgent } from './subagents/DebuggerAgent';
import { TesterAgent } from './subagents/TesterAgent';
import { RefinerAgent } from './subagents/RefinerAgent';

export interface CodeAnalysisRequest {
  code: string;
  language: string;
  context?: string;
  projectPath?: string;
}

export interface CodeAnalysisResult {
  originalCode: string;
  debugReport: DebugReport;
  testResults: TestResults;
  optimizedCode: string;
  improvements: string[];
  performanceGains?: PerformanceMetrics;
}

export interface DebugReport {
  errors: CodeError[];
  warnings: CodeWarning[];
  suggestions: string[];
  fixedCode?: string;
}

export interface TestResults {
  passed: boolean;
  testsPassed: number;
  totalTests: number;
  coverage?: number;
  failedTests?: string[];
}

export interface PerformanceMetrics {
  timeComplexity: string;
  spaceComplexity: string;
  estimatedSpeedUp?: number;
  memoryOptimization?: number;
}

export interface CodeError {
  line: number;
  column?: number;
  severity: 'error' | 'critical';
  message: string;
  fix?: string;
}

export interface CodeWarning {
  line: number;
  column?: number;
  severity: 'warning' | 'info';
  message: string;
  suggestion?: string;
}

export class CodeRabbitAgent {
  private debugger: DebuggerAgent;
  private tester: TesterAgent;
  private refiner: RefinerAgent;
  private analysisHistory: Map<string, CodeAnalysisResult>;

  constructor() {
    this.debugger = new DebuggerAgent();
    this.tester = new TesterAgent();
    this.refiner = new RefinerAgent();
    this.analysisHistory = new Map();
  }

  /**
   * Main analysis pipeline - coordinates all subagents
   */
  async analyzeCode(request: CodeAnalysisRequest): Promise<CodeAnalysisResult> {
    console.log(`🐰 CodeRabbit: Starting analysis for ${request.language} code...`);

    // Step 1: Debug phase
    console.log('🔍 Phase 1: Debugging...');
    const debugReport = await this.debugger.analyze(request);

    // Step 2: Test phase (use fixed code if available)
    console.log('🧪 Phase 2: Testing...');
    const codeToTest = debugReport.fixedCode || request.code;
    const testResults = await this.tester.runTests({
      ...request,
      code: codeToTest
    });

    // Step 3: Refinement phase
    console.log('✨ Phase 3: Optimizing...');
    const optimizationResult = await this.refiner.optimize({
      ...request,
      code: codeToTest,
      debugReport,
      testResults
    });

    // Compile final result
    const result: CodeAnalysisResult = {
      originalCode: request.code,
      debugReport,
      testResults,
      optimizedCode: optimizationResult.code,
      improvements: optimizationResult.improvements,
      performanceGains: optimizationResult.metrics
    };

    // Store in history
    const analysisId = this.generateAnalysisId(request);
    this.analysisHistory.set(analysisId, result);

    console.log('✅ CodeRabbit: Analysis complete!');
    return result;
  }

  /**
   * Quick debug-only analysis
   */
  async quickDebug(code: string, language: string): Promise<DebugReport> {
    return this.debugger.analyze({ code, language });
  }

  /**
   * Quick optimization without full pipeline
   */
  async quickOptimize(code: string, language: string): Promise<string> {
    const result = await this.refiner.optimize({
      code,
      language,
      debugReport: { errors: [], warnings: [], suggestions: [] },
      testResults: { passed: true, testsPassed: 0, totalTests: 0 }
    });
    return result.code;
  }

  /**
   * Get analysis history for a specific code snippet
   */
  getHistory(request: CodeAnalysisRequest): CodeAnalysisResult | undefined {
    const id = this.generateAnalysisId(request);
    return this.analysisHistory.get(id);
  }

  /**
   * Clear analysis history
   */
  clearHistory(): void {
    this.analysisHistory.clear();
  }

  /**
   * Generate unique ID for analysis caching
   */
  private generateAnalysisId(request: CodeAnalysisRequest): string {
    const codeHash = this.hashCode(request.code);
    return `${request.language}-${codeHash}`;
  }

  /**
   * Simple hash function for code
   */
  private hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * Get agent status
   */
  getStatus(): {
    ready: boolean;
    subagents: {
      debugger: boolean;
      tester: boolean;
      refiner: boolean;
    };
    historySize: number;
  } {
    return {
      ready: true,
      subagents: {
        debugger: this.debugger.isReady(),
        tester: this.tester.isReady(),
        refiner: this.refiner.isReady()
      },
      historySize: this.analysisHistory.size
    };
  }
}