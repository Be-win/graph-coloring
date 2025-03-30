"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from "lucide-react"
import GraphCanvas from "./graph-canvas"
import { type Vertex, type Edge, colorGraph, colorGraphStepByStep, getExampleGraph } from "@/lib/graph-utils"

export default function GraphColoringSimulator() {
  const [vertices, setVertices] = useState<Vertex[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [selectedVertex, setSelectedVertex] = useState<number | null>(null)
  const [chromaticNumber, setChromaticNumber] = useState<number | null>(null)
  const [status, setStatus] = useState<string>("Draw a graph or load an example.")
  const [isStepByStep, setIsStepByStep] = useState<boolean>(false)
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [coloringSteps, setColoringSteps] = useState<Vertex[][]>([])

  // Reset coloring state
  const resetColoring = () => {
    setVertices(vertices.map((v) => ({ ...v, color: null })))
    setChromaticNumber(null)
    setStatus("Draw a graph or load an example.")
    setIsStepByStep(false)
    setCurrentStep(0)
    setColoringSteps([])
  }

  // Handle coloring the graph
  const handleColorGraph = () => {
    if (vertices.length === 0) {
      setStatus("Cannot color an empty graph. Add vertices and edges.")
      return
    }

    if (edges.length === 0) {
      const coloredVertices = vertices.map((v) => ({ ...v, color: 0 }))
      setVertices(coloredVertices)
      setChromaticNumber(1)
      setStatus("Graph colored successfully using 1 color.")
      return
    }

    const { coloredVertices, numColors } = colorGraph(vertices, edges)
    setVertices(coloredVertices)
    setChromaticNumber(numColors)
    setStatus(`Graph colored successfully using ${numColors} color${numColors !== 1 ? "s" : ""}.`)
  }

  // Handle step-by-step coloring
  const handleStepByStepColoring = () => {
    if (vertices.length === 0) {
      setStatus("Cannot color an empty graph. Add vertices and edges.")
      return
    }

    resetColoring()
    const steps = colorGraphStepByStep(vertices, edges)
    setColoringSteps(steps)
    setIsStepByStep(true)
    setCurrentStep(0)
    setStatus("Click 'Next Step' to begin coloring vertices one by one.")
  }

  // Handle next step in step-by-step coloring
  const handleNextStep = () => {
    if (currentStep < coloringSteps.length) {
      const stepVertices = coloringSteps[currentStep]
      setVertices(stepVertices)

      // Find vertex that was just colored
      const justColoredVertex = stepVertices.find(
        (v, i) => i < stepVertices.length && (currentStep === 0 || v.color !== coloringSteps[currentStep - 1][i].color),
      )

      if (justColoredVertex) {
        setStatus(`Colored vertex ${justColoredVertex.id} with color ${justColoredVertex.color! + 1}.`)
      }

      setCurrentStep(currentStep + 1)

      // calculate the chromatic number
      if (currentStep === coloringSteps.length - 1) {
        const numColors = Math.max(...stepVertices.map((v) => v.color || 0)) + 1
        setChromaticNumber(numColors)
        setStatus(`Graph colored successfully using ${numColors} color${numColors !== 1 ? "s" : ""}.`)
      }
    }
  }

  // Handle clearing the graph
  const handleClearGraph = () => {
    if (window.confirm("Are you sure you want to clear the graph?")) {
      setVertices([])
      setEdges([])
      setSelectedVertex(null)
      setChromaticNumber(null)
      setStatus("Draw a graph or load an example.")
      setIsStepByStep(false)
      setCurrentStep(0)
      setColoringSteps([])
    }
  }

  // Handle loading example graphs
  const handleLoadExample = (example: string) => {
    resetColoring()
    const { vertices: exampleVertices, edges: exampleEdges } = getExampleGraph(example)
    setVertices(exampleVertices)
    setEdges(exampleEdges)
    setSelectedVertex(null)
    setStatus(`Loaded example: ${example}. Click 'Color Graph' to see the coloring.`)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Graph Coloring Simulator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
          <GraphCanvas
            vertices={vertices}
            edges={edges}
            selectedVertex={selectedVertex}
            setVertices={setVertices}
            setEdges={setEdges}
            setSelectedVertex={setSelectedVertex}
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Button className="w-full" onClick={handleColorGraph} disabled={vertices.length === 0 || isStepByStep}>
                Color Graph
              </Button>

              <Button
                className="w-full"
                variant="outline"
                onClick={handleStepByStepColoring}
                disabled={vertices.length === 0 || (isStepByStep && currentStep < coloringSteps.length)}
              >
                Step-By-Step Coloring
              </Button>

              {isStepByStep && (
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={handleNextStep}
                  disabled={currentStep >= coloringSteps.length}
                >
                  Next Step
                </Button>
              )}

              <Button className="w-full" variant="destructive" onClick={handleClearGraph}>
                Clear Graph
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Load Example</label>
              <Select onValueChange={handleLoadExample}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an example graph" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cycle">Cycle (C5)</SelectItem>
                  <SelectItem value="complete">Complete (K4)</SelectItem>
                  <SelectItem value="bipartite">Bipartite Graph</SelectItem>
                  <SelectItem value="petersen">Petersen Graph</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between">
                <span className="font-medium">Chromatic Number (x):</span>
                <span className="font-bold">{chromaticNumber !== null ? chromaticNumber : "N/A"}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Vertices:</span>
                <span>{vertices.length}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Edges:</span>
                <span>{edges.length}</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-100 rounded-md flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">{status}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

