# Life Skills Skill Tree - Personal Development Gamification

![Life Skills Skill Tree Application](https://github.com/user-attachments/assets/74417ee4-7fc8-4092-bde6-d1ee095f902f)

An interactive web-based application that transforms personal development into an engaging, game-like experience by visualizing life skills as an interconnected skill tree similar to Path of Exile's passive skill system. Track your progress across 7 life domains: Family, Business, Relationships, Health, Finances, Spirituality, and Emotions.

## 🌟 Features

### ✅ **Currently Implemented**
- **Interactive UI**: Responsive design with dark theme and category navigation
- **7 Life Categories**: Family, Business, Relationships, Health, Finances, Spirituality, Emotions
- **15+ Initial Skills**: Comprehensive skill database with prerequisites and unlocking system
- **Progress Tracking**: Local storage persistence with auto-save functionality
- **Import/Export**: JSON-based backup and sharing system with validation
- **PWA Support**: Service worker for offline functionality
- **Accessibility**: WCAG 2.1 AA compliance with ARIA labels and keyboard navigation
- **Responsive Design**: Mobile-first approach supporting 320px+ width devices
- **Category Navigation**: Click-to-focus system with visual feedback

### 🚀 **Planned Features**
- Canvas-based skill tree visualization with interactive nodes
- Skill completion with point allocation system
- Achievement celebration animations
- Touch interactions for mobile devices
- Advanced filtering and search capabilities

## 🏗️ **TDD Development Approach**

This project follows Test-Driven Development using Gherkin feature files:

- [`features/skill-tree-display.feature`](features/skill-tree-display.feature) - Canvas display and visualization
- [`features/skill-completion.feature`](features/skill-completion.feature) - Progress tracking and skill completion  
- [`features/data-persistence.feature`](features/data-persistence.feature) - Local storage and import/export
- [`features/navigation-interaction.feature`](features/navigation-interaction.feature) - User interaction and navigation

## 🚀 **Quick Start**

### Prerequisites
- Modern web browser with HTML5 Canvas support
- HTTP server (for local development)

### Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/jbucknor/sb_my_org_skill-tree.git
   cd sb_my_org_skill-tree
   ```

2. **Serve locally** (choose one method)
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js
   npx http-server
   
   # PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### GitHub Pages Deployment
The application is automatically deployed to GitHub Pages via GitHub Actions:
1. Push changes to the `main` branch
2. GitHub Actions will build and deploy automatically
3. Access at: `https://yourusername.github.io/sb_my_org_skill-tree/`

## 📱 **Usage**

### Navigation
- **Category Selection**: Click on any of the 7 skill categories to focus
- **Zoom Controls**: Use zoom in (+), zoom out (-), and reset view (🎯) buttons  
- **Export Progress**: Download your skill progress as JSON (💾)
- **Import Progress**: Upload previously exported JSON files (📁)

### Skill Management
- **View Skills**: Browse through skills in each category
- **Track Progress**: Mark skills as completed to earn points
- **Prerequisites**: Some skills require completing other skills first
- **Progress Tracking**: View completion percentages and total points earned

### Data Management
- **Auto-Save**: Progress is automatically saved to browser local storage
- **Export**: Download your progress for backup or sharing
- **Import**: Restore progress from exported files
- **Version Compatibility**: Data migration support for future updates

## 🏗️ **Architecture**

### Frontend Stack
- **HTML5**: Semantic markup with Canvas API for visualization
- **CSS3**: Mobile-first responsive design with animations
- **Vanilla JavaScript**: Modular ES6+ architecture with proper error handling
- **PWA**: Service Worker for offline functionality and caching

### Project Structure
```
/
├── index.html              # Main application entry point
├── css/                   # Stylesheets
│   ├── styles.css         # Main styling and layout
│   ├── animations.css     # Skill completion animations
│   ├── responsive.css     # Mobile-first responsive design
│   └── themes.css         # Category color themes
├── js/                    # JavaScript modules
│   ├── app.js            # Main application controller
│   ├── skill-data.js     # Skill definitions and data model
│   ├── user-progress.js  # Progress tracking and persistence
│   ├── canvas-renderer.js # HTML5 Canvas visualization
│   ├── skill-tree.js     # Tree logic and layout algorithms
│   ├── navigation.js     # Pan/zoom/keyboard navigation
│   ├── animations.js     # Visual effects and particles
│   └── import-export.js  # JSON validation and backup
├── features/             # Gherkin BDD test scenarios
├── manifest.json         # PWA manifest
├── service-worker.js     # Offline functionality
└── .github/workflows/    # GitHub Pages deployment
```

### Data Model
Skills are structured with:
- **Categories**: 7 life domains with distinct themes
- **Prerequisites**: Skill dependencies and unlocking system  
- **Points**: Achievement values (1-5 for minor, 25-250 for major)
- **Achievements**: Specific tasks to complete each skill
- **Positioning**: Coordinate system for tree visualization

## 💾 **Data Persistence**

### Local Storage
- **Auto-Save**: Progress saved automatically on skill completion
- **Persistence**: Data survives browser restarts and updates
- **Validation**: Data integrity checks on load and save

### Import/Export Format
```json
{
  "version": "1.0.0",
  "completedSkills": ["skill_id_1", "skill_id_2"],
  "totalPoints": 25,
  "categoryProgress": {
    "family": { "completedCount": 2, "totalSkills": 5, "percentage": 40 }
  },
  "exportDate": "2025-08-27T11:46:38.073Z"
}
```

## 🎨 **Skill Categories**

1. **👨‍👩‍👧‍👦 Family** - Communication, time investment, conflict resolution
2. **💼 Business** - Leadership, project management, career development
3. **🤝 Relationships** - Social skills, networking, empathy
4. **🏃‍♂️ Health** - Fitness, nutrition, mental well-being
5. **💰 Finances** - Budgeting, investing, money management
6. **🧘‍♀️ Spirituality** - Meditation, mindfulness, purpose discovery
7. **😊 Emotions** - Emotional intelligence, stress management

## 🔧 **Development**

### Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Canvas**: HTML5 Canvas API for interactive skill tree
- **PWA**: Service Worker, Web App Manifest
- **Build**: No build process required - runs directly in browser
- **Deployment**: GitHub Pages with automated workflows

### Code Style
- **Modular Architecture**: Separated concerns with individual JS modules
- **Error Handling**: Comprehensive try-catch blocks and validation
- **Accessibility**: WCAG 2.1 AA compliance with ARIA labels
- **Performance**: Viewport culling, lazy loading, efficient Canvas rendering
- **Documentation**: Comprehensive JSDoc comments throughout

### Local Development
```bash
# Start development server
python -m http.server 8000

# Open browser developer tools for debugging
# Console shows detailed logging for all operations
```

## 📊 **Performance**

### Benchmarks
- **Load Time**: Target <3 seconds on 3G connections
- **Animations**: Smooth 60fps rendering
- **Memory**: Efficient Canvas with viewport optimization
- **Mobile**: Full functionality on devices 320px+ width

### Optimizations
- **Service Worker**: Caches static assets for offline use
- **Lazy Loading**: Progressive skill data loading
- **Canvas Optimization**: Only renders visible elements
- **Responsive Images**: Optimized assets for different screen sizes

## 🛡️ **Browser Support**

### Supported Browsers
- **Desktop**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile**: iOS Safari 12+, Chrome Mobile 60+, Samsung Internet 8+

### Progressive Enhancement
- **Graceful Degradation**: Basic functionality without JavaScript
- **Canvas Fallback**: Alternative interface for unsupported browsers
- **Touch Support**: Optimized interactions for mobile devices

## 📝 **Contributing**

### Development Process
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Follow** the existing code style and architecture
4. **Add** Gherkin tests for new features
5. **Test** across multiple browsers
6. **Commit** changes (`git commit -m 'Add amazing feature'`)
7. **Push** to branch (`git push origin feature/amazing-feature`)
8. **Create** a Pull Request

### Guidelines
- Follow the established modular JavaScript architecture
- Add appropriate error handling and validation
- Include accessibility features (ARIA labels, keyboard navigation)
- Test on mobile devices and various screen sizes
- Update documentation for new features

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋 **Support**

- **Documentation**: Check the [docs/](docs/) folder for detailed guides
- **Issues**: Report bugs or request features via GitHub Issues
- **Discussions**: Join conversations in GitHub Discussions

## 🗺️ **Roadmap**

### Phase 1: Foundation ✅ **(Completed)**
- [x] Project structure and build system
- [x] Responsive UI with 7 skill categories
- [x] Local storage progress tracking
- [x] Import/export functionality  
- [x] PWA support with service worker
- [x] GitHub Pages deployment

### Phase 2: Core Functionality 🚧 **(In Progress)**
- [ ] Interactive Canvas skill tree visualization
- [ ] Skill completion system with point allocation
- [ ] Visual effects for achievements
- [ ] Touch interactions for mobile
- [ ] Advanced navigation (pan/zoom)

### Phase 3: Enhancement 📋 **(Planned)**
- [ ] Expanded skill database (150+ skills)
- [ ] Achievement celebration animations
- [ ] Search and filtering system
- [ ] Multiple persona support
- [ ] Social sharing features
- [ ] Analytics and progress insights

---

**Made with ❤️ using vanilla HTML, CSS, and JavaScript**

*Transform your personal development journey into an engaging, game-like experience!*