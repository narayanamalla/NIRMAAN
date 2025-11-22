// Test with the provided case study sample transcript

const sampleTranscript = `Hello everyone, myself Muskan, studying in class 8th B section from Christ Public School.
I am 13 years old. I live with my family. There are 3 people in my family, me, my mother and my father.
One special thing about my family is that they are very kind hearted to everyone and soft spoken. One thing I really enjoy is play, playing cricket and taking wickets.
A fun fact about me is that I see in mirror and talk by myself. One thing people don't know about me is that I once stole a toy from one of my cousin.
 My favorite subject is science because it is very interesting. Through science I can explore the whole world and make the discoveries and improve the lives of others.
Thank you for listening.`;

const sampleDuration = 52; // seconds

console.log("=== Case Study Test Transcript ===");
console.log("Duration:", sampleDuration + " seconds");
console.log("Expected Overall Score: 86/100");
console.log("\nTranscript:");
console.log(sampleTranscript);
console.log("\n" + "=".repeat(50));

// Test data for manual verification
const expectedResults = {
  "Content & Structure": {
    "Salutation Level": 4,
    "Key Word Presence": 24,
    "Flow": 5,
    "Total": 33
  },
  "Speech Rate": {
    "Score": 10,
    "WPM": 135 // ~135 words / 52 seconds * 60 = ~156 WPM
  },
  "Language & Grammar": {
    "Grammar Errors": 10,
    "Vocabulary Richness": 6,
    "Total": 16
  },
  "Clarity": {
    "Filler Word Rate": 15,
    "Total": 15
  },
  "Engagement": {
    "Sentiment/Positivity": 12,
    "Total": 12
  }
};

console.log("\nExpected Detailed Results:");
for (const [criterion, metrics] of Object.entries(expectedResults)) {
  if (typeof metrics === 'object' && metrics.Total !== undefined) {
    console.log(`\n${criterion}: ${metrics.Total}/40`);
    for (const [metric, score] of Object.entries(metrics)) {
      if (metric !== 'Total') {
        console.log(`  - ${metric}: ${score}`);
      }
    }
  } else {
    console.log(`\n${criterion}: ${metrics.Score}/10`);
  }
}

console.log("\n" + "=".repeat(50));
console.log("To test:");
console.log("1. Start the development server: npm run dev");
console.log("2. Open http://localhost:3000");
console.log("3. Paste the transcript above into the textarea");
console.log("4. Enter duration: 52");
console.log("5. Click 'Score Transcript'");
console.log("6. Compare the results with the expected scores above");
console.log("\nExpected overall score: 86/100");

module.exports = { sampleTranscript, sampleDuration, expectedResults };