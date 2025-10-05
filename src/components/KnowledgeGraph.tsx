'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import styles from '@/app/page.module.css';

interface Node {
  id: number;
  label: string;
  fullTitle: string;
  link: string;
  color: string;
  size: number;
  category: string;
  keywords: string[];
}

interface Edge {
  from: number;
  to: number;
}

interface GraphData {
  nodes: Node[];
  edges: Edge[];
  totalPublications: number;
}

interface TooltipPosition {
  x: number;
  y: number;
}

export default function KnowledgeGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const nodeObjectsRef = useRef<THREE.Mesh[]>([]);
  const edgeLinesRef = useRef<THREE.Line[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [connectionInfo, setConnectionInfo] = useState<{count: number; nodes: Node[]}>({ count: 0, nodes: [] });

  // Load graph data
  useEffect(() => {
    loadGraphData();
  }, []);

  // Initialize graph when data or filter changes
  useEffect(() => {
    if (!containerRef.current || !graphData) return;

    initializeGraph();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [graphData, filterCategory]);

  const loadGraphData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/knowledge-graph');
      const data = await response.json();
      setGraphData(data);
    } catch (error) {
      console.error('Error loading graph data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get connected nodes for a given node ID
  const getConnectedNodes = useCallback((nodeId: number): Node[] => {
    if (!graphData) return [];
    
    const connectedIds = new Set<number>();
    graphData.edges.forEach(edge => {
      if (edge.from === nodeId) connectedIds.add(edge.to);
      if (edge.to === nodeId) connectedIds.add(edge.from);
    });
    
    return graphData.nodes.filter(node => connectedIds.has(node.id));
  }, [graphData]);

  // Get connection count for a node
  const getConnectionCount = useCallback((nodeId: number): number => {
    if (!graphData) return 0;
    return graphData.edges.filter(e => e.from === nodeId || e.to === nodeId).length;
  }, [graphData]);

  const initializeGraph = () => {
    if (!containerRef.current || !graphData) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 600;

    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);
    sceneRef.current = scene;

    // Setup camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
    camera.position.z = 200;
    cameraRef.current = camera;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 800);
    pointLight.position.set(100, 100, 100);
    scene.add(pointLight);

    const backLight = new THREE.PointLight(0x6b5ce7, 0.5, 800);
    backLight.position.set(-100, -100, -100);
    scene.add(backLight);

    // Create particle system
    createParticles(scene);

    // Filter nodes
    const filteredNodes = filterCategory === 'all' 
      ? graphData.nodes 
      : graphData.nodes.filter(n => n.category.toLowerCase().includes(filterCategory.toLowerCase()));

    // Create nodes
    const nodeObjects: THREE.Mesh[] = [];
    const radius = Math.min(100 + filteredNodes.length * 0.5, 250);
    
    filteredNodes.forEach((node, index) => {
      const color = new THREE.Color(node.color);
      const size = node.size / 4;

      // Create node sphere
      const geometry = new THREE.SphereGeometry(size, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.4,
        shininess: 100,
        transparent: true,
        opacity: 0.9
      });
      const sphere = new THREE.Mesh(geometry, material);

      // Spherical distribution
      const phi = Math.acos(-1 + (2 * index) / filteredNodes.length);
      const theta = Math.sqrt(filteredNodes.length * Math.PI) * phi;
      
      sphere.position.set(
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi)
      );

      // Add glow effect
      const glowGeometry = new THREE.SphereGeometry(size * 1.4, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.15,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      sphere.add(glow);

      sphere.userData = node;
      scene.add(sphere);
      nodeObjects.push(sphere);
    });

    nodeObjectsRef.current = nodeObjects;

    // Create edges with curves
    const edgeLines: THREE.Line[] = [];
    graphData.edges.forEach((edge) => {
      const fromNodeFiltered = filteredNodes.findIndex(n => n.id === edge.from);
      const toNodeFiltered = filteredNodes.findIndex(n => n.id === edge.to);
      
      if (fromNodeFiltered === -1 || toNodeFiltered === -1) return;
      
      const fromNode = nodeObjects[fromNodeFiltered];
      const toNode = nodeObjects[toNodeFiltered];

      if (fromNode && toNode) {
        const start = fromNode.position.clone();
        const end = toNode.position.clone();
        const mid = new THREE.Vector3()
          .addVectors(start, end)
          .multiplyScalar(0.5)
          .add(new THREE.Vector3(0, 0, 0).randomDirection().multiplyScalar(10));
        
        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const points = curve.getPoints(20);
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: 0x2a3f5f,
          opacity: 0.3,
          transparent: true,
          linewidth: 1,
        });
        const line = new THREE.Line(geometry, material);
        line.userData = { from: edge.from, to: edge.to };
        scene.add(line);
        edgeLines.push(line);
      }
    });
    edgeLinesRef.current = edgeLines;

    // Mouse interaction state
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    // Mouse down
    renderer.domElement.addEventListener('mousedown', () => {
      isDragging = true;
      renderer.domElement.style.cursor = 'grabbing';
    });

    // Mouse move
    renderer.domElement.addEventListener('mousemove', (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / height) * 2 + 1;

      setTooltipPosition({ x: e.clientX, y: e.clientY });

      if (isDragging) {
        const deltaX = e.offsetX - previousMousePosition.x;
        const deltaY = e.offsetY - previousMousePosition.y;

        scene.rotation.y += deltaX * 0.005;
        scene.rotation.x += deltaY * 0.005;
      }

      previousMousePosition = { x: e.offsetX, y: e.offsetY };

      // Hover detection
      if (!isDragging) {
        raycasterRef.current.setFromCamera(mouseRef.current, camera);
        const intersects = raycasterRef.current.intersectObjects(nodeObjects);
        
        if (intersects.length > 0) {
          const hoveredNodeData = intersects[0].object.userData as Node;
          setHoveredNode(hoveredNodeData);
          
          const connectedNodes = getConnectedNodes(hoveredNodeData.id);
          const count = getConnectionCount(hoveredNodeData.id);
          setConnectionInfo({ count, nodes: connectedNodes });
          
          highlightHoverConnections(hoveredNodeData.id, connectedNodes.map(n => n.id));
          renderer.domElement.style.cursor = 'pointer';
        } else {
          setHoveredNode(null);
          setConnectionInfo({ count: 0, nodes: [] });
          resetHoverHighlights();
          renderer.domElement.style.cursor = 'grab';
        }
      }
    });

    // Mouse up
    renderer.domElement.addEventListener('mouseup', () => {
      isDragging = false;
      renderer.domElement.style.cursor = 'grab';
    });

    // Click to select
    renderer.domElement.addEventListener('click', () => {
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(nodeObjects);
      
      if (intersects.length > 0) {
        const clickedNode = intersects[0].object.userData as Node;
        setSelectedNode(clickedNode);
        
        const connectedNodes = getConnectedNodes(clickedNode.id);
        const count = getConnectionCount(clickedNode.id);
        setConnectionInfo({ count, nodes: connectedNodes });
        
        highlightConnections(clickedNode.id, connectedNodes.map(n => n.id));
        focusOnNode(intersects[0].object);
      } else {
        setSelectedNode(null);
        setConnectionInfo({ count: 0, nodes: [] });
        resetHighlights();
      }
    });

    // Mouse wheel zoom
    renderer.domElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomSpeed = 0.05;
      const delta = e.deltaY > 0 ? 1 : -1;
      const targetZ = camera.position.z + delta * zoomSpeed * 20;
      camera.position.z = Math.max(80, Math.min(400, targetZ));
    }, { passive: false });

    // Animation loop
    let time = 0;
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      time += 0.01;

      if (autoRotate && !isDragging) {
        scene.rotation.y += 0.001;
      }

      if (selectedNode) {
        const selected = nodeObjects.find(n => n.userData.id === selectedNode.id);
        if (selected) {
          const scale = 1 + Math.sin(time * 2) * 0.15;
          selected.scale.set(scale, scale, scale);
        }
      }

      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.0003;
        particlesRef.current.rotation.x += 0.0001;
      }

      nodeObjects.forEach((node, i) => {
        if (node.userData.id !== selectedNode?.id) {
          const basePulse = Math.sin(time + i * 0.3) * 0.03;
          node.scale.set(1 + basePulse, 1 + basePulse, 1 + basePulse);
        }
      });

      renderer.render(scene, camera);
    };

    animate();
  };

  const createParticles = (scene: THREE.Scene) => {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 600;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.7,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    particlesRef.current = particles;
    scene.add(particles);
  };

  const highlightHoverConnections = (nodeId: number, connectedIds: number[]) => {
    const connectedSet = new Set(connectedIds);

    edgeLinesRef.current.forEach(line => {
      if (line.userData.from === nodeId || line.userData.to === nodeId) {
        (line.material as THREE.LineBasicMaterial).opacity = 0.8;
        (line.material as THREE.LineBasicMaterial).color.set(0x00ff88);
      } else {
        (line.material as THREE.LineBasicMaterial).opacity = 0.08;
      }
    });

    nodeObjectsRef.current.forEach(node => {
      const mat = node.material as THREE.MeshPhongMaterial;
      if (node.userData.id === nodeId) {
        mat.opacity = 1;
        mat.emissiveIntensity = 0.8;
      } else if (connectedSet.has(node.userData.id)) {
        mat.opacity = 0.9;
        mat.emissiveIntensity = 0.6;
      } else {
        mat.opacity = 0.15;
        mat.emissiveIntensity = 0.2;
      }
    });
  };

  const resetHoverHighlights = () => {
    edgeLinesRef.current.forEach(line => {
      (line.material as THREE.LineBasicMaterial).opacity = 0.3;
      (line.material as THREE.LineBasicMaterial).color.set(0x2a3f5f);
    });

    nodeObjectsRef.current.forEach(node => {
      const mat = node.material as THREE.MeshPhongMaterial;
      mat.opacity = 0.9;
      mat.emissiveIntensity = 0.4;
    });
  };

  const highlightConnections = (nodeId: number, connectedIds: number[]) => {
    const connectedSet = new Set(connectedIds);

    edgeLinesRef.current.forEach(line => {
      if (line.userData.from === nodeId || line.userData.to === nodeId) {
        (line.material as THREE.LineBasicMaterial).opacity = 0.7;
        (line.material as THREE.LineBasicMaterial).color.set(0x00d4ff);
      } else {
        (line.material as THREE.LineBasicMaterial).opacity = 0.05;
      }
    });

    nodeObjectsRef.current.forEach(node => {
      const isConnected = connectedSet.has(node.userData.id) || node.userData.id === nodeId;
      (node.material as THREE.MeshPhongMaterial).opacity = isConnected ? 0.9 : 0.2;
    });
  };

  const resetHighlights = () => {
    edgeLinesRef.current.forEach(line => {
      (line.material as THREE.LineBasicMaterial).opacity = 0.3;
      (line.material as THREE.LineBasicMaterial).color.set(0x2a3f5f);
    });

    nodeObjectsRef.current.forEach(node => {
      (node.material as THREE.MeshPhongMaterial).opacity = 0.9;
      node.scale.set(1, 1, 1);
    });
  };

  const focusOnNode = (node: THREE.Object3D) => {
    if (!cameraRef.current) return;
    
    const targetPosition = node.position.clone();
    const camera = cameraRef.current;
    const startPosition = camera.position.clone();
    const direction = targetPosition.clone().sub(startPosition).normalize();
    const endPosition = targetPosition.clone().sub(direction.multiplyScalar(100));
    
    let progress = 0;
    const duration = 800;
    const startTime = Date.now();
    
    const animateCamera = () => {
      const elapsed = Date.now() - startTime;
      progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      
      camera.position.lerpVectors(startPosition, endPosition, eased);
      camera.lookAt(targetPosition);
      
      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      }
    };
    
    animateCamera();
  };

  const resetView = () => {
    if (cameraRef.current && sceneRef.current) {
      cameraRef.current.position.set(0, 0, 200);
      sceneRef.current.rotation.set(0, 0, 0);
    }
    setSelectedNode(null);
    setConnectionInfo({ count: 0, nodes: [] });
    resetHighlights();
  };

  const toggleAutoRotate = () => setAutoRotate(!autoRotate);
  const zoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(80, cameraRef.current.position.z - 30);
    }
  };
  const zoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.min(400, cameraRef.current.position.z + 30);
    }
  };

  const categories = ['all', 'Musculoskeletal', 'Plant Biology', 'Immunology', 'Genetics', 'Cellular', 'Microgravity'];

  return (
    <div style={{ position: 'relative' }}>
      {isLoading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '100px 20px', 
          color: '#00d4ff',
          fontSize: '18px',
          fontWeight: 600
        }}>
          Loading {graphData?.totalPublications || 600}+ publications...
        </div>
      )}

      {!isLoading && graphData && (
        <>
          <div className={styles.graphControls}>
            <button className={styles.controlBtn} onClick={resetView} title="Reset view">
              Reset View
            </button>
            <button className={styles.controlBtn} onClick={toggleAutoRotate} title="Toggle rotation">
              {autoRotate ? 'Pause Rotation' : 'Resume Rotation'}
            </button>
            <button className={styles.controlBtn} onClick={zoomIn} title="Zoom in">
              Zoom In +
            </button>
            <button className={styles.controlBtn} onClick={zoomOut} title="Zoom out">
              Zoom Out -
            </button>
            
            <select 
              className={styles.controlBtn}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ marginLeft: '10px', minWidth: '160px' }}
              title="Filter by category"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? `All Categories (${graphData.totalPublications})` : cat}
                </option>
              ))}
            </select>
          </div>

          <div ref={containerRef} className={styles.graphContainer} style={{ cursor: 'grab' }}></div>

          {/* Enhanced hover tooltip */}
          {hoveredNode && !selectedNode && (
            <div 
              style={{
                position: 'fixed',
                left: tooltipPosition.x + 15,
                top: tooltipPosition.y + 15,
                maxWidth: '380px',
                background: 'linear-gradient(135deg, rgba(10, 14, 39, 0.98) 0%, rgba(20, 24, 49, 0.98) 100%)',
                color: '#00d4ff',
                padding: '16px 18px',
                borderRadius: '12px',
                border: '2px solid #00d4ff',
                pointerEvents: 'none',
                zIndex: 1000,
                fontSize: '13px',
                fontWeight: 500,
                boxShadow: '0 8px 32px rgba(0, 212, 255, 0.6), 0 0 0 1px rgba(107, 92, 231, 0.3)',
                lineHeight: '1.5'
              }}
            >
              <div style={{ 
                color: '#a0aec0', 
                fontSize: '11px', 
                marginBottom: '8px', 
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {hoveredNode.category}
              </div>
              
              <div style={{ marginBottom: '12px', fontWeight: 600, color: '#fff' }}>
                {hoveredNode.fullTitle}
              </div>
              
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#95e1d3', 
                fontSize: '12px', 
                marginBottom: '10px',
                padding: '8px 10px',
                background: 'rgba(0, 212, 255, 0.1)',
                borderRadius: '6px',
                borderLeft: '3px solid #00ff88'
              }}>
                <span style={{ fontSize: '16px' }}>🔗</span>
                <strong>{connectionInfo.count}</strong> connected publication{connectionInfo.count !== 1 ? 's' : ''}
              </div>
              
              <div style={{ fontSize: '11px', color: '#cbd5e0', marginBottom: '12px', lineHeight: '1.6' }}>
                <strong style={{ color: '#00d4ff' }}>Research Topics:</strong>
                <div style={{ marginTop: '4px', color: '#a0aec0' }}>
                  {(hoveredNode.keywords || []).slice(0, 3).join(' • ')}
                </div>
              </div>
              
              <div style={{
                marginTop: '12px',
                padding: '10px 12px',
                background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(107, 92, 231, 0.2) 100%)',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#00d4ff',
                fontWeight: 700,
                textAlign: 'center',
                border: '1px solid rgba(0, 212, 255, 0.3)'
              }}>
                Click to view full details & publication link
              </div>
            </div>
          )}

          {/* Enhanced selected node panel */}
          {selectedNode && (
            <div className={styles.infoPanel} style={{
              background: 'linear-gradient(135deg, rgba(10, 14, 39, 0.98) 0%, rgba(20, 24, 49, 0.98) 100%)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <h3 style={{ 
                  margin: 0, 
                  color: '#00d4ff', 
                  fontSize: '17px', 
                  lineHeight: '1.4', 
                  flex: 1,
                  fontWeight: 700
                }}>
                  {selectedNode.fullTitle}
                </h3>
                <button 
                  onClick={() => { 
                    setSelectedNode(null); 
                    setConnectionInfo({ count: 0, nodes: [] });
                    resetHighlights(); 
                  }}
                  style={{
                    background: 'rgba(255, 107, 107, 0.1)',
                    border: '1px solid #ff6b6b',
                    color: '#ff6b6b',
                    fontSize: '18px',
                    cursor: 'pointer',
                    marginLeft: '12px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 107, 107, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)';
                  }}
                  title="Close"
                >
                  ×
                </button>
              </div>
              
              <div style={{ fontSize: '13px', color: '#cbd5e0', lineHeight: '1.7' }}>
                <div style={{ 
                  display: 'inline-block',
                  padding: '4px 10px',
                  background: 'rgba(107, 92, 231, 0.2)',
                  borderRadius: '6px',
                  marginBottom: '12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#a0aec0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {selectedNode.category}
                </div>
                
                <div style={{ 
                  margin: '12px 0', 
                  padding: '12px 14px', 
                  background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(107, 92, 231, 0.15) 100%)', 
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 212, 255, 0.3)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>🔗</span>
                    <div>
                      <div style={{ color: '#00d4ff', fontWeight: 700, fontSize: '14px' }}>
                        {connectionInfo.count} Connected Publication{connectionInfo.count !== 1 ? 's' : ''}
                      </div>
                      <div style={{ fontSize: '11px', color: '#a0aec0', marginTop: '2px' }}>
                        Related research in this network
                      </div>
                    </div>
                  </div>
                </div>
                
                {connectionInfo.nodes.length > 0 && (
                  <div style={{ margin: '14px 0', fontSize: '12px' }}>
                    <div style={{ 
                      color: '#00d4ff', 
                      fontWeight: 700, 
                      marginBottom: '8px',
                      fontSize: '13px'
                    }}>
                      Related Research:
                    </div>
                    <div style={{ 
                      maxHeight: '120px', 
                      overflowY: 'auto',
                      padding: '10px',
                      background: 'rgba(107, 92, 231, 0.08)',
                      borderRadius: '6px',
                      border: '1px solid rgba(107, 92, 231, 0.2)'
                    }}>
                      {connectionInfo.nodes.slice(0, 6).map((node, idx) => (
                        <div key={idx} style={{ 
                          padding: '6px 0', 
                          color: '#95e1d3',
                          fontSize: '11px',
                          lineHeight: '1.5',
                          borderBottom: idx < Math.min(connectionInfo.nodes.length, 6) - 1 ? '1px solid rgba(107, 92, 231, 0.15)' : 'none'
                        }}>
                          <span style={{ color: '#00d4ff', marginRight: '6px' }}>▸</span>
                          {node.label}
                        </div>
                      ))}
                      {connectionInfo.nodes.length > 6 && (
                        <div style={{ 
                          padding: '6px 0',
                          color: '#6b5ce7',
                          fontSize: '11px',
                          fontStyle: 'italic',
                          textAlign: 'center'
                        }}>
                          +{connectionInfo.nodes.length - 6} more connections
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div style={{ margin: '12px 0', padding: '10px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '6px' }}>
                  <div style={{ color: '#00d4ff', fontWeight: 600, marginBottom: '6px', fontSize: '12px' }}>
                    Research Topics:
                  </div>
                  <div style={{ color: '#cbd5e0', fontSize: '11px', lineHeight: '1.6' }}>
                    {(selectedNode.keywords || []).slice(0, 5).join(' • ')}
                  </div>
                </div>
                
                <div style={{ marginTop: '18px' }}>
                  <a 
                    href={selectedNode.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 20px',
                      background: 'linear-gradient(135deg, #00d4ff 0%, #6b5ce7 100%)',
                      color: '#fff',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: 700,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 4px 15px rgba(0, 212, 255, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 212, 255, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1) translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 212, 255, 0.4)';
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>📄</span>
                    <span>View Full Publication</span>
                    <span style={{ fontSize: '14px' }}>→</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className={styles.graphLegend} style={{
            background: 'linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(20, 24, 49, 0.95) 100%)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ 
              marginBottom: '14px', 
              color: '#00d4ff', 
              fontSize: '14px', 
              fontWeight: 700,
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}>
              {graphData.totalPublications} Publications
            </div>
            
            <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: '#cbd5e0' }}>
              Categories:
            </div>
            
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{ background: '#ff6b6b', boxShadow: '0 0 8px rgba(255, 107, 107, 0.6)' }}></span>
              <span>Musculoskeletal</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{ background: '#95e1d3', boxShadow: '0 0 8px rgba(149, 225, 211, 0.6)' }}></span>
              <span>Plant Biology</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{ background: '#ffd93d', boxShadow: '0 0 8px rgba(255, 217, 61, 0.6)' }}></span>
              <span>Immunology</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{ background: '#6b5ce7', boxShadow: '0 0 8px rgba(107, 92, 231, 0.6)' }}></span>
              <span>Genetics</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{ background: '#00d4ff', boxShadow: '0 0 8px rgba(0, 212, 255, 0.6)' }}></span>
              <span>Microgravity</span>
            </div>
            
            <div style={{ 
              marginTop: '18px', 
              paddingTop: '16px',
              borderTop: '1px solid rgba(0, 212, 255, 0.2)',
              fontSize: '11px', 
              color: '#a0aec0', 
              lineHeight: '1.7'
            }}>
              <div style={{ marginBottom: '8px', color: '#00d4ff', fontWeight: 600 }}>
                Interaction Guide:
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong style={{ color: '#95e1d3' }}>Hover:</strong> Preview connections
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong style={{ color: '#95e1d3' }}>Click:</strong> View full details
              </div>
              <div>
                <strong style={{ color: '#95e1d3' }}>Drag:</strong> Rotate the graph
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}