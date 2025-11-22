// Direct test of Advanced NLP Scoring Engine with case study transcript
const { AdvancedScoringEngine } = require('./src/utils/advancedScoringEngine');

const caseStudyTranscript = `Hello everyone, myself Muskan, studying in class 8th B section from Christ Public School.
I am 13 years old. I live with my family. There are 3 people in my family, me, my mother and my father.
One special thing about my family is that they are very kind hearted to everyone and soft spoken. One thing I really enjoy is play, playing cricket and taking wickets.
A fun fact about me is that I see in mirror and talk by myself. One thing people don't know about me is that I once stole a toy from one of my cousin.
My favorite subject is science because it is very interesting. Through science I can explore the whole world and make the discoveries and improve the lives of others.
Thank you for listening.`;

const duration = 52; // seconds

async function testAdvancedScoring() {
  console.log('=== Testing Advanced NLP Scoring Engine ===');
  console.log('Transcript:', caseStudyTranscript);
  console.log('Duration:', duration + ' seconds');
  console.log('\n' + '='.repeat(60));

  try {
    const engine = new AdvancedScoringEngine();
    console.log('AdvancedScoringEngine instantiated successfully');

    console.log('\n🧠 Starting advanced NLP analysis...');
    const result = await engine.scoreTranscriptAdvanced(caseStudyTranscript, duration);

    console.log('\n✅ Advanced Scoring Results:');
    console.log('Overall Score:', result.overallScore + '/100');

    console.log('\n📊 Detailed Breakdown:');
    for (const [criterion, data] of Object.entries(result.detailedBreakdown)) {
      console.log(`\n${criterion}: ${data.score}/${data.maxScore}`);
      if (data.metrics) {
        for (const [metric, value] of Object.entries(data.metrics)) {
          console.log(`  - ${metric}: ${value}`);
        }
      }
    }

    // Test Three-Tiered Recommendations
    if (result.tieredRecommendations) {
      console.log('\n🎯 Three-Tiered Recommendations:');

      if (result.tieredRecommendations.ruleBased) {
        console.log('\n  🔧 Rule-Based:');
        result.tieredRecommendations.ruleBased.forEach(rec => {
          console.log(`    • ${rec}`);
        });
      }

      if (result.tieredRecommendations.semantic) {
        console.log('\n  🧠 Semantic:');
        result.tieredRecommendations.semantic.forEach(rec => {
          console.log(`    • ${rec}`);
        });
      }

      if (result.tieredRecommendations.advanced) {
        console.log('\n  🚀 Advanced NLP:');
        result.tieredRecommendations.advanced.forEach(rec => {
          console.log(`    • ${rec}`);
        });
      }
    }

    // Test AI-Powered Insights
    if (result.nlpInsights) {
      console.log('\n🤖 AI-Powered Insights:');

      if (result.nlpInsights.politenessAnalysis) {
        console.log('\n  Politeness & Professionalism:');
        console.log(`    Level: ${result.nlpInsights.politenessAnalysis.level}/5`);
        console.log(`    Sentiment: ${result.nlpInsights.politenessAnalysis.sentiment}`);
        if (result.nlpInsights.politenessAnalysis.professionalElements) {
          console.log(`    Professional Elements: ${result.nlpInsights.politenessAnalysis.professionalElements.join(', ')}`);
        }
      }

      if (result.nlpInsights.coherenceAnalysis) {
        console.log('\n  Discourse Coherence:');
        console.log(`    Score: ${result.nlpInsights.coherenceAnalysis.score}/5`);
        console.log(`    Flow Quality: ${result.nlpInsights.coherenceAnalysis.flowQuality}`);
      }

      if (result.nlpInsights.concisenessAnalysis) {
        console.log('\n  Conciseness & Core Message:');
        console.log(`    Efficiency: ${result.nlpInsights.concisenessAnalysis.efficiency}/5`);
        console.log(`    Core Message Density: ${result.nlpInsights.concisenessAnalysis.coreMessageDensity}/5`);
        if (result.nlpInsights.concisenessAnalysis.summary) {
          console.log(`    Summary: "${result.nlpInsights.concisenessAnalysis.summary}"`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Advanced NLP test completed successfully!');
    console.log(`Expected overall score: 86/100`);
    console.log(`Actual overall score: ${result.overallScore}/100`);

    // Validate against expected results
    console.log('\n📋 Validation Summary:');
    console.log(`✓ Advanced NLP features implemented: ${result.nlpInsights ? 'YES' : 'NO'}`);
    console.log(`✓ Three-tiered recommendations: ${result.tieredRecommendations ? 'YES' : 'NO'}`);
    console.log(`✓ Politeness analysis: ${result.nlpInsights?.politenessAnalysis ? 'YES' : 'NO'}`);
    console.log(`✓ Coherence analysis: ${result.nlpInsights?.coherenceAnalysis ? 'YES' : 'NO'}`);
    console.log(`✓ Core message analysis: ${result.nlpInsights?.concisenessAnalysis ? 'YES' : 'NO'}`);
    console.log(`✓ Tone & Register criterion: ${result.detailedBreakdown['Tone & Register'] ? 'YES' : 'NO'}`);

  } catch (error) {
    console.error('\n❌ Advanced Scoring test failed:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testAdvancedScoring();