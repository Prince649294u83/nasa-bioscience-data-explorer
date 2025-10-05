import { NextResponse } from 'next/server';
import { publications, categoryColors } from '@/data/publications';

// Generate comprehensive graph data from real NASA publications
const generateGraphData = () => {
  // Create nodes from publications
  const nodes = publications.map((pub, index) => {
    const categoryColor = categoryColors[pub.category as keyof typeof categoryColors] || '#6b5ce7';
    
    // Extract short label (first 3-5 words)
    const words = pub.title.split(' ');
    const label = words.slice(0, Math.min(4, words.length)).join(' ');
    
    return {
      id: index + 1,
      label: label,
      fullTitle: pub.title,
      link: pub.link,
      color: categoryColor,
      size: 6 + Math.random() * 6, // Random size between 6-12
      category: pub.category,
      keywords: pub.keywords,
    };
  });

  // Generate edges based on shared keywords and categories
  const edges: Array<{ from: number; to: number }> = [];
  const maxConnections = 25; // Increased limit
  const connectionCounts = new Map<number, number>();
  
  // Helper to check keyword similarity (substring matching)
  const keywordsSimilar = (k1: string, k2: string): boolean => {
    const key1 = k1.toLowerCase();
    const key2 = k2.toLowerCase();
    return key1 === key2 || key1.includes(key2) || key2.includes(key1);
  };
  
  for (let i = 0; i < nodes.length; i++) {
    const node1 = nodes[i];
    const connectionsForNode = connectionCounts.get(node1.id) || 0;
    
    if (connectionsForNode >= maxConnections) continue;
    
    for (let j = i + 1; j < nodes.length; j++) {
      const node2 = nodes[j];
      const connectionsForNode2 = connectionCounts.get(node2.id) || 0;
      
      if (connectionsForNode2 >= maxConnections) continue;
      
      // Check for shared keywords with fuzzy matching
      const sharedKeywords = node1.keywords.filter(k1 => 
        node2.keywords.some(k2 => keywordsSimilar(k1, k2))
      );
      
      const sameCategory = node1.category === node2.category;
      
      // More permissive connection criteria:
      // 1. Share 2+ keywords (any category)
      // 2. Share 1+ keyword and same category
      // 3. Same category with 40% probability
      // 4. Different category but share "spaceflight", "space", "microgravity" keywords
      const hasSpaceKeyword = (keywords: string[]) => 
        keywords.some(k => ['spaceflight', 'space', 'microgravity', 'missions'].includes(k.toLowerCase()));
      
      const shouldConnect = 
        sharedKeywords.length >= 2 ||
        (sharedKeywords.length >= 1 && sameCategory) ||
        (sameCategory && Math.random() > 0.6) ||
        (hasSpaceKeyword(node1.keywords) && hasSpaceKeyword(node2.keywords) && Math.random() > 0.7);
      
      if (shouldConnect) {
        edges.push({ from: node1.id, to: node2.id });
        connectionCounts.set(node1.id, (connectionCounts.get(node1.id) || 0) + 1);
        connectionCounts.set(node2.id, (connectionCounts.get(node2.id) || 0) + 1);
        
        if ((connectionCounts.get(node1.id) || 0) >= maxConnections) break;
      }
    }
  }
  
  // Ensure every node has at least 2 connections
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const connections = connectionCounts.get(node.id) || 0;
    
    if (connections < 2) {
      // Connect to nearest nodes by category or random
      for (let j = 0; j < nodes.length && connections < 2; j++) {
        if (i === j) continue;
        
        const otherNode = nodes[j];
        const edgeExists = edges.some(e => 
          (e.from === node.id && e.to === otherNode.id) ||
          (e.from === otherNode.id && e.to === node.id)
        );
        
        if (!edgeExists && (connectionCounts.get(otherNode.id) || 0) < maxConnections) {
          edges.push({ from: node.id, to: otherNode.id });
          connectionCounts.set(node.id, (connectionCounts.get(node.id) || 0) + 1);
          connectionCounts.set(otherNode.id, (connectionCounts.get(otherNode.id) || 0) + 1);
        }
      }
    }
  }

  return {
    nodes,
    edges,
    totalPublications: publications.length,
  };
};

export async function GET() {
  try {
    const graphData = generateGraphData();
    
    return NextResponse.json(graphData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating knowledge graph data:', error);
    return NextResponse.json(
      { error: 'Failed to load knowledge graph data' },
      { status: 500 }
    );
  }
}