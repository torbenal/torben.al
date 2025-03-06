'use client'
import { Bounds, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Noise } from '@react-three/postprocessing'
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { DoubleSide, Vector3 } from 'three'
import { SimplexNoise } from 'three/examples/jsm/Addons.js'

// Performance configuration
const ANIMATION_FPS = 15 // Target FPS for animation updates
const MOUSE_UPDATE_INTERVAL = 40 // Milliseconds between mouse position updates

// Combined context for scene values
const SceneContext = createContext({ offset: 0, mousePosition: null as Vector3 | null })

// Combined controller component for animations and mouse tracking
const SceneController = ({ children }: PropsWithChildren) => {
  const { camera, raycaster, size, gl } = useThree()
  const sceneValues = useRef({ offset: 0, mousePosition: null as Vector3 | null })
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0))
  const targetPoint = useRef(new THREE.Vector3())
  const frameCounter = useRef(0)
  const lastMouseUpdate = useRef(0)

  const animationTime = 0.002
  const frameSkip = Math.floor(60 / ANIMATION_FPS) - 1

  useFrame((state) => {
    // Skip frames based on target FPS
    frameCounter.current = (frameCounter.current + 1) % (frameSkip + 1)
    if (frameCounter.current !== 0) return

    // Update animation offset
    sceneValues.current.offset = Math.sin(state.clock.getElapsedTime() * animationTime)

    // Keep the plane aligned with the camera
    if (camera) {
      const normal = new THREE.Vector3().copy(camera.position).normalize()
      plane.current.setFromNormalAndCoplanarPoint(normal, targetPoint.current)
    }
  })

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (event: any) => {
      const now = Date.now()

      // Throttle mouse updates
      if (now - lastMouseUpdate.current < MOUSE_UPDATE_INTERVAL) return
      lastMouseUpdate.current = now

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
  const frameCounter = useRef(0)

  // Move the useContext hook to the top level of the component
  const scene = useContext(SceneContext)

  // Create gradient texture
  const isoTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 16
    canvas.height = 16

    const context = canvas.getContext('2d')
    if (!context) return null

    // Create a gradient
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height)

    // Add multiple color stops
    gradient.addColorStop(0, '#000') // Black at the bottom
    gradient.addColorStop(0.1, '#121212') // Deep red at the bottom
    // gradient.addColorStop(0.7, '#E94057') // Pink
    gradient.addColorStop(0.7, '#c72c41') // Pink
    gradient.addColorStop(0.9, '#121212') // Deep red at the top
    gradient.addColorStop(1, '#c72c41') // Black at the top

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

    // Skip frames to match the animation FPS in the controller
    frameCounter.current = (frameCounter.current + 1) % Math.floor(60 / ANIMATION_FPS)
    if (frameCounter.current !== 0) return

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

const Scene = ({ isControlsEnabled }: { isControlsEnabled: boolean }) => {
  const camRef = useRef<THREE.PerspectiveCamera>(null)
  const controlsRef = useRef<any>(null)
  const initialCamPos = useMemo(() => new Vector3(0, 4, 4), [])
  const camZoom = isControlsEnabled ? 2 : 3

  // Reset camera position and rotation when controls are disabled
  useEffect(() => {
    if (!isControlsEnabled && camRef.current && controlsRef.current) {
      // Reset camera to initial position
      camRef.current.position.copy(initialCamPos)
      camRef.current.lookAt(0, 0, 0)

      // Reset orbit controls
      controlsRef.current.reset()
    }
  }, [isControlsEnabled, initialCamPos])

  return (
    <SceneController>
      <TerrainMesh />
      <ambientLight />
      <PerspectiveCamera ref={camRef} position={initialCamPos} makeDefault zoom={camZoom} />
      <OrbitControls
        ref={controlsRef}
        enabled={isControlsEnabled}
        maxDistance={10}
        minDistance={1}
        enablePan={false}
      />
      <EffectComposer>
        <Noise opacity={0.05} />
      </EffectComposer>
    </SceneController>
  )
}

export default function FluidCanvas({ isControlsEnabled }: { isControlsEnabled: boolean }) {
  return (
    <Canvas>
      <Bounds>
        <Scene isControlsEnabled={isControlsEnabled} />
      </Bounds>
    </Canvas>
  )
}
