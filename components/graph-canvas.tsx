"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import type { Vertex, Edge } from "@/lib/graph-utils"

interface GraphCanvasProps {
  vertices: Vertex[]
  edges: Edge[]
  selectedVertex: number | null
  setVertices: React.Dispatch<React.SetStateAction<Vertex[]>>
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
  setSelectedVertex: React.Dispatch<React.SetStateAction<number | null>>
}

export default function GraphCanvas({
  vertices,
  edges,
  selectedVertex,
  setVertices,
  setEdges,
  setSelectedVertex,
}: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredVertex, setHoveredVertex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [draggedVertex, setDraggedVertex] = useState<number | null>(null)


  const colors = [
    "#EF4444",
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#F97316",
    "#6366F1",
    "#14B8A6",
  ]

  const VERTEX_RADIUS = 20
  const VERTEX_BORDER = 3
  const SELECTED_BORDER = 5
  const EDGE_WIDTH = 2

  // Draw graph on canvas
  const drawGraph = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw edges
    ctx.lineWidth = EDGE_WIDTH
    ctx.strokeStyle = "#4B5563"

    edges.forEach((edge) => {
      const source = vertices.find((v) => v.id === edge.source)
      const target = vertices.find((v) => v.id === edge.target)

      if (source && target) {
        ctx.beginPath()
        ctx.moveTo(source.x, source.y)
        ctx.lineTo(target.x, target.y)
        ctx.stroke()
      }
    })

    // Draw vertices
    vertices.forEach((vertex) => {
      const isSelected = vertex.id === selectedVertex
      const isHovered = vertex.id === hoveredVertex

      // Draw vertex circle
      ctx.beginPath()
      ctx.arc(vertex.x, vertex.y, VERTEX_RADIUS, 0, Math.PI * 2)

      // Fill with color if colored, otherwise light gray
      if (vertex.color !== null && vertex.color !== undefined) {
        ctx.fillStyle = colors[vertex.color % colors.length]
      } else {
        ctx.fillStyle = "#E5E7EB" // Gray-200
      }
      ctx.fill()

      // Draw border
      ctx.lineWidth = isSelected ? SELECTED_BORDER : VERTEX_BORDER
      ctx.strokeStyle = isHovered ? "#2563EB" : "#4B5563" // Blue-600 : Gray-600
      ctx.stroke()

      // Draw vertex ID
      ctx.fillStyle = "#1F2937" // Gray-800
      ctx.font = "bold 14px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(vertex.id.toString(), vertex.x, vertex.y)
    })

    // Highlight neighbors of hovered vertex
    if (hoveredVertex !== null) {
      const neighbors = edges
        .filter((e) => e.source === hoveredVertex || e.target === hoveredVertex)
        .map((e) => (e.source === hoveredVertex ? e.target : e.source))

      // Highlight neighbor edges
      ctx.lineWidth = EDGE_WIDTH + 1
      ctx.strokeStyle = "#2563EB" // Blue-600

      edges.forEach((edge) => {
        if (edge.source === hoveredVertex || edge.target === hoveredVertex) {
          const source = vertices.find((v) => v.id === edge.source)
          const target = vertices.find((v) => v.id === edge.target)

          if (source && target) {
            ctx.beginPath()
            ctx.moveTo(source.x, source.y)
            ctx.lineTo(target.x, target.y)
            ctx.stroke()
          }
        }
      })

      // Highlight neighbor vertices
      neighbors.forEach((neighborId) => {
        const neighbor = vertices.find((v) => v.id === neighborId)
        if (neighbor) {
          ctx.beginPath()
          ctx.arc(neighbor.x, neighbor.y, VERTEX_RADIUS + 3, 0, Math.PI * 2)
          ctx.lineWidth = VERTEX_BORDER + 1
          ctx.strokeStyle = "#2563EB" // Blue-600
          ctx.stroke()
        }
      })
    }
  }

  // Handle canvas resize
  const handleResize = () => {
    const canvas = canvasRef.current
    const container = containerRef.current

    if (canvas && container) {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
      drawGraph()
    }
  }

  // Get vertex at position
  const getVertexAtPosition = (x: number, y: number): number | null => {
    for (let i = vertices.length - 1; i >= 0; i--) {
      const vertex = vertices[i]
      const distance = Math.sqrt(Math.pow(vertex.x - x, 2) + Math.pow(vertex.y - y, 2))

      if (distance <= VERTEX_RADIUS) {
        return vertex.id
      }
    }

    return null
  }

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const vertexId = getVertexAtPosition(x, y)

    if (vertexId !== null) {
      // If clicking on a vertex
      if (selectedVertex === null) {
        // Select the vertex
        setSelectedVertex(vertexId)
      } else if (selectedVertex === vertexId) {
        // Deselect if clicking the same vertex
        setSelectedVertex(null)
      } else {
        // Create an edge between selected vertex and clicked vertex
        const edgeExists = edges.some(
          (e) =>
            (e.source === selectedVertex && e.target === vertexId) ||
            (e.source === vertexId && e.target === selectedVertex),
        )

        if (!edgeExists && selectedVertex !== vertexId) {
          setEdges([...edges, { source: selectedVertex, target: vertexId }])
        }

        setSelectedVertex(null)
      }

      // Start dragging
      setIsDragging(true)
      setDraggedVertex(vertexId)
    } else {
      // If clicking on empty space
      if (selectedVertex === null) {
        // Create a new vertex
        const newId = vertices.length > 0 ? Math.max(...vertices.map((v) => v.id)) + 1 : 0
        setVertices([...vertices, { id: newId, x, y, color: null }])
      } else {
        // Deselect the selected vertex
        setSelectedVertex(null)
      }
    }
  }

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if hovering over a vertex
    const vertexId = getVertexAtPosition(x, y)
    setHoveredVertex(vertexId)

    // Handle dragging
    if (isDragging && draggedVertex !== null) {
      setVertices(vertices.map((v) => (v.id === draggedVertex ? { ...v, x, y } : v)))
    }
  }

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false)
    setDraggedVertex(null)
  }

  // Handle mouse leave
  const handleMouseLeave = () => {
    setHoveredVertex(null)
    setIsDragging(false)
    setDraggedVertex(null)
  }

  // Initialize canvas and add event listeners
  useEffect(() => {
    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Redraw graph when vertices, edges, or selected vertex changes
  useEffect(() => {
    drawGraph()
  }, [vertices, edges, selectedVertex, hoveredVertex])

  return (
    <div ref={containerRef} className="w-full h-[600px] relative bg-white">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
      <div className="absolute bottom-2 left-2 text-xs text-gray-500">
        Click to add a vertex. Click a vertex to select it, then click another vertex to create an edge.
      </div>
    </div>
  )
}

