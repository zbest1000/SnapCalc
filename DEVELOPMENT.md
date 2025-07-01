# SnapCalc Development Guide

## 🚀 Getting Started

### Quick Setup
```bash
# Run the automated setup script
npm run setup

# Or manual setup:
npm install
cp .env.example .env.local
npm run dev
```

## 🏗️ Architecture

### Technology Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Variables
- **State Management**: Zustand with persistence
- **OCR Engine**: Tesseract.js (client-side)
- **PWA**: next-pwa
- **UI Components**: Custom components with Radix UI primitives

### Key Features Implementation

#### 1. Camera Integration
- Native `getUserMedia()` API for camera access
- Canvas-based image capture
- Mobile-optimized viewfinder with alignment guides
- Fallback to file upload for devices without camera

#### 2. OCR Processing
- Tesseract.js Web Worker for background processing
- Optimized for calculator display recognition
- Mathematical expression parsing
- Confidence scoring and validation

#### 3. PWA Capabilities
- Service Worker for offline functionality
- App manifest for installability
- Mobile-first responsive design
- Touch-optimized interactions

#### 4. Data Management
- Client-side storage with Zustand
- Persistent state across sessions
- JSON export functionality
- Search and filtering capabilities

## 🛠️ Development Workflow

### File Structure
```
src/
├── app/                    # Next.js App Router
├── components/             # React Components
│   ├── ui/                # Base UI components
│   ├── camera/            # Camera functionality
│   ├── calculation/       # History and processing
│   ├── layout/            # Layout components
│   └── welcome/           # Onboarding
├── lib/                   # Utilities and services
├── types/                 # TypeScript definitions
└── hooks/                 # Custom React hooks (future)
```

### Component Guidelines
- Use TypeScript for all components
- Follow the custom/ui component pattern
- Implement proper loading states
- Handle errors gracefully
- Optimize for mobile performance

### State Management
- Zustand store for application state
- Persist important data locally
- Use TypeScript interfaces for type safety
- Keep state minimal and normalized

## 📱 Mobile Development

### Testing on Mobile
1. **Development**: Use browser dev tools mobile simulation
2. **Network Testing**: Use ngrok for HTTPS tunnel to test PWA features
3. **Real Device**: Build production version and serve over HTTPS

### PWA Features
- **Installable**: Meets PWA criteria for installation prompts
- **Offline**: Core functionality works without network
- **Responsive**: Adapts to different screen sizes
- **Fast**: Optimized loading and interactions

### Camera Considerations
- **Permissions**: Handle camera access gracefully
- **Fallbacks**: File upload when camera unavailable
- **Performance**: Optimize image processing
- **Battery**: Efficient camera usage patterns

## 🔧 Configuration

### Environment Variables
```bash
# Development
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional integrations
NEXT_PUBLIC_OCR_API_KEY=optional_external_ocr
NEXT_PUBLIC_GA_TRACKING_ID=optional_analytics
```

### Build Configuration
- **Next.js**: Configured for PWA with next-pwa
- **TypeScript**: Strict mode enabled
- **Tailwind**: Custom engineering theme
- **ESLint**: Next.js recommended rules

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] Camera access and capture
- [ ] OCR text recognition accuracy
- [ ] Calculation parsing and validation
- [ ] History management (CRUD operations)
- [ ] PWA installation and offline usage
- [ ] Mobile responsiveness
- [ ] Performance on low-end devices

### Automated Testing (Future)
- Unit tests for utility functions
- Component testing with React Testing Library
- E2E testing for critical user flows
- Performance testing for OCR processing

## 🔍 Debugging

### Common Issues
1. **Camera Access**: Check HTTPS requirement and permissions
2. **OCR Accuracy**: Verify image quality and lighting
3. **PWA Installation**: Ensure HTTPS and manifest validity
4. **Performance**: Monitor OCR processing time and memory usage

### Development Tools
- React Developer Tools
- Next.js built-in debugging
- Browser dev tools for mobile simulation
- Lighthouse for PWA and performance auditing

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Performance Optimization
- Image optimization with Next.js
- Code splitting for OCR worker
- Service Worker caching strategies
- Minimal bundle size analysis

### PWA Deployment Checklist
- [ ] HTTPS enabled
- [ ] Valid manifest.json
- [ ] Service worker registered
- [ ] Icons and screenshots provided
- [ ] Lighthouse PWA score > 90

## 🤝 Contributing Guidelines

### Code Style
- Follow TypeScript strict mode
- Use Prettier for formatting
- Follow React best practices
- Write self-documenting code

### Pull Request Process
1. Create feature branch from main
2. Implement feature with tests
3. Update documentation if needed
4. Submit PR with clear description
5. Address review feedback

### Issues and Features
- Use GitHub issues for bugs
- Use feature templates for enhancements
- Include mobile testing results
- Provide reproduction steps

---

**Happy coding! 🎉**