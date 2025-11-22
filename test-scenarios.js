// Test scenarios for the communication skills analysis tool
const testScenarios = [
  {
    name: "Perfect Score",
    transcript: "Hello, I am a clear and concise professional with extensive experience in skilled communication. My background is highly relevant to this audience and context, with a specific focus on delivering purposeful presentations that demonstrate my expertise. I am confident in my abilities and look forward to contributing meaningfully to our discussions.",
    expectedScore: 100,
    description: "Should get a high score due to including keywords and appropriate length"
  },
  {
    name: "Failing Score",
    transcript: "asdf jkl; qwer zxcv asdf jkl; qwer zxcv asdf jkl; qwer zxcv asdf jkl; qwer zxcv",
    expectedScore: 0,
    description: "Should get a low score as gibberish with no keywords"
  },
  {
    name: "No Keywords",
    transcript: "Hello there. I would like to introduce myself and tell you about my background. I have worked in various fields and gained experience in different areas. I enjoy meeting new people and sharing ideas in group settings. This seems like a wonderful opportunity to connect with others who have similar interests.",
    expectedScore: 50,
    description: "Well-written but contains no targeted keywords"
  },
  {
    name: "Incorrect Word Count - Too Short",
    transcript: "Hi, I am a professional.",
    expectedScore: 30,
    description: "Too short to meet minimum word requirements"
  },
  {
    name: "Empty Transcript",
    transcript: "",
    expectedScore: 0,
    description: "Empty input should return 0 score"
  }
];

console.log("=== Communication Skills Analysis Tool - Test Scenarios ===\n");

testScenarios.forEach((scenario, index) => {
  console.log(`${index + 1}. ${scenario.name}`);
  console.log(`Description: ${scenario.description}`);
  console.log(`Expected Score: ~${scenario.expectedScore}/100`);
  console.log(`Transcript: "${scenario.transcript}"`);
  console.log("\n" + "=".repeat(50) + "\n");
});

console.log("You can use these test cases to manually verify the application is working correctly.");
console.log("To test: Start the development server (npm run dev), paste each transcript into the UI, and compare results.");