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
    for (const criterion of result.criteria) {
      console.log(`\n${criterion.name}: ${criterion.score}/${criterion.maxScore}`);
      if (criterion.metrics) {
        for (const metric of criterion.metrics) {
          console.log(`  - ${metric.name}: ${metric.score}/${metric.maxScore} - ${metric.details}`);
        }
      }
    }

    // Test Three-Tiered Recommendations
    if (result.advancedInsights && result.advancedInsights.tieredRecommendations) {
      console.log('\n🎯 Three-Tiered Recommendations:');

      if (result.advancedInsights.tieredRecommendations.ruleBased) {
        console.log('\n  🔧 Rule-Based:');
        result.advancedInsights.tieredRecommendations.ruleBased.forEach(rec => {
          console.log(`    • ${rec}`);
        });
      }

      if (result.advancedInsights.tieredRecommendations.semantic) {
        console.log('\n  🧠 Semantic:');
        result.advancedInsights.tieredRecommendations.semantic.forEach(rec => {
          console.log(`    • ${rec}`);
        });
      }

      if (result.advancedInsights.tieredRecommendations.advancedNLP) {
        console.log('\n  🚀 Advanced NLP:');
        result.advancedInsights.tieredRecommendations.advancedNLP.forEach(rec => {
          console.log(`    • ${rec}`);
        });
      }
    }

    // Test Conciseness Analysis
    if (result.concisenessAnalysis) {
      console.log('\n📝 Conciseness & Core Message Analysis:');
      console.log(`  Original Length: ${result.concisenessAnalysis.originalLength} characters`);
      console.log(`  Summary Length: ${result.concisenessAnalysis.summary.length} characters`);
      console.log(`  Core Message Density: ${(result.concisenessAnalysis.coreMessageDensity * 100).toFixed(1)}%`);
      console.log(`  Summary: "${result.concisenessAnalysis.summary}"`);
      if (result.concisenessAnalysis.missingKeywords.length > 0) {
        console.log(`  Missing Keywords: ${result.concisenessAnalysis.missingKeywords.join(', ')}`);
      }
    }

    // Test NLP Insights from metrics
    console.log('\n🤖 AI-Powered Insights:');
    for (const criterion of result.criteria) {
      for (const metric of criterion.metrics) {
        if (metric.nlpInsights) {
          console.log(`\n  ${metric.name} NLP Analysis:`);
          if (metric.nlpInsights.modelAnalysis) {
            console.log(`    • Analysis: ${metric.nlpInsights.modelAnalysis}`);
          }
          if (metric.nlpInsights.recommendations && metric.nlpInsights.recommendations.length > 0) {
            console.log('    • Recommendations:');
            metric.nlpInsights.recommendations.forEach(rec => {
              console.log(`      - ${rec}`);
            });
          }
          if (metric.nlpInsights.detectedStrengths && metric.nlpInsights.detectedStrengths.length > 0) {
            console.log('    • Strengths:');
            metric.nlpInsights.detectedStrengths.forEach(strength => {
              console.log(`      - ${strength}`);
            });
          }
          if (metric.nlpInsights.detectedIssues && metric.nlpInsights.detectedIssues.length > 0) {
            console.log('    • Issues:');
            metric.nlpInsights.detectedIssues.forEach(issue => {
              console.log(`      - ${issue}`);
            });
          }
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