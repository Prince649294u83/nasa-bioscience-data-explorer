"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, PieChart, TrendingUp, Network } from "lucide-react";
import StarField from "@/components/StarField";
import Navigation from "@/components/Navigation";
import RocketLaunchChart from "@/components/visualizations/RocketLaunchChart";
import OrbitalRingSystem from "@/components/visualizations/OrbitalRingSystem";
import DeepSpaceScanner from "@/components/visualizations/DeepSpaceScanner";
import DataStreamBackground from "@/components/visualizations/DataStreamBackground";
import KnowledgeGraph from "@/components/KnowledgeGraph";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Mock data for visualizations
const publicationsByYear = [
  { year: "2018", count: 65 },
  { year: "2019", count: 72 },
  { year: "2020", count: 84 },
  { year: "2021", count: 95 },
  { year: "2022", count: 118 },
  { year: "2023", count: 174 },
];

const publicationsByCategory = [
  { name: "Human Physiology", value: 185, color: "var(--color-chart-1)" },
  { name: "Space Biology", value: 142, color: "var(--color-chart-2)" },
  { name: "Radiation Biology", value: 98, color: "var(--color-chart-3)" },
  { name: "Microbiology", value: 87, color: "var(--color-chart-4)" },
  { name: "Biotechnology", value: 96, color: "var(--color-chart-5)" },
];

const researchImpact = [
  { category: "Bone Health", impact: 85 },
  { category: "Cardiovascular", impact: 78 },
  { category: "Radiation Protection", impact: 92 },
  { category: "Plant Growth", impact: 75 },
  { category: "Sleep/Circadian", impact: 68 },
  { category: "Immune System", impact: 82 },
];

const citationTrends = [
  { year: "2018", citations: 1250 },
  { year: "2019", citations: 1580 },
  { year: "2020", citations: 1890 },
  { year: "2021", citations: 2340 },
  { year: "2022", citations: 3120 },
  { year: "2023", citations: 4250 },
];

const knowledgeGaps = [
  { area: "Long-term Mars Effects", priority: "High", publications: 12 },
  { area: "Genetic Adaptations", priority: "High", publications: 18 },
  { area: "Psychological Impact", priority: "Medium", publications: 24 },
  { area: "Reproductive Biology", priority: "High", publications: 8 },
  { area: "Artificial Gravity", priority: "Medium", publications: 15 },
];

export default function VisualizationsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isTabSwitching, setIsTabSwitching] = useState(false);

  const handleTabChange = (value: string) => {
    setIsTabSwitching(true);
    setActiveTab(value);
    setTimeout(() => setIsTabSwitching(false), 300);
  };

  return (
    <>
      <StarField />
      <DataStreamBackground />
      <Navigation />

      <div className="relative z-10 min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="max-w-7xl mx-auto mb-8">
            <h1
              className="text-5xl font-black mb-4 gradient-text tracking-wider"
              style={{ fontFamily: "var(--font-space)" }}
            >
              ⚡ COMMAND CENTER
            </h1>
            <p className="text-lg text-muted-foreground font-mono">
              Real-time cosmic data analysis and mission intelligence
            </p>
          </div>

          {/* Tabs */}
          <div className="max-w-7xl mx-auto relative z-20">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="mb-6 w-full lg:w-auto relative z-30 bg-card/50 backdrop-blur-xl border border-primary/30 p-2 h-auto gap-2 rounded-xl shadow-[0_0_30px_rgba(112,182,246,0.15)]">
                <TabsTrigger 
                  value="overview"
                  className="
                    min-h-[48px] px-6 py-3 font-semibold tracking-wide
                    data-[state=active]:bg-primary/20 
                    data-[state=active]:text-primary
                    data-[state=active]:border-primary/50
                    data-[state=active]:shadow-[0_0_20px_rgba(112,182,246,0.4),inset_0_0_20px_rgba(112,182,246,0.1)]
                    data-[state=inactive]:text-muted-foreground
                    data-[state=inactive]:hover:text-foreground
                    data-[state=inactive]:hover:bg-primary/5
                    border border-transparent
                    transition-all duration-300
                    rounded-lg
                    tech-corner
                  "
                  style={{ fontFamily: "var(--font-space)" }}
                >
                  <BarChart3 className="h-5 w-5 mr-2" />
                  OVERVIEW
                </TabsTrigger>
                <TabsTrigger 
                  value="trends"
                  className="
                    min-h-[48px] px-6 py-3 font-semibold tracking-wide
                    data-[state=active]:bg-primary/20 
                    data-[state=active]:text-primary
                    data-[state=active]:border-primary/50
                    data-[state=active]:shadow-[0_0_20px_rgba(112,182,246,0.4),inset_0_0_20px_rgba(112,182,246,0.1)]
                    data-[state=inactive]:text-muted-foreground
                    data-[state=inactive]:hover:text-foreground
                    data-[state=inactive]:hover:bg-primary/5
                    border border-transparent
                    transition-all duration-300
                    rounded-lg
                    tech-corner
                  "
                  style={{ fontFamily: "var(--font-space)" }}
                >
                  <TrendingUp className="h-5 w-5 mr-2" />
                  TRENDS
                </TabsTrigger>
                <TabsTrigger 
                  value="impact"
                  className="
                    min-h-[48px] px-6 py-3 font-semibold tracking-wide
                    data-[state=active]:bg-primary/20 
                    data-[state=active]:text-primary
                    data-[state=active]:border-primary/50
                    data-[state=active]:shadow-[0_0_20px_rgba(112,182,246,0.4),inset_0_0_20px_rgba(112,182,246,0.1)]
                    data-[state=inactive]:text-muted-foreground
                    data-[state=inactive]:hover:text-foreground
                    data-[state=inactive]:hover:bg-primary/5
                    border border-transparent
                    transition-all duration-300
                    rounded-lg
                    tech-corner
                  "
                  style={{ fontFamily: "var(--font-space)" }}
                >
                  <PieChart className="h-5 w-5 mr-2" />
                  IMPACT
                </TabsTrigger>
                <TabsTrigger 
                  value="gaps"
                  className="
                    min-h-[48px] px-6 py-3 font-semibold tracking-wide
                    data-[state=active]:bg-primary/20 
                    data-[state=active]:text-primary
                    data-[state=active]:border-primary/50
                    data-[state=active]:shadow-[0_0_20px_rgba(112,182,246,0.4),inset_0_0_20px_rgba(112,182,246,0.1)]
                    data-[state=inactive]:text-muted-foreground
                    data-[state=inactive]:hover:text-foreground
                    data-[state=inactive]:hover:bg-primary/5
                    border border-transparent
                    transition-all duration-300
                    rounded-lg
                    tech-corner
                  "
                  style={{ fontFamily: "var(--font-space)" }}
                >
                  <Network className="h-5 w-5 mr-2" />
                  KNOWLEDGE GAPS
                </TabsTrigger>
                <TabsTrigger 
                  value="graph"
                  className="
                    min-h-[48px] px-6 py-3 font-semibold tracking-wide
                    data-[state=active]:bg-primary/20 
                    data-[state=active]:text-primary
                    data-[state=active]:border-primary/50
                    data-[state=active]:shadow-[0_0_20px_rgba(112,182,246,0.4),inset_0_0_20px_rgba(112,182,246,0.1)]
                    data-[state=inactive]:text-muted-foreground
                    data-[state=inactive]:hover:text-foreground
                    data-[state=inactive]:hover:bg-primary/5
                    border border-transparent
                    transition-all duration-300
                    rounded-lg
                    tech-corner
                  "
                  style={{ fontFamily: "var(--font-space)" }}
                >
                  <Network className="h-5 w-5 mr-2" />
                  3D KNOWLEDGE GRAPH
                </TabsTrigger>
              </TabsList>

              {/* Data Stream Loading Effect */}
              {isTabSwitching && (
                <div className="mb-4 overflow-hidden rounded-lg h-1 bg-muted/20">
                  <div className="h-full bg-gradient-to-r from-transparent via-primary to-transparent animate-[slideIn_0.3s_ease-out]" />
                </div>
              )}

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card 
                    className="p-6 bg-card/30 backdrop-blur-md border-primary/20 hover:border-primary/40 transition-all duration-500 tech-corner power-on"
                    style={{
                      boxShadow: '0 0 30px rgba(112, 182, 246, 0.1), inset 0 0 30px rgba(112, 182, 246, 0.05)',
                    }}
                  >
                    <h3 className="text-xl font-bold mb-4 tracking-wider flex items-center gap-2" style={{ fontFamily: "var(--font-space)" }}>
                      <span className="text-primary">🚀</span> LAUNCH TRAJECTORY
                    </h3>
                    <RocketLaunchChart data={publicationsByYear} />
                  </Card>

                  <Card 
                    className="p-6 bg-card/30 backdrop-blur-md border-accent/20 hover:border-accent/40 transition-all duration-500 tech-corner power-on"
                    style={{
                      boxShadow: '0 0 30px rgba(167, 139, 250, 0.1), inset 0 0 30px rgba(167, 139, 250, 0.05)',
                      animationDelay: '0.1s',
                    }}
                  >
                    <h3 className="text-xl font-bold mb-4 tracking-wider flex items-center gap-2" style={{ fontFamily: "var(--font-space)" }}>
                      <span className="text-accent">🛸</span> ORBITAL SECTORS
                    </h3>
                    <OrbitalRingSystem data={publicationsByCategory} />
                  </Card>
                </div>

                <Card 
                  className="p-6 bg-card/30 backdrop-blur-md border-primary/20 hover:border-primary/40 transition-all duration-500 tech-corner power-on"
                  style={{
                    boxShadow: '0 0 30px rgba(112, 182, 246, 0.1), inset 0 0 30px rgba(112, 182, 246, 0.05)',
                    animationDelay: '0.2s',
                  }}
                >
                  <h3 className="text-xl font-bold mb-4 tracking-wider flex items-center gap-2" style={{ fontFamily: "var(--font-space)" }}>
                    <span className="text-primary">📡</span> DEEP SPACE SCANNER
                  </h3>
                  <DeepSpaceScanner data={researchImpact} />
                </Card>
              </TabsContent>

              {/* Trends Tab */}
              <TabsContent value="trends" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card 
                  className="p-6 bg-card/30 backdrop-blur-md border-primary/20 hover:border-primary/40 transition-all duration-500 tech-corner power-on"
                  style={{
                    boxShadow: '0 0 30px rgba(112, 182, 246, 0.1), inset 0 0 30px rgba(112, 182, 246, 0.05)',
                  }}
                >
                  <h3 className="text-xl font-bold mb-4 tracking-wider flex items-center gap-2" style={{ fontFamily: "var(--font-space)" }}>
                    <span className="text-accent">📈</span> CITATION ENERGY FIELD
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={citationTrends}>
                      <defs>
                        <linearGradient id="colorCitations" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.2} />
                      <XAxis dataKey="year" stroke="var(--color-muted-foreground)" style={{ fontFamily: 'Space Grotesk' }} />
                      <YAxis stroke="var(--color-muted-foreground)" style={{ fontFamily: 'Space Grotesk' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-card)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "8px",
                          backdropFilter: "blur(8px)",
                        }}
                        cursor={{ stroke: 'var(--color-accent)', strokeWidth: 2 }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="citations"
                        stroke="var(--color-accent)"
                        strokeWidth={3}
                        fill="url(#colorCitations)"
                        animationBegin={0}
                        animationDuration={2000}
                        animationEasing="ease-out"
                        dot={{ 
                          fill: "var(--color-accent)", 
                          r: 6,
                          style: {
                            filter: 'drop-shadow(0 0 6px var(--color-accent))',
                            cursor: 'pointer',
                          }
                        }}
                        activeDot={{ 
                          r: 8,
                          style: {
                            filter: 'drop-shadow(0 0 10px var(--color-accent))',
                          }
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  <p className="text-sm text-muted-foreground mt-4 font-mono">
                    📈 Citations have increased by 240% since 2018, indicating growing research interest and impact.
                  </p>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6 bg-card/30 backdrop-blur-md border-accent/20 hover:scale-[1.02] transition-transform duration-300 tech-corner power-on">
                    <h3 className="text-lg font-bold mb-4 tracking-wider" style={{ fontFamily: "var(--font-space)" }}>
                      🌟 EMERGING SECTORS
                    </h3>
                    <div className="space-y-3">
                      {["Artificial Gravity", "Gene Editing in Space", "3D Bioprinting", "Cryopreservation"].map(
                        (area, idx) => (
                          <div key={area} className="flex items-center justify-between group cursor-pointer">
                            <span className="text-sm group-hover:text-accent transition-colors">{area}</span>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-accent transition-all duration-1000 ease-out"
                                  style={{ 
                                    width: `${100 - idx * 15}%`,
                                    animation: `slideIn 1s ease-out ${idx * 0.1}s backwards`
                                  }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">{100 - idx * 15}%</span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </Card>

                  <Card className="p-6 bg-card/30 backdrop-blur-md border-nebula/20 hover:scale-[1.02] transition-transform duration-300 tech-corner power-on" style={{ animationDelay: '0.1s' }}>
                    <h3 className="text-lg font-bold mb-4 tracking-wider" style={{ fontFamily: "var(--font-space)" }}>
                      🤝 ALLIANCE OPERATIONS
                    </h3>
                    <div className="space-y-3">
                      {[
                        { orgs: "NASA × ESA", projects: 45 },
                        { orgs: "NASA × JAXA", projects: 32 },
                        { orgs: "NASA × Roscosmos", projects: 28 },
                        { orgs: "NASA × Universities", projects: 156 },
                      ].map((collab, idx) => (
                        <div 
                          key={collab.orgs} 
                          className="flex items-center justify-between hover:translate-x-1 transition-transform duration-200 cursor-pointer"
                          style={{ 
                            animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s backwards`
                          }}
                        >
                          <span className="text-sm font-medium hover:text-nebula transition-colors">{collab.orgs}</span>
                          <span className="text-sm text-nebula">{collab.projects} projects</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Impact Tab */}
              <TabsContent value="impact" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid md:grid-cols-3 gap-6">
                  <Card 
                    className="p-6 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-md border-primary/30 hover:scale-105 transition-all duration-300 cursor-pointer tech-corner power-on"
                    style={{
                      boxShadow: '0 0 30px rgba(112, 182, 246, 0.2)',
                    }}
                  >
                    <h3 className="text-3xl font-black mb-2 animate-in zoom-in duration-700 glow-text" style={{ fontFamily: "var(--font-space)" }}>
                      12,847
                    </h3>
                    <p className="text-sm text-muted-foreground font-mono">Total Citations</p>
                    <p className="text-xs text-primary mt-2 font-mono">↑ 32% from last year</p>
                  </Card>

                  <Card 
                    className="p-6 bg-gradient-to-br from-accent/20 to-accent/5 backdrop-blur-md border-accent/30 hover:scale-105 transition-all duration-300 cursor-pointer tech-corner power-on"
                    style={{
                      boxShadow: '0 0 30px rgba(167, 139, 250, 0.2)',
                      animationDelay: '0.1s',
                    }}
                  >
                    <h3 className="text-3xl font-black mb-2 animate-in zoom-in duration-700 delay-100 glow-text" style={{ fontFamily: "var(--font-space)" }}>
                      143
                    </h3>
                    <p className="text-sm text-muted-foreground font-mono">High-Impact Studies</p>
                    <p className="text-xs text-accent mt-2 font-mono">50+ citations each</p>
                  </Card>

                  <Card 
                    className="p-6 bg-gradient-to-br from-nebula/20 to-nebula/5 backdrop-blur-md border-nebula/30 hover:scale-105 transition-all duration-300 cursor-pointer tech-corner power-on"
                    style={{
                      boxShadow: '0 0 30px rgba(236, 72, 153, 0.2)',
                      animationDelay: '0.2s',
                    }}
                  >
                    <h3 className="text-3xl font-black mb-2 animate-in zoom-in duration-700 delay-200 glow-text" style={{ fontFamily: "var(--font-space)" }}>
                      34
                    </h3>
                    <p className="text-sm text-muted-foreground font-mono">Patent Applications</p>
                    <p className="text-xs text-nebula mt-2 font-mono">From research findings</p>
                  </Card>
                </div>

                <Card className="p-6 bg-card/30 backdrop-blur-md border-primary/20">
                  <h3 className="text-xl font-bold mb-4 tracking-wider" style={{ fontFamily: "var(--font-space)" }}>
                    Mission Impact Analysis
                  </h3>
                  <div className="space-y-4">
                    {[
                      { mission: "Artemis Program", impact: 95, studies: 87 },
                      { mission: "ISS Research", impact: 92, studies: 234 },
                      { mission: "Mars 2030", impact: 88, studies: 56 },
                      { mission: "Gateway Station", impact: 78, studies: 34 },
                    ].map((mission, idx) => (
                      <div 
                        key={mission.mission} 
                        className="space-y-2 group cursor-pointer"
                        style={{ 
                          animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s backwards`
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium group-hover:text-primary transition-colors">{mission.mission}</span>
                          <span className="text-sm text-muted-foreground">{mission.studies} studies</span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out"
                            style={{ 
                              width: `${mission.impact}%`,
                              animation: `slideIn 1.5s ease-out ${idx * 0.2}s backwards`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              {/* Knowledge Gaps Tab */}
              <TabsContent value="gaps" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="p-6 bg-card/30 backdrop-blur-md border-primary/20">
                  <h3 className="text-xl font-bold mb-4 tracking-wider" style={{ fontFamily: "var(--font-space)" }}>
                    Identified Knowledge Gaps
                  </h3>
                  <p className="text-muted-foreground mb-6 font-mono">
                    Areas requiring additional research for safe and successful long-duration space missions
                  </p>

                  <div className="space-y-4">
                    {knowledgeGaps.map((gap, idx) => (
                      <Card
                        key={gap.area}
                        className={`p-4 bg-gradient-to-r ${
                          gap.priority === "High"
                            ? "from-destructive/10 to-destructive/5 border-destructive/30 hover:border-destructive/50"
                            : "from-accent/10 to-accent/5 border-accent/30 hover:border-accent/50"
                        } hover:scale-[1.02] transition-all duration-300 cursor-pointer`}
                        style={{ 
                          animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s backwards`
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold">{gap.area}</h4>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  gap.priority === "High"
                                    ? "bg-destructive/20 text-destructive"
                                    : "bg-accent/20 text-accent"
                                }`}
                              >
                                {gap.priority} Priority
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Only {gap.publications} publications addressing this critical area
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6 bg-card/30 backdrop-blur-md border-primary/20 hover:scale-[1.02] transition-transform duration-300 tech-corner power-on">
                    <h3 className="text-lg font-bold mb-4 tracking-wider" style={{ fontFamily: "var(--font-space)" }}>
                      📊 CONSENSUS ANALYSIS
                    </h3>
                    <div className="space-y-3">
                      {[
                        { area: "Exercise Countermeasures", consensus: 94 },
                        { area: "Radiation Shielding", consensus: 88 },
                        { area: "Nutrition Requirements", consensus: 82 },
                        { area: "Sleep Management", consensus: 76 },
                      ].map((item, idx) => (
                        <div 
                          key={item.area}
                          style={{ 
                            animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s backwards`
                          }}
                        >
                          <div className="flex justify-between mb-1">
                            <span className="text-sm hover:text-primary transition-colors cursor-pointer">{item.area}</span>
                            <span className="text-sm text-primary">{item.consensus}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-1000 ease-out" 
                              style={{ 
                                width: `${item.consensus}%`,
                                animation: `slideIn 1.5s ease-out ${idx * 0.2}s backwards`
                              }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6 bg-card/30 backdrop-blur-md border-accent/20 hover:scale-[1.02] transition-transform duration-300 tech-corner power-on">
                    <h3 className="text-lg font-bold mb-4 tracking-wider" style={{ fontFamily: "var(--font-space)" }}>
                      ⚠️ DISAGREEMENT ZONES
                    </h3>
                    <div className="space-y-3">
                      {[
                        { area: "Optimal Artificial Gravity", disagreement: 65 },
                        { area: "Psychological Screening", disagreement: 58 },
                        { area: "Medication Efficacy", disagreement: 52 },
                        { area: "Hibernation Protocols", disagreement: 71 },
                      ].map((item, idx) => (
                        <div 
                          key={item.area}
                          style={{ 
                            animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s backwards`
                          }}
                        >
                          <div className="flex justify-between mb-1">
                            <span className="text-sm hover:text-accent transition-colors cursor-pointer">{item.area}</span>
                            <span className="text-sm text-accent">{item.disagreement}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-accent transition-all duration-1000 ease-out" 
                              style={{ 
                                width: `${item.disagreement}%`,
                                animation: `slideIn 1.5s ease-out ${idx * 0.2}s backwards`
                              }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* 3D Knowledge Graph Tab */}
              <TabsContent value="graph" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="p-6 bg-card/30 backdrop-blur-md border-primary/20">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2 tracking-wider gradient-text" style={{ fontFamily: "var(--font-space)" }}>
                      🌐 INTERACTIVE 3D KNOWLEDGE GRAPH
                    </h3>
                    <p className="text-muted-foreground font-mono">
                      Explore connections between 608 NASA bioscience publications in an immersive 3D space
                    </p>
                  </div>
                  <KnowledgeGraph />
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}