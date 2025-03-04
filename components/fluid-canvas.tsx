'use client'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { DoubleSide, Vector3 } from 'three'
import { SimplexNoise } from 'three/examples/jsm/Addons.js'

// Combined context for scene values
const SceneContext = createContext({ offset: 0, mousePosition: null as Vector3 | null })

// Combined controller component for animations and mouse tracking
const SceneController = ({ children }: PropsWithChildren) => {
  const { camera, raycaster, size, gl } = useThree()
  const sceneValues = useRef({ offset: 0, mousePosition: null as Vector3 | null })
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0))
  const targetPoint = useRef(new THREE.Vector3())

  useFrame((state) => {
    // Update animation offset
    sceneValues.current.offset = Math.sin(state.clock.getElapsedTime() * 0.03) * 0.2

    // Keep the plane aligned with the camera
    if (camera) {
      const normal = new THREE.Vector3().copy(camera.position).normalize()
      plane.current.setFromNormalAndCoplanarPoint(normal, targetPoint.current)
    }
  })

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (event: any) => {
      // Calculate normalized device coordinates
      const x = (event.offsetX / size.width) * 2 - 1
      const y = -(event.offsetY / size.height) * 2 + 1

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera)

      if (raycaster.ray.intersectPlane(plane.current, targetPoint.current)) {
        sceneValues.current.mousePosition = targetPoint.current.clone()
      }
    }

    const domElement = gl.domElement
    domElement.addEventListener('mousemove', handleMouseMove)
    return () => domElement.removeEventListener('mousemove', handleMouseMove)
  }, [gl, camera, raycaster, size])

  return <SceneContext.Provider value={sceneValues.current}>{children}</SceneContext.Provider>
}

const TerrainMesh = () => {
  const simplex = useMemo(() => new SimplexNoise(), [])
  const meshRef = useRef<THREE.Mesh>(null)
  const geometryRef = useRef<THREE.PlaneGeometry>(null)
  const size = 128 // Reduced for better performance

  // Move the useContext hook to the top level of the component
  const scene = useContext(SceneContext)

  // Create gradient texture
  const isoTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 16

    const context = canvas.getContext('2d')
    if (!context) return null

    // Create a gradient
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height)

    // Add multiple color stops
    gradient.addColorStop(0, '#000') // Black at the bottom
    gradient.addColorStop(0.1, '#121212') // Deep red at the bottom
    // gradient.addColorStop(0.7, '#E94057') // Pink
    gradient.addColorStop(0.7, '#B5101D') // Pink
    gradient.addColorStop(0.9, '#121212') // Deep red at the top
    gradient.addColorStop(1, '#B5101D') // Black at the top

    // Fill with the gradient
    context.fillStyle = gradient
    context.fillRect(0, 0, canvas.width, canvas.height)

    const texture = new THREE.CanvasTexture(canvas)
    texture.repeat.set(10, 7)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping

    return texture
  }, [])

  // Update geometry
  useFrame(() => {
    if (!geometryRef.current || !meshRef.current) return

    // Use the scene values from the context that was retrieved at the top level
    const { offset, mousePosition } = scene
    const pos = geometryRef.current.attributes.position
    const uv = geometryRef.current.attributes.uv
    const worldMatrix = meshRef.current.matrixWorld

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)

      // Simplified noise calculation
      let z = 0.4 * simplex.noise(x, y) + offset

      // Apply mouse influence if available with smoother falloff
      if (mousePosition) {
        const vertexWorld = new THREE.Vector3(x, y, 0).applyMatrix4(worldMatrix)
        const distance = vertexWorld.distanceTo(mousePosition)

        // Smooth Gaussian-like falloff instead of sharp cutoff
        // e^(-x²) gives a nice bell curve
        const radius = 1.2
        const falloff = Math.exp(-Math.pow(distance / radius, 2) * 8)

        // Apply smoothed distortion
        if (falloff > 0.01) {
          // Small threshold for performance
          z += falloff * 0.05
        }
      }

      pos.setZ(i, z)
      uv.setY(i, z) // Update UV for isolines
    }

    pos.needsUpdate = true
    uv.needsUpdate = true
    geometryRef.current.computeVertexNormals()
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} scale={[4, 2, 1]} rotation={[-Math.PI / 4, 0, 0]}>
      <planeGeometry args={[1, 1, size - 1, size - 1]} ref={geometryRef} />
      <meshBasicMaterial map={isoTexture} side={DoubleSide} />
    </mesh>
  )
}

const Scene = () => (
  <SceneController>
    <TerrainMesh />
    <ambientLight />
    <PerspectiveCamera position={[0, 4, 4]} makeDefault zoom={3} />
    <OrbitControls enabled={false} />
    <EffectComposer>
      <Noise opacity={0.12} />
      <Vignette eskil={false} offset={0.1} darkness={1} />
    </EffectComposer>
  </SceneController>
)

export default function FluidCanvas() {
  return (
    <Canvas>
      <Scene />
    </Canvas>
  )
}
