// Types for vertices and edges
export interface Vertex {
  id: number
  x: number
  y: number
  color: number | null
}

export interface Edge {
  source: number
  target: number
}

// Function to color the graph using a greedy algorithm
export function colorGraph(vertices: Vertex[], edges: Edge[]) {
  // Create a copy of vertices to avoid mutating the original
  const verticesCopy = [...vertices]

  // Create an adjacency list for the graph
  const adjacencyList = createAdjacencyList(verticesCopy, edges)

  // Initialize colors array
  const colors: number[] = Array(verticesCopy.length).fill(-1)

  // Color each vertex
  for (let i = 0; i < verticesCopy.length; i++) {
    const vertex = verticesCopy[i]
    const neighbors = adjacencyList[vertex.id] || []

    // Find the smallest color not used by neighbors
    const usedColors = new Set<number>()
    for (const neighborId of neighbors) {
      const neighbor = verticesCopy.find((v) => v.id === neighborId)
      if (neighbor && neighbor.color !== null) {
        usedColors.add(neighbor.color)
      }
    }

    let color = 0
    while (usedColors.has(color)) {
      color++
    }

    // Assign the color to the vertex
    vertex.color = color
  }

  // Calculate the number of colors used
  const numColors = Math.max(...verticesCopy.map((v) => v.color || 0)) + 1

  return { coloredVertices: verticesCopy, numColors }
}

// Function to color the graph step by step
export function colorGraphStepByStep(vertices: Vertex[], edges: Edge[]) {
  // Create a copy of vertices to avoid mutating the original
  const verticesCopy = [...vertices.map((v) => ({ ...v, color: null }))]

  // Create an adjacency list for the graph
  const adjacencyList = createAdjacencyList(verticesCopy, edges)

  // Initialize the steps array with the initial state
  const steps: Vertex[][] = [verticesCopy.map((v) => ({ ...v }))]

  // Color each vertex one by one
  for (let i = 0; i < verticesCopy.length; i++) {
    const vertex = verticesCopy[i]
    const neighbors = adjacencyList[vertex.id] || []

    // Find the smallest color not used by neighbors
    const usedColors = new Set<number>()
    for (const neighborId of neighbors) {
      const neighbor = verticesCopy.find((v) => v.id === neighborId)
      if (neighbor && neighbor.color !== null) {
        usedColors.add(neighbor.color)
      }
    }

    let color = 0
    while (usedColors.has(color)) {
      color++
    }

    // Assign the color to the vertex
    vertex.color = color

    // Add the current state to the steps array
    steps.push(verticesCopy.map((v) => ({ ...v })))
  }

  return steps
}

// Helper function to create an adjacency list
function createAdjacencyList(vertices: Vertex[], edges: Edge[]) {
  const adjacencyList: Record<number, number[]> = {}

  // Initialize adjacency list for each vertex
  vertices.forEach((vertex) => {
    adjacencyList[vertex.id] = []
  })

  // Add edges to the adjacency list
  edges.forEach((edge) => {
    adjacencyList[edge.source].push(edge.target)
    adjacencyList[edge.target].push(edge.source)
  })

  return adjacencyList
}

// Function to get example graphs
export function getExampleGraph(example: string) {
  switch (example) {
    case "cycle": // Cycle C5
      return getCycleGraph()
    case "complete": // Complete K4
      return getCompleteGraph()
    case "bipartite": // Bipartite Graph
      return getBipartiteGraph()
    case "petersen": // Petersen Graph
      return getPetersenGraph()
    default:
      return { vertices: [], edges: [] }
  }
}

// Example: Cycle Graph (C5)
function getCycleGraph() {
  const radius = 150
  const centerX = 300
  const centerY = 300
  const vertices: Vertex[] = []
  const edges: Edge[] = []

  // Create 5 vertices in a circle
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI) / 5
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    vertices.push({ id: i, x, y, color: null })
  }

  // Create edges between consecutive vertices
  for (let i = 0; i < 5; i++) {
    edges.push({ source: i, target: (i + 1) % 5 })
  }

  return { vertices, edges }
}

// Example: Complete Graph (K4)
function getCompleteGraph() {
  const radius = 150
  const centerX = 300
  const centerY = 300
  const vertices: Vertex[] = []
  const edges: Edge[] = []

  // Create 4 vertices in a circle
  for (let i = 0; i < 4; i++) {
    const angle = (i * 2 * Math.PI) / 4
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    vertices.push({ id: i, x, y, color: null })
  }

  // Create edges between all pairs of vertices
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      edges.push({ source: i, target: j })
    }
  }

  return { vertices, edges }
}

// Example: Bipartite Graph
function getBipartiteGraph() {
  const vertices: Vertex[] = []
  const edges: Edge[] = []

  // Create left set of vertices
  for (let i = 0; i < 3; i++) {
    vertices.push({ id: i, x: 200, y: 150 + i * 150, color: null })
  }

  // Create right set of vertices
  for (let i = 0; i < 3; i++) {
    vertices.push({ id: i + 3, x: 400, y: 150 + i * 150, color: null })
  }

  // Create edges between left and right sets
  edges.push({ source: 0, target: 3 })
  edges.push({ source: 0, target: 4 })
  edges.push({ source: 1, target: 3 })
  edges.push({ source: 1, target: 5 })
  edges.push({ source: 2, target: 4 })
  edges.push({ source: 2, target: 5 })

  return { vertices, edges }
}

// Example: Petersen Graph
function getPetersenGraph() {
  const outerRadius = 150
  const innerRadius = 75
  const centerX = 300
  const centerY = 300
  const vertices: Vertex[] = []
  const edges: Edge[] = []

  // Create 5 outer vertices
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI) / 5
    const x = centerX + outerRadius * Math.cos(angle)
    const y = centerY + outerRadius * Math.sin(angle)
    vertices.push({ id: i, x, y, color: null })
  }

  // Create 5 inner vertices
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI) / 5 + Math.PI / 5
    const x = centerX + innerRadius * Math.cos(angle)
    const y = centerY + innerRadius * Math.sin(angle)
    vertices.push({ id: i + 5, x, y, color: null })
  }

  // Create outer cycle edges
  for (let i = 0; i < 5; i++) {
    edges.push({ source: i, target: (i + 1) % 5 })
  }

  // Create spoke edges
  for (let i = 0; i < 5; i++) {
    edges.push({ source: i, target: i + 5 })
  }

  // Create inner star edges
  for (let i = 0; i < 5; i++) {
    edges.push({ source: 5 + i, target: 5 + ((i + 2) % 5) })
  }

  return { vertices, edges }
}

