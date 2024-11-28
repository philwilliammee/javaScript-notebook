export class CodeBot {
  generateCode(prompt) {
    // Mock implementation - in reality, this would call an LLM
    if (prompt.includes("Fibonacci")) {
      return `// Access fibNumbers from previous cell
console.log("Using fibNumbers from previous cell:", fibNumbers);

// Calculate sum of Fibonacci numbers
const sum = fibNumbers.reduce((a, b) => a + b, 0);
console.log("Sum of Fibonacci numbers:", sum);

// Return an object with our calculations
{ sum, average: sum / fibNumbers.length }`;
    }
    return "console.log('No specific response for this prompt')";
  }
}