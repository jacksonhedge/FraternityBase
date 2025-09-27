/**
 * Example Usage of CodeRabbit Agent System
 * Shows how the coordinated agents work together
 */

import { CodeRabbitAgent } from './CodeRabbitAgent';

async function demonstrateCodeRabbit() {
  const codeRabbit = new CodeRabbitAgent();

  // Example 1: Analyze JavaScript code with issues
  console.log('\n🐰 Example 1: Analyzing JavaScript Code\n');

  const jsCode = `
function calculateTotal(items) {
  var total = 0
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price
  }
  console.log("Total is: " + total)
  return total
}

const processOrder = (order) => {
  const items = order && order.items
  if (items == null) {
    return 0
  }

  const result = []
  for (let i = 0; i < items.length; i++) {
    result.push(items[i])
  }

  return calculateTotal(result)
}
`;

  const jsResult = await codeRabbit.analyzeCode({
    code: jsCode,
    language: 'javascript'
  });

  console.log('📊 Analysis Results:');
  console.log('Errors found:', jsResult.debugReport.errors.length);
  console.log('Warnings found:', jsResult.debugReport.warnings.length);
  console.log('Test coverage:', jsResult.testResults.coverage + '%');
  console.log('Improvements:', jsResult.improvements);
  console.log('Performance:', jsResult.performanceGains);
  console.log('\n✨ Optimized Code:');
  console.log(jsResult.optimizedCode);

  // Example 2: Analyze React component
  console.log('\n🐰 Example 2: Analyzing React Component\n');

  const reactCode = `
import React, { useState, useEffect } from 'react';

function UserList({ users }) {
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = (userId) => {
    console.log('Deleting user:', userId);
    const newUsers = filteredUsers.filter(u => u.id != userId);
    setFilteredUsers(newUsers);
  };

  return (
    <div>
      <input onChange={handleSearch} placeholder="Search users" />
      <div>
        {filteredUsers.map(user =>
          <div>
            <span>{user.name}</span>
            <button onClick={() => handleDelete(user.id)}>Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserList;
`;

  const reactResult = await codeRabbit.analyzeCode({
    code: reactCode,
    language: 'react'
  });

  console.log('📊 React Analysis Results:');
  console.log('Errors found:', reactResult.debugReport.errors.length);
  console.log('Warnings found:', reactResult.debugReport.warnings.length);
  console.log('Improvements:', reactResult.improvements);
  console.log('\n✨ Optimized React Component:');
  console.log(reactResult.optimizedCode);

  // Example 3: Analyze Python code
  console.log('\n🐰 Example 3: Analyzing Python Code\n');

  const pythonCode = `
def process_data(data):
    result = []
    for i in range(len(data)):
        if data[i] != None:
            result.append(data[i] * 2)

    total = 0
    for item in result:
        total = total + item

    average = total / len(result)
    print "Average: " + str(average)
    return average

def find_max(numbers):
    max = numbers[0]
    for i in range(1, len(numbers)):
        if numbers[i] > max:
            max = numbers[i]
    return max
`;

  const pythonResult = await codeRabbit.analyzeCode({
    code: pythonCode,
    language: 'python'
  });

  console.log('📊 Python Analysis Results:');
  console.log('Errors found:', pythonResult.debugReport.errors.length);
  console.log('Warnings found:', pythonResult.debugReport.warnings.length);
  console.log('Improvements:', pythonResult.improvements);
  console.log('\n✨ Optimized Python Code:');
  console.log(pythonResult.optimizedCode);

  // Example 4: Quick debug only
  console.log('\n🐰 Example 4: Quick Debug\n');

  const buggyCode = `
const getData = async () => {
  const response = await fetch('/api/data')
  const data = response.json()
  return data
}
`;

  const debugResult = await codeRabbit.quickDebug(buggyCode, 'javascript');
  console.log('Debug Report:', debugResult);

  // Example 5: Quick optimization only
  console.log('\n🐰 Example 5: Quick Optimization\n');

  const slowCode = `
function findDuplicates(arr) {
  var duplicates = [];
  for (var i = 0; i < arr.length; i++) {
    for (var j = i + 1; j < arr.length; j++) {
      if (arr[i] == arr[j]) {
        duplicates.push(arr[i]);
      }
    }
  }
  return duplicates;
}
`;

  const optimized = await codeRabbit.quickOptimize(slowCode, 'javascript');
  console.log('Optimized Version:');
  console.log(optimized);

  // Check agent status
  console.log('\n🐰 Agent Status:', codeRabbit.getStatus());
}

// Run demonstration
demonstrateCodeRabbit().catch(console.error);

/**
 * Example Output Structure:
 *
 * {
 *   originalCode: "...",
 *   debugReport: {
 *     errors: [{
 *       line: 5,
 *       severity: 'error',
 *       message: 'Missing await keyword',
 *       fix: 'const data = await response.json()'
 *     }],
 *     warnings: [{
 *       line: 3,
 *       severity: 'warning',
 *       message: 'Use const instead of var'
 *     }],
 *     suggestions: [
 *       'Consider adding error handling',
 *       'Use modern array methods'
 *     ],
 *     fixedCode: "..."
 *   },
 *   testResults: {
 *     passed: true,
 *     testsPassed: 8,
 *     totalTests: 10,
 *     coverage: 85,
 *     failedTests: ['edge case test', 'null input test']
 *   },
 *   optimizedCode: "...",
 *   improvements: [
 *     'Converted var to const',
 *     'Added React.memo for performance',
 *     'Used template literals',
 *     'Applied optional chaining',
 *     'Converted loop to map method'
 *   ],
 *   performanceGains: {
 *     timeComplexity: 'O(n)',
 *     spaceComplexity: 'O(1)',
 *     estimatedSpeedUp: 25,
 *     memoryOptimization: 15
 *   }
 * }
 */