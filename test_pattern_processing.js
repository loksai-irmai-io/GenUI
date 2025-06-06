// Simple test to verify SOP patterns processing
console.log("Testing SOP Patterns Processing Logic...");

// Sample data from API (first pattern)
const samplePattern = {
  pattern_no: 1,
  pattern: "Application Submission > Application Submission > Initial Assessment > Initial Assessment > Pre-Approval > Pre-Approval > Appraisal Request > Appraisal Request > Valuation Accepted > Valuation Accepted > Underwriting Approved > Underwriting Approved > Final Approval > Final Approval > Signing of Loan Agreement > Signing of Loan Agreement > Loan Funding > Loan Funding > Disbursement of Funds > Disbursement of Funds > Loan Closure > Loan Closure",
  count: "6764",
  percentage: 31.85
};

// Test our processing logic
const processed = {
  pattern_no: samplePattern.pattern_no.toString(),
  pattern: samplePattern.pattern
    ? [...new Set(samplePattern.pattern.split(" > "))]
        .filter((step) => step && step.trim())
        .join(" → ")
    : "",
  count: parseInt(samplePattern.count) || 0,
  percentage: parseFloat(samplePattern.percentage) || 0,
};

console.log("Original pattern steps:", samplePattern.pattern.split(" > ").length);
console.log("Unique steps after deduplication:", processed.pattern.split(" → ").length);
console.log("Processed pattern:", processed.pattern);
console.log("Count:", processed.count);
console.log("Percentage:", processed.percentage);

console.log("\nPattern preview (first 100 chars):");
console.log(processed.pattern.substring(0, 100) + "...");
