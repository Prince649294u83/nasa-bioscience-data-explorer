"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, ExternalLink, Calendar } from "lucide-react";
import StarField from "@/components/StarField";
import Navigation from "@/components/Navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface Publication {
  id: string;
  title: string;
  link: string;
  year?: number;
  category?: string;
  keywords?: string[];
}

export default function ResearchPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchPublications();
  }, [selectedCategory, selectedYear, searchQuery]);

  const fetchPublications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (selectedYear !== "all") params.append("year", selectedYear);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/nasa/research?${params.toString()}`);
      const data = await response.json();
      
      setPublications(data.publications);
      setFilteredPublications(data.publications);
      setTotalCount(data.total);
    } catch (error) {
      console.error("Error fetching publications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    const isInIframe = window.self !== window.top;
    if (isInIframe) {
      window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url } }, "*");
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const categories = Array.from(
    new Set(publications.map((p) => p.category).filter(Boolean))
  ).sort();
  
  const years = Array.from(
    new Set(publications.map((p) => p.year).filter(Boolean))
  ).sort((a, b) => (b as number) - (a as number));

  return (
    <>
      <StarField />
      <Navigation />

      <div className="relative z-10 min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="max-w-6xl mx-auto mb-8">
            <h1
              className="text-5xl font-black mb-4 gradient-text"
              style={{ fontFamily: "var(--font-space)" }}
            >
              Research Explorer
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore {totalCount} NASA bioscience publications with AI-powered search and filtering
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-6xl mx-auto mb-8">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search publications, keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/50"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-48 bg-background/50">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat as string}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-full md:w-32 bg-background/50">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {years.map((year) => (
                      <SelectItem key={year} value={year?.toString() || ""}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredPublications.length} of {totalCount} publications
                </p>
                {(searchQuery || selectedCategory !== "all" || selectedYear !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setSelectedYear("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Publications List */}
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="p-6 bg-card/50 backdrop-blur-sm">
                      <Skeleton className="h-6 w-3/4 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-5/6" />
                    </Card>
                  ))
                ) : filteredPublications.length === 0 ? (
                  <Card className="p-12 bg-card/50 backdrop-blur-sm text-center">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">No publications found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Try adjusting your search or filters
                    </p>
                  </Card>
                ) : (
                  filteredPublications.map((pub) => (
                    <Card
                      key={pub.id}
                      className="p-6 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 pr-4">
                          <h3 className="text-xl font-bold mb-1">
                            <a
                              href={pub.link}
                              onClick={(e) => handleLinkClick(e, pub.link)}
                              className="hover:text-primary transition-colors hover:underline cursor-pointer"
                            >
                              {pub.title}
                            </a>
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-3">
                            {pub.year && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {pub.year}
                              </div>
                            )}
                            <a
                              href={pub.link}
                              onClick={(e) => handleLinkClick(e, pub.link)}
                              className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Paper
                            </a>
                          </div>
                        </div>
                        {pub.category && (
                          <Badge className="bg-primary/20 text-primary border-primary/30 flex-shrink-0">
                            {pub.category}
                          </Badge>
                        )}
                      </div>

                      {pub.keywords && pub.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {pub.keywords.map((keyword) => (
                            <Badge key={keyword} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="grid" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="p-6 bg-card/50 backdrop-blur-sm">
                      <Skeleton className="h-6 w-3/4 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-5/6" />
                    </Card>
                  ))
                ) : filteredPublications.length === 0 ? (
                  <div className="col-span-full">
                    <Card className="p-12 bg-card/50 backdrop-blur-sm text-center">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg text-muted-foreground">No publications found</p>
                    </Card>
                  </div>
                ) : (
                  filteredPublications.map((pub) => (
                    <Card
                      key={pub.id}
                      className="p-6 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all hover:scale-105"
                    >
                      {pub.category && (
                        <Badge className="bg-primary/20 text-primary border-primary/30 mb-3">
                          {pub.category}
                        </Badge>
                      )}
                      <h3 className="text-lg font-bold mb-2 line-clamp-2">
                        <a
                          href={pub.link}
                          onClick={(e) => handleLinkClick(e, pub.link)}
                          className="hover:text-primary transition-colors hover:underline cursor-pointer"
                        >
                          {pub.title}
                        </a>
                      </h3>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                        {pub.year && <span>{pub.year}</span>}
                        <a
                          href={pub.link}
                          onClick={(e) => handleLinkClick(e, pub.link)}
                          className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View
                        </a>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}