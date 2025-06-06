// Test script to verify SOP patterns data processing
async function testSOPPatterns() {
  try {
    // Use dynamic import for fetch in Node.js
    const fetch = globalThis.fetch || (await import('node-fetch')).default;
    
    const response = await fetch("http://34.60.217.109/sopdeviation/patterns");
    const data = await response.json();
    
    console.log("Total patterns from API:", data.patterns.length);
    
    // Test the processing logic from OutlierAnalysis.tsx
    const processedData = data.patterns.map((item, idx) => ({
      pattern_no: item.pattern_no.toString(),
      pattern: item.pattern
        ? [...new Set(item.pattern.split(" > "))]
            .filter((step) => step && step.trim())
            .join(" → ")
        : "",
      count: parseInt(item.count) || 0,
      percentage: parseFloat(item.percentage) || 0,
    }));
    
    console.log("Total processed patterns:", processedData.length);
    
    // Check first and last pattern to verify full data
    console.log("First pattern:", processedData[0]);
    console.log("Last pattern:", processedData[processedData.length - 1]);
    
    // Check pattern lengths to ensure no truncation
    processedData.forEach((pattern, index) => {
      const stepCount = pattern.pattern.split(" → ").length;
      console.log(`Pattern ${index + 1}: ${stepCount} steps`);
    });
    
  } catch (error) {
    console.error("Error testing SOP patterns:", error);
  }
}

// Run the test
testSOPPatterns();
