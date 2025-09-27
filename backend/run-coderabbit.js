/**
 * Simple runner for CodeRabbit Agent
 * Can be run directly with Node.js
 */

// Mock the imports since we're in plain JS
class CodeRabbitAgent {
  constructor() {
    this.name = "🐰 CodeRabbit";
    console.log(`${this.name} Agent initialized`);
  }

  async analyzeCode(request) {
    console.log(`\n${this.name}: Starting analysis for ${request.language} code...`);

    // Phase 1: Debugging
    console.log('🔍 Phase 1: Debugging...');
    const debugReport = await this.debug(request);

    // Phase 2: Testing
    console.log('🧪 Phase 2: Testing...');
    const testResults = await this.test(request);

    // Phase 3: Refining
    console.log('✨ Phase 3: Optimizing...');
    const optimized = await this.refine(request);

    console.log('✅ Analysis complete!');

    return {
      originalCode: request.code,
      debugReport,
      testResults,
      optimizedCode: optimized.code,
      improvements: optimized.improvements,
      performanceGains: {
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        estimatedSpeedUp: 25,
        memoryOptimization: 15
      }
    };
  }

  async debug(request) {
    const errors = [];
    const warnings = [];
    const suggestions = [];

    // Simulate debugging
    if (request.code.includes('var ')) {
      warnings.push({
        line: 1,
        severity: 'warning',
        message: 'Use const/let instead of var'
      });
    }

    if (request.code.includes('console.log')) {
      warnings.push({
        line: 3,
        severity: 'warning',
        message: 'Remove console.log for production'
      });
    }

    if (request.code.includes('==')) {
      warnings.push({
        line: 5,
        severity: 'warning',
        message: 'Use === for strict equality'
      });
    }

    return {
      errors,
      warnings,
      suggestions: ['Add error handling', 'Use modern syntax'],
      fixedCode: request.code.replace(/var /g, 'const ')
    };
  }

  async test(request) {
    // Simulate testing
    return {
      passed: true,
      testsPassed: 8,
      totalTests: 10,
      coverage: 85,
      failedTests: ['edge case test', 'null input test']
    };
  }

  async refine(request) {
    // Simulate optimization
    let optimized = request.code;
    const improvements = [];

    // Apply optimizations
    if (optimized.includes('var ')) {
      optimized = optimized.replace(/var /g, 'const ');
      improvements.push('Replaced var with const');
    }

    if (optimized.includes('==')) {
      optimized = optimized.replace(/==/g, '===');
      improvements.push('Used strict equality');
    }

    if (optimized.includes('function')) {
      optimized = optimized.replace(/function\s*\(/g, '(');
      improvements.push('Converted to arrow functions');
    }

    return {
      code: optimized,
      improvements
    };
  }
}

// Example usage
async function runExample() {
  const codeRabbit = new CodeRabbitAgent();

  // Example 1: JavaScript code with issues
  console.log('\n' + '='.repeat(50));
  console.log('📝 Example 1: Analyzing JavaScript Code');
  console.log('='.repeat(50));

  const jsCode = `
function calculateTotal(items) {
  var total = 0
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price
  }
  console.log("Total is: " + total)
  return total
}`;

  const result = await codeRabbit.analyzeCode({
    code: jsCode,
    language: 'javascript'
  });

  console.log('\n📊 Analysis Results:');
  console.log('├─ Errors found:', result.debugReport.errors.length);
  console.log('├─ Warnings found:', result.debugReport.warnings.length);
  console.log('├─ Test coverage:', result.testResults.coverage + '%');
  console.log('├─ Tests passed:', result.testResults.testsPassed + '/' + result.testResults.totalTests);
  console.log('└─ Improvements:', result.improvements.join(', '));

  console.log('\n⚡ Performance Metrics:');
  console.log('├─ Time Complexity:', result.performanceGains.timeComplexity);
  console.log('├─ Space Complexity:', result.performanceGains.spaceComplexity);
  console.log('├─ Speed Improvement:', result.performanceGains.estimatedSpeedUp + '%');
  console.log('└─ Memory Optimization:', result.performanceGains.memoryOptimization + '%');

  // Example 2: Quick analysis
  console.log('\n' + '='.repeat(50));
  console.log('📝 Example 2: Quick Debug Check');
  console.log('='.repeat(50));

  const buggyCode = `
const getData = async () => {
  const response = await fetch('/api/data')
  const data = response.json()
  return data
}`;

  const quickResult = await codeRabbit.analyzeCode({
    code: buggyCode,
    language: 'javascript'
  });

  console.log('\n🐛 Issues Found:');
  quickResult.debugReport.warnings.forEach(warning => {
    console.log(`  └─ Line ${warning.line}: ${warning.message}`);
  });

  console.log('\n💡 Suggestions:');
  quickResult.debugReport.suggestions.forEach(suggestion => {
    console.log(`  └─ ${suggestion}`);
  });

  console.log('\n' + '='.repeat(50));
  console.log('🐰 CodeRabbit Analysis Complete!');
  console.log('='.repeat(50));
}

// Run the example
runExample().catch(console.error);