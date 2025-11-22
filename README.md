# Communication Skills Analysis Tool

An AI-powered tool for analyzing and scoring student self-introduction transcripts using a comprehensive rubric-based evaluation system.

## Overview

This tool analyzes spoken communication skills by evaluating transcript text against a customizable rubric. It combines three scoring approaches:
- **Rule-based**: Keyword presence and word count validation
- **NLP-based**: Semantic similarity using sentence embeddings
- **Data-driven**: Weighted scoring based on rubric criteria

## Features

- **Modern UI Design**: Beautiful gradient backgrounds, card-based layout, and professional styling
- **Enhanced Transcript Input**: Large textarea with helpful placeholder text and real-time word counting
- **Smart Scoring Animation**: Loading states with spinning indicators and smooth transitions
- **Comprehensive Evaluation**:
  - Overall score with letter grade (A-F)
  - Per-criterion scores with individual metric breakdowns
  - Detailed feedback for each scoring component
  - Speech rate calculation with WPM indicators
  - Word count validation and duration tracking
- **Rich Visual Feedback**:
  - Gradient progress bars with animated fills
  - Color-coded performance indicators (Emerald/Blue/Yellow/Orange/Red)
  - Interactive hover effects and smooth transitions
  - Professional card-based layout with shadows
- **Quick Stats Sidebar**: Real-time statistics and helpful tips
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Accessibility**: Proper labels, keyboard navigation, and screen reader support

## Technology Stack

- **Frontend**: Next.js 16 with React 19 and TypeScript
- **Styling**: Tailwind CSS
- **NLP**: @xenova/transformers for sentence embeddings
- **Text Processing**: Natural.js for basic text analysis
- **UI Components**: Custom React components

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd NIRMAAN
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Enter Transcript**: Paste or type the student's self-introduction in the text area
2. **Score**: Click the "Score Transcript" button to analyze
3. **Review Results**: View the overall score and detailed breakdown by criterion

## Scoring Formula

The tool uses a weighted scoring system:

```
Criterion Score = (Keyword Score × 0.3) + (Semantic Score × 0.4) + (Word Count Score × 0.3)

Final Score = Σ(Criterion Score × Criterion Weight)
```

### Components:

- **Keyword Score**: Percentage of rubric keywords found in transcript
- **Semantic Score**: Cosine similarity between transcript and rubric description (0-100)
- **Word Count Score**: 100 if within limits, penalty applied otherwise

## Rubric Structure

The rubric (`rubric.json`) contains:

```json
{
  "title": "Self-Introduction Rubric",
  "criteria": [
    {
      "name": "Criterion Name",
      "description": "Description of what this criterion evaluates",
      "weight": 0.25,
      "keywords": ["keyword1", "keyword2"],
      "minWords": 50,
      "maxWords": 100
    }
  ]
}
```

## Customization

### Modifying the Rubric

1. Edit `rubric.json` to:
   - Add/remove criteria
   - Adjust weights (must sum to 1.0)
   - Update keywords
   - Set word count limits

### Adding New Scoring Logic

The scoring engine (`src/utils/scoringEngine.ts`) can be extended:
- Modify scoring weights in the `scoreTranscript` method
- Add new analysis methods
- Update feedback generation logic

## Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

No environment variables required - all processing is done client-side using browser-compatible NLP libraries.

## API Endpoint

**POST** `/api/score`

**Request Body:**
```json
{
  "transcript": "Student's self-introduction text"
}
```

**Response:**
```json
{
  "overallScore": 85,
  "wordCount": 52,
  "criteria": [
    {
      "name": "Clarity and Conciseness",
      "score": 90,
      "weight": 0.25,
      "semanticSimilarity": 0.85,
      "keywordsFound": ["clear", "concise"],
      "feedback": "Excellent clarity..."
    }
  ]
}
```

## Testing

The `test-scenarios.js` file contains sample test cases:

```bash
node test-scenarios.js
```

Use these transcripts to manually verify scoring accuracy.

## Performance Notes

- **First Load**: Initial NLP model loading may take a few seconds
- **Subsequent Scoring**: Fast response after model initialization
- **Browser Compatibility**: Works in modern browsers with WebAssembly support

## Architecture

```
src/
├── app/
│   ├── api/score/          # API route for scoring
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main UI component
├── utils/
│   └── scoringEngine.ts    # Core scoring logic
├── rubric.json             # Evaluation rubric
└── test-scenarios.js       # Test cases
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with provided scenarios
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues or questions:
- Check the test scenarios for expected behavior
- Review the scoring engine documentation
- Verify rubric configuration is correct
