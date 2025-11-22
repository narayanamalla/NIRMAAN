# Communication Skills Analysis Tool

An AI-powered tool for analyzing and scoring student self-introduction transcripts using a comprehensive rubric-based evaluation system.

## Overview

This tool analyzes spoken communication skills by evaluating transcript text against a customizable rubric. It combines three scoring approaches:
- **Rule-based**: Keyword presence and word count validation
- **NLP-based**: Semantic similarity using sentence embeddings
- **Data-driven**: Weighted scoring based on rubric criteria

## Features

### 🎨 **Advanced UI Design**
- **Glassmorphism Effects**: Modern frosted glass appearance with backdrop blur
- **Dark Mode Support**: Complete dark theme with automatic system preference detection
- **Animated Backgrounds**: Floating orbs, gradient overlays, and subtle grid patterns
- **Micro-interactions**: Hover effects, smooth transitions, and animated progress bars
- **Gradient Borders**: Glowing border effects on cards and interactive elements

### 🚀 **Enhanced User Experience**
- **Smart Loading States**: Step-by-step analyzing animation with contextual messages
- **Interactive Score Cards**: Hover effects and color-coded performance indicators
- **Real-time Feedback**: Live word counting and instant visual responses
- **Professional Animations**: Smooth transitions, pulse effects, and scaling interactions
- **Theme Toggle**: Seamless light/dark mode switching with persistence

### 📊 **Comprehensive Evaluation**
- **Overall Score**: Large, prominent display with letter grades (A-F)
- **Detailed Rubric Analysis**: Individual metric cards with breakdowns
- **Progress Visualization**: Animated gradient progress bars
- **Performance Insights**: Color-coded feedback and suggestions
- **Quick Stats Dashboard**: Word count, duration, and speech rate metrics

### ✨ **Visual Excellence**
- **Modern Typography**: Gradient text effects and professional font hierarchy
- **Icon Integration**: Meaningful icons throughout the interface
- **Emoji Tips**: Engaging visual cues in the tips section
- **Shadow Effects**: Multi-layered shadows for depth and dimension
- **Responsive Gradients**: Adaptive color schemes based on performance

### 🎯 **Smart Features**
- **Persistent Settings**: Theme preference saved to localStorage
- **Mobile Optimization**: Touch-friendly interactions and responsive layouts
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Performance Optimized**: Efficient animations and transitions
- **Cross-browser Compatible**: Works seamlessly across all modern browsers

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
