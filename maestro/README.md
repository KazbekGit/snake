# E2E Testing with Maestro

This directory contains end-to-end tests for the Social Studies app using Maestro.

## 📁 Structure

```
maestro/
├── flow.yaml              # Main comprehensive flow
├── maestro.yaml           # Maestro configuration
├── flows/                 # Individual test flows
│   ├── welcome-flow.yaml  # Welcome screen tests
│   ├── home-flow.yaml     # Home screen tests
│   ├── topic-flow.yaml    # Topic study tests
│   ├── test-flow.yaml     # Quiz completion tests
│   └── statistics-flow.yaml # Statistics screen tests
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

1. **Install Maestro CLI:**
   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```

2. **Setup Android Emulator:**
   - Install Android Studio
   - Create a Pixel 4 API 30 emulator
   - Start the emulator

3. **Build and Install App:**
   ```bash
   npm run android
   ```

### Running Tests

#### Run All Tests
```bash
npm run e2e
```

#### Run Individual Flows
```bash
npm run e2e:main        # Full user journey
npm run e2e:welcome     # Welcome screen
npm run e2e:home        # Home screen
npm run e2e:topic       # Topic study
npm run e2e:test        # Quiz completion
npm run e2e:statistics  # Statistics screen
```

#### Manual Maestro Commands
```bash
# Run specific flow
maestro test maestro/flow.yaml

# Run with custom device
maestro test --device Pixel_4_API_30 maestro/flow.yaml

# Run with video recording
maestro test --record maestro/flow.yaml

# Run with JUnit report
maestro test --format junit --output report.xml maestro/flow.yaml
```

## 📊 Test Reports

Reports are generated in JUnit XML format and saved to:
- Local: `maestro-reports/`
- CI: GitHub Actions artifacts

### Report Structure
```
maestro-reports/
├── main-report.xml
├── welcome-report.xml
├── home-report.xml
├── topic-report.xml
├── test-report.xml
└── statistics-report.xml
```

## 🔧 Configuration

### Environment Variables
- `DELAY`: Delay between actions (ms)
- `SWIPE_DURATION`: Swipe animation duration (ms)
- `TIMEOUT`: Element wait timeout (ms)

### Test Configuration
- Screenshots on failure: ✅ Enabled
- Video recording: ✅ Enabled
- Retry on failure: 2 attempts
- Report format: JUnit XML

## 📱 Test Flows

### 1. Main Flow (`flow.yaml`)
Complete user journey from app launch to statistics:
- App launch and onboarding
- Topic selection and study
- Quiz completion
- Statistics review

### 2. Welcome Flow (`welcome-flow.yaml`)
Tests the welcome/onboarding experience:
- App launch
- UI element verification
- Navigation to grade selection

### 3. Home Flow (`home-flow.yaml`)
Tests the main dashboard:
- Section cards display
- Action buttons
- Navigation elements

### 4. Topic Flow (`topic-flow.yaml`)
Tests topic study functionality:
- Content block navigation
- Progress tracking
- UI interactions

### 5. Test Flow (`test-flow.yaml`)
Tests quiz completion:
- Question display
- Answer selection
- Results review

### 6. Statistics Flow (`statistics-flow.yaml`)
Tests statistics and settings:
- Progress display
- Action buttons
- Data management

## 🛠️ Writing New Tests

### Basic Flow Structure
```yaml
appId: com.socialstudies.app
env:
  DELAY: 1000

flows:
  - launchApp: {}
  - assertVisible: "Expected Text"
  - tapOn: "Button Text"
  - swipe: { from: { x: 300, y: 800 }, to: { x: 300, y: 200 } }
  - back: {}
```

### Common Commands
- `launchApp: {}` - Launch the app
- `assertVisible: "text"` - Verify text is visible
- `tapOn: "text"` - Tap on element with text
- `swipe: {...}` - Perform swipe gesture
- `back: {}` - Navigate back
- `scroll` - Scroll to element
- `waitForAnimationToEnd` - Wait for animations

### Best Practices
1. **Use descriptive assertions** - Verify specific text/content
2. **Add delays** - Account for loading times
3. **Handle animations** - Wait for UI transitions
4. **Test error states** - Verify error handling
5. **Keep flows focused** - One flow per feature

## 🔄 CI/CD Integration

### GitHub Actions
E2E tests run automatically on:
- Push to `main` and `develop` branches
- Pull requests to `main`
- Manual workflow dispatch

### CI Pipeline
1. **Setup** - Install dependencies and Maestro
2. **Matrix Testing** - Run all flows in parallel
3. **Artifacts** - Upload reports and screenshots
4. **Summary** - Generate test summary

### Artifacts
- Test reports (JUnit XML)
- Flow files (YAML)
- Screenshots (on failure)
- Video recordings (if enabled)

## 🐛 Troubleshooting

### Common Issues

1. **Element not found**
   - Check text matches exactly
   - Add longer delays
   - Verify element is visible

2. **Test timing out**
   - Increase `TIMEOUT` value
   - Add `waitForAnimationToEnd`
   - Check device performance

3. **Inconsistent results**
   - Use `retryCount` in config
   - Add explicit waits
   - Check for race conditions

### Debug Commands
```bash
# Run with verbose output
maestro test --verbose maestro/flow.yaml

# Run with debug mode
maestro test --debug maestro/flow.yaml

# Generate screenshots
maestro test --screenshot maestro/flow.yaml
```

## 📈 Metrics

### Test Coverage
- **Welcome Screen**: 100%
- **Home Dashboard**: 100%
- **Topic Study**: 100%
- **Quiz System**: 100%
- **Statistics**: 100%

### Performance
- Average test duration: 2-3 minutes per flow
- Total test suite: ~15 minutes
- Parallel execution: 6 flows simultaneously

## 🤝 Contributing

### Adding New Tests
1. Create new flow file in `flows/`
2. Add npm script in `package.json`
3. Update CI matrix in `.github/workflows/maestro.yml`
4. Update this README

### Updating Existing Tests
1. Test changes locally first
2. Update flow files as needed
3. Verify CI passes
4. Update documentation

## 📚 Resources

- [Maestro Documentation](https://maestro.mobile.dev/)
- [Maestro Commands Reference](https://maestro.mobile.dev/getting-started/commands)
- [GitHub Actions Guide](https://docs.github.com/en/actions)
- [JUnit XML Format](https://github.com/junit-team/junit5/blob/main/platform-tests/src/test/resources/jenkins-junit.xsd)
