# NASA BioSpace Dashboard 🚀

An interactive, space-themed web application for exploring 608 NASA bioscience publications with AI-powered insights, data visualizations, and educational games.

## 🌟 Features

### 1. **Interactive Research Explorer**
- Search and filter through 608 NASA bioscience publications
- AI-powered summaries and insights
- Filter by category, year, and keywords
- Grid and list view options
- Real-time search with instant results

### 2. **Data Visualizations**
- **Overview Charts**: Publications by year and category
- **Trend Analysis**: Citation trends and emerging research areas
- **Impact Metrics**: Research impact scores and mission analysis
- **Knowledge Gaps**: Identification of research gaps and areas of consensus/disagreement
- Interactive charts using Recharts library

### 3. **Games & Quizzes**
- **Quiz Challenge**: Test your space bioscience knowledge with 5 questions
- **Memory Match Game**: Space-themed memory matching game
- Progress tracking and scoring system
- Educational explanations for each question

### 4. **NASA Live Data Integration**
- Real-time NASA Astronomy Picture of the Day (APOD)
- Live feed updates from NASA APIs
- Caching for optimal performance

### 5. **Space-Themed UI**
- Custom space color palette with gradients
- Animated star field background
- Particle effects and floating elements
- Orbitron and Space Grotesk fonts
- Glow effects and smooth animations
- Fully responsive design

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/UI
- **Charts**: Recharts
- **Animations**: Framer Motion
- **APIs**: NASA Open APIs

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install
# or
bun install

# Run development server
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🎨 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── nasa/          # NASA API routes
│   ├── research/          # Research explorer page
│   ├── visualizations/    # Data visualization page
│   ├── games/            # Games & quizzes page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Homepage
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # Shadcn UI components
│   ├── StarField.tsx     # Animated star background
│   ├── Navigation.tsx    # Main navigation
│   ├── NasaLiveFeed.tsx  # NASA APOD component
│   ├── FloatingElement.tsx
│   ├── AnimatedCounter.tsx
│   ├── PlanetOrbit.tsx
│   └── GlowCard.tsx
└── lib/                  # Utility functions
```

## 🌐 Pages

### Homepage (`/`)
- Hero section with gradient text animations
- Feature cards showcasing main sections
- Statistics display with animated counters
- NASA live feed (APOD)
- Navigation to all sections

### Research Explorer (`/research`)
- Search bar with real-time filtering
- Category and year filters
- List and grid view toggle
- Publication cards with metadata
- Keywords and mission information

### Data Visualizations (`/visualizations`)
- Publication trends (bar chart)
- Category distribution (pie chart)
- Research impact (radar chart)
- Citation trends (line chart)
- Knowledge gaps analysis
- Mission impact metrics

### Games & Quizzes (`/games`)
- Interactive quiz with 5 questions
- Multiple choice format
- Instant feedback and explanations
- Score tracking
- Memory matching game
- Move counter and win detection

## 🎯 Target Audience

- **Scientists**: Research exploration and knowledge gap identification
- **Managers**: Investment decision insights and impact analysis
- **Mission Architects**: Safe mission planning with scientific backing
- **Researchers**: Comprehensive publication database
- **Enthusiasts**: Educational games and interactive learning
- **General Public**: Accessible space science information

## 🚀 NASA API Integration

The application integrates with NASA's Open APIs:

- **APOD (Astronomy Picture of the Day)**: Daily space imagery
- **Life Sciences Data Archive**: Bioscience publications (mock data for demo)

To use your own NASA API key:
1. Get a free API key from [NASA APIs](https://api.nasa.gov/)
2. Replace `DEMO_KEY` in API routes with your key

## 🎨 Design System

### Color Palette
- **Space Blue**: Primary actions and highlights
- **Space Purple**: Secondary elements
- **Space Cyan**: Accent colors
- **Nebula**: Success and positive metrics
- **Deep Space**: Dark backgrounds

### Typography
- **Headings**: Orbitron (space-themed)
- **Body**: Space Grotesk (readable)

## 📊 Data & Statistics

- **608 Publications**: NASA bioscience research papers
- **40+ Years**: Historical research data
- **100+ Space Missions**: Mission-linked studies
- **AI-Powered**: Intelligent search and insights

## 🔮 Future Enhancements

- [ ] Real NASA Life Sciences Data Archive integration
- [ ] Advanced knowledge graph visualization
- [ ] User authentication and saved searches
- [ ] PDF export functionality
- [ ] More interactive games and challenges
- [ ] Collaborative research notes
- [ ] Social sharing features

## 📝 License

This project is created for educational and research purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## 📧 Contact

For questions or feedback, please open an issue on the repository.

---

Built with ❤️ for space science enthusiasts and researchers worldwide. 🌌