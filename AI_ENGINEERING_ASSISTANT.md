# AI Engineering Assistant

## Overview

The AI Engineering Assistant is a powerful feature integrated into SnapCalc that provides intelligent formula recommendations, unit conversions, and step-by-step calculations for engineering problems. It's designed to help engineers quickly find and apply the right formulas for their calculations across multiple engineering disciplines.

## Features

### 🤖 Intelligent Query Analysis
- Natural language processing to understand engineering questions
- Automatic detection of engineering categories (mechanical, electrical, structural, etc.)
- Extraction of numerical values and units from user queries
- Context-aware formula suggestions

### 📋 Comprehensive Formula Database
- **Mechanical Engineering**: Motor calculations, RPM conversions, belt ratios, torque/power relationships
- **Electrical Engineering**: Ohm's law, power calculations, motor efficiency
- **Structural Engineering**: Beam calculations, load analysis
- **Fluid Dynamics**: Flow rates, pipe calculations
- **Thermodynamics**: Heat transfer, temperature conversions

### 🔄 Smart Unit Conversions
- RPM to linear speed (m/s, ft/min)
- Power conversions (HP, kW, Watts)
- Length, area, volume, and temperature conversions
- Context-aware conversion suggestions

### 📊 Interactive Calculations
- Step-by-step calculation breakdown
- Real-time formula evaluation
- Input validation and guidance
- Save calculations to history

## Usage Examples

### Motor RPM to Linear Speed Conversion
**Question**: "Convert 1800 RPM to feet per minute with 6 inch pulley"

**AI Response**: 
- Recommends RPM to FPM formula: `FPM = π × D(ft) × RPM`
- Provides step-by-step calculation
- Shows result: 2,827 ft/min

### Power Calculation
**Question**: "Calculate motor power from 100 lb-ft torque at 1800 RPM"

**AI Response**:
- Suggests power formula: `P = (T × RPM) / 5252`
- Interactive calculator with input fields
- Result: 34.3 HP

### Belt Drive Analysis
**Question**: "What's the belt ratio for 6 inch drive pulley and 12 inch driven pulley?"

**AI Response**:
- Belt ratio formula: `ratio = D2 / D1`
- Calculation: 12 / 6 = 2:1 ratio
- Explains speed reduction effect

## Technical Implementation

### Core Components

#### 1. AIEngineeringAssistant Class (`src/lib/ai-engineering-assistant.ts`)
```typescript
class AIEngineeringAssistant {
  // Query analysis and formula matching
  async analyzeQuery(query: EngineeringQuery): Promise<AIRecommendation[]>
  
  // Formula calculations with step-by-step breakdown
  calculateFormula(request: CalculationRequest): CalculationResponse
  
  // Quick conversion helpers
  convertRpmToLinearSpeed(rpm: number, diameter: number): number
  convertRpmToFpm(rpm: number, diameterInches: number): number
}
```

#### 2. Formula Database (`src/lib/engineering-formulas.ts`)
- Structured formula definitions with metadata
- Variable descriptions and units
- Example calculations
- Searchable by keywords and categories

#### 3. UI Components
- **AIAssistant**: Main chat interface
- **RecommendationCard**: Displays formula suggestions
- **FormulaCalculator**: Interactive calculation modal
- **QuickActions**: Common calculation shortcuts

### Data Structures

#### EngineeringFormula
```typescript
interface EngineeringFormula {
  id: string
  name: string
  formula: string
  description: string
  category: EngineeringCategory
  variables: Variable[]
  examples: FormulaExample[]
  tags: string[]
}
```

#### AIRecommendation
```typescript
interface AIRecommendation {
  type: 'formula' | 'conversion' | 'calculation' | 'explanation'
  title: string
  description: string
  formula?: EngineeringFormula
  confidence: number
  reasoning: string
  examples: string[]
}
```

## Key Engineering Formulas Included

### Mechanical Engineering
1. **Motor RPM to Linear Speed**: `v = (π × D × RPM) / 60`
2. **RPM to FPM**: `FPM = π × D(ft) × RPM`
3. **Power from Torque**: `P = (T × RPM) / 5252`
4. **Belt Drive Ratio**: `ratio = D2 / D1`

### Electrical Engineering
1. **Ohm's Law**: `V = I × R`
2. **Electrical Power**: `P = V × I`
3. **Motor Efficiency**: `η = (P_out / P_in) × 100`

### Fluid Dynamics
1. **Flow Rate in Pipe**: `Q = π × (D/2)² × v`

### Structural Engineering
1. **Beam Moment**: `M = (w × L²) / 8`

### Thermodynamics
1. **Heat Conduction**: `q = k × A × (T1 - T2) / L`

## AI Pattern Recognition

### Query Types Detected
- **RPM Conversion**: Recognizes requests for rotational to linear speed conversion
- **Power Calculations**: Identifies power-related queries with torque/RPM inputs
- **Belt Calculations**: Detects pulley and belt drive questions
- **Flow Calculations**: Recognizes pipe flow and fluid velocity queries
- **Electrical Power**: Identifies voltage/current to power conversions

### Confidence Scoring
- Keyword matching: Base confidence of 50%
- Formula variable alignment: +10% confidence
- Unit detection: +10% confidence
- Multiple matches: Highest confidence formula prioritized

## Integration with SnapCalc

### Seamless Workflow
1. **Camera OCR**: Extract text from calculator photos
2. **AI Analysis**: Process extracted text for engineering calculations
3. **Formula Suggestions**: Get relevant formula recommendations
4. **Interactive Calculation**: Use AI assistant for step-by-step solutions
5. **History Integration**: Save AI calculations alongside OCR results

### Data Persistence
- AI calculations saved to calculation history
- Tagged as 'ai-calculation' for easy filtering
- Include formula name, inputs, and results
- Searchable alongside OCR calculations

## Usage Instructions

### Getting Started
1. Open SnapCalc application
2. Navigate to "AI Assistant" tab (Bot icon)
3. Type your engineering question in natural language
4. Review formula recommendations
5. Click on a formula to open the interactive calculator
6. Enter your values and calculate
7. Save results to history

### Best Practices
- **Be Specific**: Include units and context in your questions
- **Use Keywords**: Mention relevant terms like "motor", "RPM", "power", etc.
- **Provide Values**: Include numerical values when asking for calculations
- **Check Units**: Verify input and output units match your requirements

### Example Queries
```
✅ Good:
- "Convert 1800 RPM motor to linear speed with 8 inch wheel"
- "Calculate electrical power from 240V and 15A"
- "What's the torque needed for 50 HP at 1750 RPM?"

❌ Avoid:
- "Calculate something"
- "Help with math"
- "Convert units"
```

## Future Enhancements

### Planned Features
- **More Formulas**: Expand database with additional engineering disciplines
- **Unit Converter**: Standalone unit conversion tool
- **Formula Library**: Browse and search all available formulas
- **Custom Formulas**: Allow users to add their own formulas
- **Voice Input**: Speech-to-text for hands-free operation
- **Favorites**: Save frequently used formulas for quick access

### Advanced Capabilities
- **Multi-step Calculations**: Chain multiple formulas together
- **Error Checking**: Validate inputs and suggest corrections
- **Engineering Standards**: Include industry standards and safety factors
- **Material Properties**: Database of common engineering materials
- **Design Guidelines**: Best practices and design recommendations

## Troubleshooting

### Common Issues
1. **No Recommendations**: Try rephrasing with more specific engineering terms
2. **Wrong Formula**: Check if the detected category matches your discipline
3. **Calculation Errors**: Verify input values and units
4. **Missing Variables**: Ensure all required inputs are provided

### Tips for Better Results
- Use standard engineering terminology
- Include units in your questions
- Be specific about the type of calculation needed
- Mention the engineering discipline when ambiguous

## Technical Notes

### Performance
- Formula matching: ~10ms response time
- Calculation engine: Real-time evaluation
- Database size: 50+ formulas across 6 categories
- Memory usage: Minimal, efficient caching

### Compatibility
- Works offline (no internet required)
- Mobile-optimized interface
- Supports all modern browsers
- PWA installation compatible

### Security
- All calculations performed locally
- No data sent to external servers
- Privacy-focused design
- No user tracking

---

The AI Engineering Assistant transforms SnapCalc from a simple OCR calculator into a comprehensive engineering calculation companion, making it an indispensable tool for field engineers and technical professionals.