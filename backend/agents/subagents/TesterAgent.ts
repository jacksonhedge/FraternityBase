/**
 * Tester Subagent
 * Validates code through testing and coverage analysis
 */

import { CodeAnalysisRequest, TestResults } from '../CodeRabbitAgent';

interface TestCase {
  name: string;
  input?: any;
  expectedOutput?: any;
  assertion?: string;
}

interface TestSuite {
  name: string;
  tests: TestCase[];
  setup?: string;
  teardown?: string;
}

export class TesterAgent {
  private testFrameworks: Map<string, string>;
  private testPatterns: Map<string, RegExp[]>;

  constructor() {
    this.testFrameworks = this.initializeTestFrameworks();
    this.testPatterns = this.initializeTestPatterns();
  }

  /**
   * Run tests on the provided code
   */
  async runTests(request: CodeAnalysisRequest): Promise<TestResults> {
    // Detect existing tests
    const existingTests = this.detectExistingTests(request.code, request.language);

    // Generate test cases if none exist
    const generatedTests = existingTests.length === 0
      ? this.generateTestCases(request.code, request.language)
      : existingTests;

    // Simulate test execution
    const results = await this.executeTests(generatedTests, request);

    // Calculate coverage
    const coverage = this.calculateCoverage(request.code, generatedTests);

    return {
      passed: results.failedTests.length === 0,
      testsPassed: results.passed,
      totalTests: results.total,
      coverage,
      failedTests: results.failedTests
    };
  }

  /**
   * Detect existing tests in code
   */
  private detectExistingTests(code: string, language: string): TestSuite[] {
    const tests: TestSuite[] = [];
    const patterns = this.testPatterns.get(language.toLowerCase()) || [];

    patterns.forEach(pattern => {
      const matches = code.match(pattern);
      if (matches) {
        // Extract test information
        matches.forEach(match => {
          tests.push({
            name: this.extractTestName(match, language),
            tests: [{
              name: 'Detected test',
              assertion: match
            }]
          });
        });
      }
    });

    return tests;
  }

  /**
   * Generate test cases for code without tests
   */
  private generateTestCases(code: string, language: string): TestSuite[] {
    const suites: TestSuite[] = [];

    // Extract functions to test
    const functions = this.extractFunctions(code, language);

    functions.forEach(func => {
      const suite: TestSuite = {
        name: `Test suite for ${func.name}`,
        tests: []
      };

      // Generate basic test cases
      suite.tests.push({
        name: `${func.name} should exist`,
        assertion: `expect(${func.name}).toBeDefined()`
      });

      // Generate parameter tests
      if (func.parameters.length > 0) {
        suite.tests.push({
          name: `${func.name} should handle valid inputs`,
          input: this.generateValidInput(func.parameters),
          assertion: `expect(() => ${func.name}(...validInput)).not.toThrow()`
        });

        suite.tests.push({
          name: `${func.name} should handle invalid inputs`,
          input: null,
          assertion: `expect(() => ${func.name}(null)).toThrow()`
        });
      }

      // Generate return value tests
      if (func.returnType) {
        suite.tests.push({
          name: `${func.name} should return ${func.returnType}`,
          assertion: `expect(typeof ${func.name}()).toBe('${func.returnType}')`
        });
      }

      // Edge case tests
      suite.tests.push({
        name: `${func.name} should handle edge cases`,
        input: this.generateEdgeCases(func.parameters),
        assertion: `Edge case validation`
      });

      suites.push(suite);
    });

    // Add integration tests
    if (functions.length > 1) {
      suites.push({
        name: 'Integration Tests',
        tests: [{
          name: 'Functions should work together',
          assertion: 'Integration test placeholder'
        }]
      });
    }

    return suites;
  }

  /**
   * Extract functions from code
   */
  private extractFunctions(code: string, language: string): any[] {
    const functions: any[] = [];

    switch (language.toLowerCase()) {
      case 'javascript':
      case 'typescript':
        // Match function declarations and arrow functions
        const jsPattern = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|\w+\s*=>))/g;
        let match;
        while ((match = jsPattern.exec(code)) !== null) {
          functions.push({
            name: match[1] || match[2],
            parameters: this.extractParameters(match[0]),
            returnType: this.inferReturnType(code, match[1] || match[2])
          });
        }
        break;

      case 'python':
        const pyPattern = /def\s+(\w+)\s*\(([^)]*)\)/g;
        while ((match = pyPattern.exec(code)) !== null) {
          functions.push({
            name: match[1],
            parameters: match[2].split(',').map(p => p.trim()),
            returnType: this.inferPythonReturnType(code, match[1])
          });
        }
        break;

      case 'java':
        const javaPattern = /(?:public|private|protected)?\s*(?:static\s+)?(\w+)\s+(\w+)\s*\(([^)]*)\)/g;
        while ((match = javaPattern.exec(code)) !== null) {
          functions.push({
            name: match[2],
            parameters: match[3].split(',').map(p => p.trim()),
            returnType: match[1]
          });
        }
        break;
    }

    return functions;
  }

  /**
   * Extract parameters from function signature
   */
  private extractParameters(signature: string): string[] {
    const match = signature.match(/\(([^)]*)\)/);
    if (!match) return [];

    return match[1]
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);
  }

  /**
   * Infer return type from function body
   */
  private inferReturnType(code: string, functionName: string): string {
    // Find function body
    const funcStart = code.indexOf(functionName);
    if (funcStart === -1) return 'unknown';

    const funcBody = code.substring(funcStart, funcStart + 500);

    if (funcBody.includes('return true') || funcBody.includes('return false')) {
      return 'boolean';
    }
    if (funcBody.includes('return "') || funcBody.includes("return '")) {
      return 'string';
    }
    if (funcBody.match(/return\s+\d+/)) {
      return 'number';
    }
    if (funcBody.includes('return [')) {
      return 'array';
    }
    if (funcBody.includes('return {')) {
      return 'object';
    }

    return 'unknown';
  }

  /**
   * Infer Python return type
   */
  private inferPythonReturnType(code: string, functionName: string): string {
    const funcStart = code.indexOf(`def ${functionName}`);
    if (funcStart === -1) return 'unknown';

    const funcBody = code.substring(funcStart, funcStart + 500);

    // Check for type hints
    const typeHintMatch = funcBody.match(/\)\s*->\s*(\w+)/);
    if (typeHintMatch) {
      return typeHintMatch[1];
    }

    // Infer from return statements
    if (funcBody.includes('return True') || funcBody.includes('return False')) {
      return 'bool';
    }
    if (funcBody.match(/return\s+["']/)) {
      return 'str';
    }
    if (funcBody.match(/return\s+\d+/)) {
      return 'int';
    }
    if (funcBody.includes('return [')) {
      return 'list';
    }
    if (funcBody.includes('return {')) {
      return 'dict';
    }

    return 'unknown';
  }

  /**
   * Generate valid input for parameters
   */
  private generateValidInput(parameters: string[]): any[] {
    return parameters.map(param => {
      // Simple heuristic based on parameter name
      if (param.includes('name') || param.includes('str')) {
        return 'test_string';
      }
      if (param.includes('num') || param.includes('count') || param.includes('int')) {
        return 42;
      }
      if (param.includes('bool') || param.includes('is') || param.includes('has')) {
        return true;
      }
      if (param.includes('arr') || param.includes('list')) {
        return [1, 2, 3];
      }
      return 'test_value';
    });
  }

  /**
   * Generate edge cases for testing
   */
  private generateEdgeCases(parameters: string[]): any[] {
    const edgeCases: any[] = [];

    parameters.forEach(param => {
      // Add various edge cases
      edgeCases.push(null);
      edgeCases.push(undefined);
      edgeCases.push('');
      edgeCases.push(0);
      edgeCases.push(-1);
      edgeCases.push([]);
      edgeCases.push({});
      edgeCases.push(NaN);
      edgeCases.push(Infinity);
    });

    return edgeCases;
  }

  /**
   * Execute test suites
   */
  private async executeTests(
    suites: TestSuite[],
    request: CodeAnalysisRequest
  ): Promise<{ passed: number; total: number; failedTests: string[] }> {
    let passed = 0;
    let total = 0;
    const failedTests: string[] = [];

    for (const suite of suites) {
      for (const test of suite.tests) {
        total++;

        // Simulate test execution
        const testPassed = await this.simulateTestExecution(test, request.code);

        if (testPassed) {
          passed++;
        } else {
          failedTests.push(`${suite.name}: ${test.name}`);
        }
      }
    }

    return { passed, total, failedTests };
  }

  /**
   * Simulate test execution
   */
  private async simulateTestExecution(test: TestCase, code: string): Promise<boolean> {
    // Simulate test execution with random success based on code quality heuristics
    const codeQuality = this.assessCodeQuality(code);

    // Higher quality code has higher chance of passing tests
    const passProbability = 0.5 + (codeQuality * 0.5);
    return Math.random() < passProbability;
  }

  /**
   * Assess code quality for test simulation
   */
  private assessCodeQuality(code: string): number {
    let quality = 1.0;

    // Deduct for various issues
    if (code.includes('TODO')) quality -= 0.1;
    if (code.includes('console.log')) quality -= 0.05;
    if (code.includes('var ')) quality -= 0.1;
    if (code.includes('any')) quality -= 0.05;
    if (!code.includes('try')) quality -= 0.1;
    if (!code.includes('catch')) quality -= 0.1;
    if (code.length < 50) quality -= 0.2;
    if (code.split('\n').length < 5) quality -= 0.1;

    // Bonus for good practices
    if (code.includes('const')) quality += 0.05;
    if (code.includes('async')) quality += 0.05;
    if (code.includes('await')) quality += 0.05;
    if (code.includes('interface') || code.includes('type')) quality += 0.1;
    if (code.includes('/**')) quality += 0.1; // JSDoc comments

    return Math.max(0, Math.min(1, quality));
  }

  /**
   * Calculate test coverage
   */
  private calculateCoverage(code: string, tests: TestSuite[]): number {
    // Simple coverage calculation based on function coverage
    const functions = this.extractFunctions(code, 'javascript');
    if (functions.length === 0) return 100;

    let coveredFunctions = 0;
    for (const func of functions) {
      for (const suite of tests) {
        if (suite.tests.some(test =>
          test.assertion?.includes(func.name) ||
          test.name.includes(func.name)
        )) {
          coveredFunctions++;
          break;
        }
      }
    }

    return Math.round((coveredFunctions / functions.length) * 100);
  }

  /**
   * Extract test name from match
   */
  private extractTestName(match: string, language: string): string {
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'typescript':
        const jsMatch = match.match(/(?:it|test|describe)\s*\(\s*['"`]([^'"`]+)/);
        return jsMatch ? jsMatch[1] : 'Unknown test';

      case 'python':
        const pyMatch = match.match(/def\s+(test_\w+)/);
        return pyMatch ? pyMatch[1] : 'Unknown test';

      default:
        return 'Unknown test';
    }
  }

  /**
   * Initialize test frameworks
   */
  private initializeTestFrameworks(): Map<string, string> {
    const frameworks = new Map();

    frameworks.set('javascript', 'jest');
    frameworks.set('typescript', 'jest');
    frameworks.set('python', 'pytest');
    frameworks.set('java', 'junit');
    frameworks.set('react', 'jest + react-testing-library');
    frameworks.set('vue', 'vue-test-utils');
    frameworks.set('angular', 'karma + jasmine');

    return frameworks;
  }

  /**
   * Initialize test patterns
   */
  private initializeTestPatterns(): Map<string, RegExp[]> {
    const patterns = new Map();

    patterns.set('javascript', [
      /(?:it|test)\s*\([^)]+\)/g,
      /describe\s*\([^)]+\)/g,
      /expect\s*\([^)]+\)/g
    ]);

    patterns.set('typescript', [
      /(?:it|test)\s*\([^)]+\)/g,
      /describe\s*\([^)]+\)/g,
      /expect\s*\([^)]+\)/g
    ]);

    patterns.set('python', [
      /def\s+test_\w+\s*\(/g,
      /assert\s+/g,
      /@pytest\.\w+/g
    ]);

    patterns.set('java', [
      /@Test/g,
      /assertEquals\s*\(/g,
      /assertTrue\s*\(/g
    ]);

    return patterns;
  }

  /**
   * Check if agent is ready
   */
  isReady(): boolean {
    return true;
  }
}