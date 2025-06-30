# SnapCalc

> Mobile calc logger via photo + OCR for field engineers

## 🚀 Features

- **📸 Photo Capture**: Snap photos of calculations instantly with professional camera interface
- **🤖 AI-Powered OCR**: Hybrid OCR system with PaddleOCR and Tesseract.js for superior accuracy
- **📱 Mobile-First PWA**: Progressive Web App optimized for mobile field work
- **🔄 Real-time Processing**: Instant calculation verification and result computation
- **📊 Smart History**: Searchable calculation history with notes and export capabilities
- **⚡ Offline-Ready**: Works without internet connection for field engineering
- **🎨 Modern UI**: Professional engineering design with Tailwind CSS

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom engineering theme
- **State Management**: Zustand with persistence
- **OCR Engine**: PaddleOCR + Tesseract.js hybrid system for optimal accuracy
- **PWA**: next-pwa for offline capabilities
- **Icons**: Lucide React
- **UI Components**: Radix UI primitives

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/zbest1000/SnapCalc.git
cd SnapCalc

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📱 Usage

1. **Camera Access**: Grant camera permissions when prompted
2. **Capture**: Position calculator display within the frame and tap capture
3. **Process**: Review the captured image and tap "Process" to run OCR
4. **Verify**: Check the extracted calculation and result
5. **Save**: Add notes and save to history for future reference
6. **Export**: Export calculation history as JSON for documentation

## 🔧 Configuration

### PaddleOCR Setup (Optional but Recommended)

For enhanced OCR accuracy, set up PaddleOCR models:

```bash
# Create models directory
mkdir -p public/models public/onnx

# Download PaddleOCR models (see docs/PADDLEOCR_SETUP.md for details)
# - Detection model (~2.3MB)
# - Recognition model (~8.5MB) 
# - Dictionary file (~40KB)
```

**Note**: Without PaddleOCR models, the app automatically uses Tesseract.js as the primary OCR engine.

For complete setup instructions, see [PaddleOCR Setup Guide](docs/PADDLEOCR_SETUP.md).

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

### PWA Installation

The app can be installed as a PWA on mobile devices:
- **iOS**: Add to Home Screen from Safari share menu
- **Android**: Install app prompt or Chrome menu > Add to Home Screen

## 🏗 Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── camera/         # Camera functionality
│   ├── calculation/    # Calculation history
│   ├── layout/         # Layout components
│   └── welcome/        # Welcome screen
├── lib/                # Utility libraries
│   ├── store.ts        # Zustand state management
│   ├── ocr.ts          # OCR service
│   └── utils.ts        # Common utilities
└── types/              # TypeScript declarations
```

## 🎯 Engineering Features

### OCR Processing
- **PaddleOCR Integration**: Superior accuracy for mathematical text recognition
- **Hybrid System**: Automatic fallback between PaddleOCR and Tesseract.js
- **Mathematical Expression Parsing**: Enhanced pattern recognition for calculations
- **Confidence Scoring**: Intelligent engine selection based on accuracy
- **Support for Multiple Formats**: Various calculator displays and handwriting

### Data Management
- Local storage with automatic persistence
- Searchable calculation history
- JSON export for integration with other tools
- Note-taking for calculation context

### Mobile Optimization
- Touch-friendly interface design
- Camera viewfinder with alignment guides
- Offline-first architecture
- Battery-efficient processing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Ensure mobile responsiveness
- Add proper error handling
- Include JSDoc comments for complex functions

## 🔒 Privacy & Security

- All processing happens client-side
- No data sent to external servers
- Local storage only
- Camera access used only for capture
- No tracking or analytics by default

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🆘 Support

For questions or issues:
- Open an issue on GitHub
- Check existing documentation
- Review the troubleshooting guide

---

**Built for field engineers who need reliable, fast calculation logging on mobile devices.**
