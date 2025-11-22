// Test script for Hugging Face Scoring API
// Tests different types of introductions to verify proper scoring

const testIntroductions = [
  {
    name: "Excellent Introduction",
    transcript: "Good morning everyone, it's a pleasure to introduce myself. My name is Sarah Johnson, and I'm 16 years old, currently studying in Grade 11 at Lincoln High School. I'm passionate about computer science and mathematics, and in my free time, I enjoy coding mobile apps and participating in hackathons. I aspire to pursue a career in artificial intelligence research. I'm particularly proud of leading our school's robotics team to victory in the regional competition last year. Thank you for your attention, and I look forward to getting to know all of you better.",
    expectedScore: 85,
    duration: 45
  },
  {
    name: "Good Introduction",
    transcript: "Hi everyone, my name is Michael Chen. I am 15 years old and I'm in Grade 10 at Riverside High School. I like playing basketball and reading books in my spare time. My favorite subject is science because I find it interesting. I live with my parents and my younger sister. Thank you for listening.",
    expectedScore: 70,
    duration: 30
  },
  {
    name: "Average Introduction",
    transcript: "Hello. My name is Alex. I am 14 years old. I go to Northwood High School. I like video games. I have a dog. Thank you.",
    expectedScore: 50,
    duration: 20
  },
  {
    name: "Poor Introduction",
    transcript: "uh... hi... i'm... like... my name is john... and... um... i'm 13... i go to school... i like stuff... yeah... that's it... thanks...",
    expectedScore: 30,
    duration: 25
  },
  {
    name: "Professional Adult Introduction",
    transcript: "Good afternoon distinguished colleagues. Allow me to introduce myself formally. My name is Dr. Emily Watson, and I am a senior data scientist with over 8 years of experience in machine learning and artificial intelligence. I hold a Ph.D. in Computer Science from Stanford University, where my research focused on natural language processing. Currently, I lead the AI research team at TechCorp, where we develop cutting-edge solutions for enterprise clients. I'm particularly passionate about democratizing AI education and have published numerous papers in leading journals. It's an honor to be here today, and I welcome any questions about my work.",
    expectedScore: 90,
    duration: 35
  },
  {
    name: "Creative/Artistic Introduction",
    transcript: "Hello wonderful people! I'm Luna, a 17-year-old dreamer and artist from Sunset High School. When I'm not painting vibrant landscapes, you'll find me composing music on my guitar or writing poetry that captures the beauty of everyday moments. I believe art has the power to change the world, which is why I founded our school's creative arts club that now has 50+ members. Last summer, I had the incredible opportunity to volunteer at a local community center, teaching art to underprivileged children. The joy in their eyes when they created their first masterpiece was truly life-changing. Thank you for letting me share my passion with you all!",
    expectedScore: 80,
    duration: 40
  }
];

async function testHuggingFaceScoring() {
  console.log('🚀 Testing Hugging Face Scoring API with Different Introductions');
  console.log('='.repeat(80));

  for (const test of testIntroductions) {
    console.log(`\n📝 Testing: ${test.name}`);
    console.log('─'.repeat(50));
    console.log(`Expected Score: ${test.expectedScore}/100`);
    console.log(`Transcript: "${test.transcript.substring(0, 100)}${test.transcript.length > 100 ? '...' : ''}"`);

    try {
      const response = await fetch('http://localhost:3001/api/hf-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: test.transcript,
          duration: test.duration,
          useHuggingFace: true,
          useAdvanced: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log(`❌ Error: ${errorData.error || 'Unknown error'}`);
        if (errorData.details) console.log(`   Details: ${errorData.details}`);
        continue;
      }

      const result = await response.json();

      console.log(`✅ Score: ${result.overallScore}/100 (${result.grade || 'N/A'})`);
      console.log(`🤖 Method: ${result.scoringMethod || 'Unknown'}`);
      console.log(`📊 Confidence: ${result.confidence ? (result.confidence * 100).toFixed(1) + '%' : 'N/A'}`);

      if (result.analysis) {
        console.log(`🔍 Analysis:`);
        console.log(`   Clarity: ${(result.analysis.clarity * 100).toFixed(0)}%`);
        console.log(`   Completeness: ${(result.analysis.completeness * 100).toFixed(0)}%`);
        console.log(`   Professionalism: ${(result.analysis.professionalism * 100).toFixed(0)}%`);
        console.log(`   Engagement: ${(result.analysis.engagement * 100).toFixed(0)}%`);
        console.log(`   Structure: ${(result.analysis.structure * 100).toFixed(0)}%`);
      }

      if (result.feedback && result.feedback.length > 0) {
        console.log(`💬 Feedback: ${result.feedback[0]}`);
      }

      if (result.strengths && result.strengths.length > 0) {
        console.log(`💪 Strength: ${result.strengths[0]}`);
      }

      if (result.improvements && result.improvements.length > 0) {
        console.log(`🔧 Improvement: ${result.improvements[0]}`);
      }

      // Calculate score difference
      const scoreDiff = Math.abs(result.overallScore - test.expectedScore);
      if (scoreDiff <= 10) {
        console.log(`✅ Score within expected range (±10 points)`);
      } else if (scoreDiff <= 20) {
        console.log(`⚠️  Score somewhat off from expected (${scoreDiff} points difference)`);
      } else {
        console.log(`❌ Score significantly different from expected (${scoreDiff} points difference)`);
      }

    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`);
    }

    console.log('\n' + '='.repeat(80));
  }

  console.log('\n🎯 Test Summary:');
  console.log('- If scores are in expected ranges: Hugging Face API is working correctly');
  console.log('- If scores are all similar/fallback: API might not be accessible');
  console.log('- If errors occur: Check API configuration and Hugging Face access');
}

// Run the tests
console.log('Starting Hugging Face API tests...');
testHuggingFaceScoring().catch(console.error);