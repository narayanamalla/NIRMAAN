// Test Case Study - Sample Transcript from provided rubrics

const sampleTranscript = `Hello everyone, myself Muskan, studying in class 8th B section from Christ Public School.
I am 13 years old. I live with my family. There are 3 people in my family, me, my mother and my father.
One special thing about my family is that they are very kind hearted to everyone and soft spoken. One thing I really enjoy is play, playing cricket and taking wickets.
A fun fact about me is that I see in mirror and talk by myself. One thing people don't know about me is that I once stole a toy from one of my cousin.
 My favorite subject is science because it is very interesting. Through science I can explore the whole world and make the discoveries and improve the lives of others.
Thank you for listening.`;

const sampleDuration = 52; // seconds
const expectedOverallScore = 86; // from the sample data

console.log("=== CASE STUDY TEST RESULTS ===");
console.log("Transcript Length:", sampleTranscript.length, "characters");
console.log("Word Count:", sampleTranscript.trim().split(/\s+/).filter(word => word.length > 0).length);
console.log("Duration:", sampleDuration, "seconds");
console.log("Expected Overall Score:", expectedOverallScore);
console.log("");

// Calculate expected speech rate
const wordCount = sampleTranscript.trim().split(/\s+/).filter(word => word.length > 0).length;
const speechRate = Math.round((wordCount / sampleDuration) * 60);
console.log("Calculated Speech Rate:", speechRate, "WPM");
console.log("Expected Speech Rate Score:", speechRate >= 111 && speechRate <= 140 ? 10 : speechRate >= 81 && speechRate <= 110 ? 6 : speechRate >= 141 && speechRate <= 160 ? 6 : 2);

// Check for keywords manually
const lowerText = sampleTranscript.toLowerCase();
const mustHaveKeywords = ["name", "age", "class", "school", "family", "hobbies", "interests", "like", "play"];
const goodToHaveKeywords = ["about family", "from", "ambition", "goal", "dream", "fun fact", "interesting", "unique", "strength", "achievement"];

const foundMustHave = mustHaveKeywords.filter(keyword => lowerText.includes(keyword));
const foundGoodToHave = goodToHaveKeywords.filter(keyword => lowerText.includes(keyword));

console.log("");
console.log("=== KEYWORD ANALYSIS ===");
console.log("Must-have keywords found:", foundMustHave.length, "/", mustHaveKeywords.length);
console.log("Found:", foundMustHave);
console.log("Good-to-have keywords found:", foundGoodToHave.length, "/", goodToHaveKeywords.length);
console.log("Found:", foundGoodToHave);
console.log("Expected Keyword Score:", (foundMustHave.length * 4) + (foundGoodToHave.length * 2));

// Check salutation
const hasHelloEveryone = lowerText.includes("hello everyone");
const hasGoodMorning = lowerText.includes("good morning") || lowerText.includes("good afternoon") || lowerText.includes("good evening");
const hasExcited = lowerText.includes("excited") || lowerText.includes("feeling great");

let salutationScore = 0;
let salutationLevel = "No Salutation";
if (hasExcited) {
  salutationScore = 5;
  salutationLevel = "Excellent";
} else if (hasGoodMorning) {
  salutationScore = 4;
  salutationLevel = "Good";
} else if (hasHelloEveryone) {
  salutationScore = 4;
  salutationLevel = "Good";
} else if (lowerText.includes("hello") || lowerText.includes("hi")) {
  salutationScore = 2;
  salutationLevel = "Normal";
}

console.log("");
console.log("=== SALUTATION ANALYSIS ===");
console.log("Salutation Level:", salutationLevel);
console.log("Salutation Score:", salutationScore, "/ 5");
console.log("Sample Data Score:", 4, "/ 5");

// Check flow
const hasSalutation = hasHelloEveryone || hasGoodMorning || lowerText.includes("hello") || lowerText.includes("hi");
const hasBasicDetails = lowerText.includes("years old") || lowerText.includes("class") || lowerText.includes("school");
const hasAdditionalDetails = lowerText.includes("family") || lowerText.includes("hobby") || lowerText.includes("fact") || lowerText.includes("interest");
const hasClosing = lowerText.includes("thank you") || lowerText.includes("that's all") || lowerText.includes("that's all");

const flowScore = (hasSalutation && hasBasicDetails && hasAdditionalDetails && hasClosing) ? 5 : 0;

console.log("");
console.log("=== FLOW ANALYSIS ===");
console.log("Has Salutation:", hasSalutation);
console.log("Has Basic Details:", hasBasicDetails);
console.log("Has Additional Details:", hasAdditionalDetails);
console.log("Has Closing:", hasClosing);
console.log("Flow Score:", flowScore, "/ 5");

// Expected breakdown from sample data
const expectedBreakdown = {
  "Content & Structure": {
    "Salutation Level": 4,
    "Key Word Presence": 24,
    "Flow": 5,
    "Total": 33
  },
  "Speech Rate": 10,
  "Language & Grammar": {
    "Grammar Errors": 10,
    "Vocabulary Richness": 6,
    "Total": 16
  },
  "Clarity": 15,
  "Engagement": 12
};

console.log("");
console.log("=== EXPECTED BREAKDOWN ===");
console.log("Content & Structure:", expectedBreakdown["Content & Structure"].Total, "/ 40");
console.log("  - Salutation Level:", expectedBreakdown["Content & Structure"]["Salutation Level"], "/ 5");
console.log("  - Key Word Presence:", expectedBreakdown["Content & Structure"]["Key Word Presence"], "/ 30");
console.log("  - Flow:", expectedBreakdown["Content & Structure"]["Flow"], "/ 5");
console.log("Speech Rate:", expectedBreakdown["Speech Rate"], "/ 10");
console.log("Language & Grammar:", expectedBreakdown["Language & Grammar"].Total, "/ 20");
console.log("  - Grammar Errors:", expectedBreakdown["Language & Grammar"]["Grammar Errors"], "/ 10");
console.log("  - Vocabulary Richness:", expectedBreakdown["Language & Grammar"]["Vocabulary Richness"], "/ 10");
console.log("Clarity:", expectedBreakdown["Clarity"], "/ 15");
console.log("Engagement:", expectedBreakdown["Engagement"], "/ 15");
console.log("TOTAL EXPECTED SCORE:", expectedOverallScore, "/ 100");

console.log("");
console.log("=== TO TEST ===");
console.log("1. Start the application: npm run dev");
console.log("2. Open http://localhost:3000");
console.log("3. Paste the transcript above");
console.log("4. Set duration to 52 seconds");
console.log("5. Click 'Score Transcript'");
console.log("6. Compare results with expected breakdown above");
console.log("");
console.log("The application should score close to", expectedOverallScore, "points with similar breakdown.");

module.exports = { sampleTranscript, sampleDuration, expectedOverallScore };