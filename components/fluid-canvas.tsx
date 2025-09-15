'use client'
import { OrbitControls, OrthographicCamera, PerformanceMonitor } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Noise } from '@react-three/postprocessing'
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { DoubleSide, Vector3 } from 'three'
import { SimplexNoise } from 'three/examples/jsm/Addons.js'

const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
const isLowEndDevice = typeof window !== 'undefined' && navigator.hardwareConcurrency <= 4

const ANIMATION_SPEED = isMobile ? 0.003 : 0.001
const TRAIL_LIFETIME = 2200
const MIN_TRAIL_DISTANCE = 0.005

const GEOMETRY_SIZE = isMobile ? 64 : isLowEndDevice ? 128 : 160
const ENABLE_POST_PROCESSING = !isMobile && !isLowEndDevice
const MOUSE_INFLUENCE_RADIUS = isMobile ? 0.6 : 1.0
interface TrailPoint {
  position: Vector3
  age: number
  intensity: number
  createdAt: number
}

const SceneContext = createContext({ 
  offset: 0, 
  trailPoints: [] as TrailPoint[],
  needsUpdate: false,
  invalidate: () => {} 
})

  
const SceneController = ({ children }: PropsWithChildren) => {
  const { camera, raycaster, gl, invalidate } = useThree()
  const sceneValues = useRef({ 
    offset: 0, 
    trailPoints: [] as TrailPoint[],
    needsUpdate: true,
    invalidate: () => {}
  })
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0))
  const targetPoint = useRef(new THREE.Vector3())
  const lastMouseUpdate = useRef(0)

  sceneValues.current.invalidate = invalidate

  useFrame((state) => {
    const elapsedTime = state.clock.getElapsedTime()
    const newOffset = Math.sin(elapsedTime * ANIMATION_SPEED)
    
    sceneValues.current.offset = newOffset
    
    if (sceneValues.current.trailPoints.length > 0) {
      const currentTime = Date.now()
      sceneValues.current.trailPoints = sceneValues.current.trailPoints
        .map(point => {
          const age = currentTime - point.createdAt
          const normalizedAge = age / TRAIL_LIFETIME
            const baseDecay = 1 - normalizedAge
          const exponentialRate = 0.02 + (normalizedAge * normalizedAge * normalizedAge * 2.5)
          const exponentialFade = Math.exp(-normalizedAge * exponentialRate)
          const tapering = Math.pow(baseDecay, 0.3)
          const intensity = Math.max(0, exponentialFade * tapering)
          return { ...point, age, intensity }
        })
        .filter(point => point.intensity > 0.01)
    }
    
    sceneValues.current.needsUpdate = true

    if (camera) {
      const normal = new THREE.Vector3().copy(camera.position).normalize()
      plane.current.setFromNormalAndCoplanarPoint(normal, targetPoint.current)
    }
  })

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (isMobile || isLowEndDevice) return
    
    const now = Date.now()

    if (now - lastMouseUpdate.current < 16) return
    lastMouseUpdate.current = now

    const rect = gl.domElement.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(new THREE.Vector2(x, y), camera)

    if (raycaster.ray.intersectPlane(plane.current, targetPoint.current)) {
      const currentTime = Date.now()
      const newPosition = targetPoint.current.clone()
      
      const lastPoint = sceneValues.current.trailPoints[sceneValues.current.trailPoints.length - 1]
      if (lastPoint && lastPoint.position.distanceTo(newPosition) > MIN_TRAIL_DISTANCE) {
        const distance = lastPoint.position.distanceTo(newPosition)
        const steps = Math.min(8, Math.floor(distance * 60))
        
        for (let i = 1; i <= steps; i++) {
          const t = i / (steps + 1)
          const interpolatedPos = new THREE.Vector3().lerpVectors(lastPoint.position, newPosition, t)
          const interpolatedIntensity = 1.0 - (t * 0.05)
          
          const interpolatedPoint: TrailPoint = {
            position: interpolatedPos,
            age: 0,
            intensity: interpolatedIntensity,
            createdAt: currentTime - (steps - i) * 10
          }
          
          sceneValues.current.trailPoints.push(interpolatedPoint)
        }
      }
      
      // Add the main point
      const newPoint: TrailPoint = {
        position: newPosition,
        age: 0,
        intensity: 1.0,
        createdAt: currentTime
      }
      
      sceneValues.current.trailPoints.push(newPoint)
      
      
      sceneValues.current.needsUpdate = true
    }
  }, [gl, camera, raycaster])

  useEffect(() => {
    const domElement = gl.domElement
    // Re-enable pointer events only for the canvas element when we need mouse tracking
    domElement.style.pointerEvents = 'auto'
    domElement.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      domElement.removeEventListener('mousemove', handleMouseMove)
      domElement.style.pointerEvents = 'none'
    }
  }, [gl, handleMouseMove])

  return <SceneContext.Provider value={sceneValues.current}>{children}</SceneContext.Provider>
}

const TerrainMesh = () => {
  const simplex = useMemo(() => new SimplexNoise(), [])
  const meshRef = useRef<THREE.Mesh>(null)
  const geometryRef = useRef<THREE.PlaneGeometry>(null)
  const lastUpdateTime = useRef(0)

  // Move the useContext hook to the top level of the component
  const scene = useContext(SceneContext)

  // Create gradient texture inspired by Raycast's colors
  const isoTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32

    const context = canvas.getContext('2d')
    if (!context) return null

    const gradient = context.createLinearGradient(0, 0, 0, canvas.height)

    // Ultra smooth true crimson gradient
    gradient.addColorStop(0, 'rgb(0, 0, 0)')
    gradient.addColorStop(0.02, 'rgb(8, 1, 3)')
    gradient.addColorStop(0.04, 'rgb(16, 2, 6)')
    gradient.addColorStop(0.06, 'rgb(24, 3, 9)')
    gradient.addColorStop(0.08, 'rgb(32, 4, 12)')
    gradient.addColorStop(0.1, 'rgb(40, 5, 15)')
    gradient.addColorStop(0.12, 'rgb(48, 6, 18)')
    gradient.addColorStop(0.15, 'rgb(56, 7, 21)')
    gradient.addColorStop(0.18, 'rgb(64, 8, 24)')
    gradient.addColorStop(0.2, 'rgb(72, 9, 27)')
    gradient.addColorStop(0.25, 'rgb(80, 10, 30)')
    gradient.addColorStop(0.3, 'rgb(90, 12, 34)')
    gradient.addColorStop(0.35, 'rgb(100, 14, 38)')
    gradient.addColorStop(0.4, 'rgb(110, 16, 42)')
    gradient.addColorStop(0.45, 'rgb(120, 18, 46)')
    gradient.addColorStop(0.5, 'rgb(130, 20, 50)')
    gradient.addColorStop(0.55, 'rgb(140, 22, 54)')
    gradient.addColorStop(0.6, 'rgb(150, 24, 58)')
    gradient.addColorStop(0.65, 'rgb(160, 26, 62)')
    gradient.addColorStop(0.7, 'rgb(170, 28, 66)')
    gradient.addColorStop(0.75, 'rgb(175, 29, 68)')
    gradient.addColorStop(0.8, 'rgb(180, 30, 70)')
    gradient.addColorStop(0.85, 'rgb(185, 31, 72)')
    gradient.addColorStop(0.9, 'rgb(190, 32, 74)')
    gradient.addColorStop(0.92, 'rgb(195, 33, 76)')
    gradient.addColorStop(0.94, 'rgb(200, 34, 78)')
    gradient.addColorStop(0.96, 'rgb(210, 36, 82)')
    gradient.addColorStop(0.98, 'rgb(230, 40, 88)')
    gradient.addColorStop(1, 'rgb(255, 45, 98)')

    // Fill with the gradient
    context.fillStyle = gradient
    context.fillRect(0, 0, canvas.width, canvas.height)

    const texture = new THREE.CanvasTexture(canvas)
    texture.repeat.set(8, 6)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping

    return texture
  }, [])

  // Update geometry with better performance
  useFrame(() => {
    if (!geometryRef.current || !meshRef.current) return

    // Always update on first frame or when scene indicates a change is needed
    if (!scene.needsUpdate && lastUpdateTime.current !== 0) return

    // Update without any throttling for maximum smoothness
    lastUpdateTime.current = performance.now()

    // Use the scene values from the context that was retrieved at the top level
    const { offset, trailPoints } = scene
    const pos = geometryRef.current.attributes.position
    const uv = geometryRef.current.attributes.uv
    const worldMatrix = meshRef.current.matrixWorld
    
    // Pre-calculate trail influence data for all active points
    // Use more aggressive filtering on mobile for performance
    const intensityThreshold = isMobile ? 0.05 : 0.01
    const trailInfluenceData = trailPoints
      .filter(point => point.intensity > intensityThreshold)
      .map(point => {
        const radius = MOUSE_INFLUENCE_RADIUS * point.intensity
        return {
          worldPos: point.position,
          radius,
          radiusSquared: radius * radius, // Pre-calculate for performance
          intensity: point.intensity,
          falloffFactor: -6 / (radius * radius) // Pre-calculate falloff factor
        }
      })

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)

      // Simplified noise calculation
      let z = 0.4 * simplex.noise(x, y) + offset

      // Apply trail influence from all active points
      if (trailInfluenceData.length > 0) {
        const vertexWorld = new THREE.Vector3(x, y, 0).applyMatrix4(worldMatrix)
        
        for (const trailPoint of trailInfluenceData) {
          const distanceSquared = vertexWorld.distanceToSquared(trailPoint.worldPos)

          // Use pre-calculated radiusSquared with anti-aliasing margin
          if (distanceSquared < trailPoint.radiusSquared * 8) {
            // Ultra-smooth exponential falloff with anti-aliasing
            const distance = Math.sqrt(distanceSquared)
            const normalizedDistance = distance / trailPoint.radius
            const antiAliasedFalloff = Math.exp(-normalizedDistance * normalizedDistance * 3) // Gaussian-like smoothing
            
            if (antiAliasedFalloff > 0.003) {
              // Much more subtle height influence
              const antiAlias = Math.pow(antiAliasedFalloff, 0.8) // Anti-aliasing smoothing
              z += antiAlias * 0.005 * trailPoint.intensity // Very subtle height influence
            }
          }
        }
      }

      pos.setZ(i, z)
      // Extremely smooth UV mapping with soft transitions
      // Use even wider range and apply smoothing curve
      let normalizedHeight = (z + 1.0) / 2.0 // Much wider range for ultra smooth mapping
      
      // Apply smoothstep function for even smoother transitions
      normalizedHeight = normalizedHeight * normalizedHeight * (3.0 - 2.0 * normalizedHeight)
      
      // Keep away from extreme edges to prevent gradient restarts
      const ultraSmoothHeight = Math.max(0.05, Math.min(0.95, normalizedHeight))
      uv.setY(i, ultraSmoothHeight)
    }

    pos.needsUpdate = true
    uv.needsUpdate = true
    
    // Only compute normals if needed (expensive operation)
    if (trailPoints.length > 0 || Math.abs(offset) > 0.01) {
      geometryRef.current.computeVertexNormals()
    }
    
    // Reset update flag after successful update
    scene.needsUpdate = false
  })

  // Cleanup function
  useEffect(() => {
    const geometry = geometryRef.current
    const texture = isoTexture
    return () => {
      if (geometry) {
        geometry.dispose()
      }
      if (texture) {
        texture.dispose()
      }
    }
  }, [isoTexture])

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} scale={[12, 8, 1]} rotation={[0, 0, 0]}>
      <planeGeometry args={[1, 1, GEOMETRY_SIZE - 1, GEOMETRY_SIZE - 1]} ref={geometryRef} />
      <meshBasicMaterial map={isoTexture} side={DoubleSide} />
    </mesh>
  )
}

const Scene = ({ isControlsEnabled }: { isControlsEnabled: boolean }) => {
  const { size } = useThree()
  const camRef = useRef<THREE.OrthographicCamera>(null)
  const controlsRef = useRef<any>(null)
  const initialCamPos = useMemo(() => new Vector3(0, 0, 5), [])
  const [performanceLevel, setPerformanceLevel] = useState<'high' | 'medium' | 'low'>('high')
  
  // Simple camera bounds that fill the viewport
  const cameraBounds = useMemo(() => {
    const aspect = size.width * 0.5 / size.height
    const height = 4
    const width = height * aspect
    return { left: -width, right: width, top: height, bottom: -height }
  }, [size])
  
  // Performance monitoring callback
  const handlePerformanceChange = useCallback((api: any) => {
    const avgFps = api.current
    if (avgFps < 20) {
      setPerformanceLevel('low')
    } else if (avgFps < 40) {
      setPerformanceLevel('medium')
    } else {
      setPerformanceLevel('high')
    }
  }, [])


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
      <PerformanceMonitor onChange={handlePerformanceChange} />
      <TerrainMesh />
      <ambientLight intensity={0.8} />
      <OrthographicCamera 
        ref={camRef} 
        position={initialCamPos} 
        makeDefault 
        manual
        left={cameraBounds.left}
        right={cameraBounds.right}
        top={cameraBounds.top}
        bottom={cameraBounds.bottom}
        near={0.1}
        far={100}
        onUpdate={(camera) => camera.updateProjectionMatrix()}
      />
      <OrbitControls
        ref={controlsRef}
        enabled={isControlsEnabled && !isMobile}
        maxDistance={10}
        minDistance={1}
        enablePan={false}
        enableDamping={true}
        dampingFactor={0.05}
      />
      {ENABLE_POST_PROCESSING && performanceLevel !== 'low' && (
        <EffectComposer multisampling={performanceLevel === 'high' ? 4 : 0}>
          <Noise opacity={performanceLevel === 'high' ? 0.05 : 0.02} />
        </EffectComposer>
      )}
    </SceneController>
  )
}

export default function FluidCanvas({ isControlsEnabled }: { isControlsEnabled: boolean }) {
  const [isActive, setIsActive] = useState(true)
  
  // Pause animation when tab is not visible to save battery
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsActive(!document.hidden)
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])
  
  return (
    <Canvas
      style={{ width: '100vw', height: '100vh', pointerEvents: 'none' }}
      frameloop={isActive ? 'always' : 'never'}
      gl={{
        powerPreference: 'high-performance',
        alpha: false,
        antialias: !isMobile && !isLowEndDevice,
        stencil: false,
        depth: true,
        logarithmicDepthBuffer: false,
        preserveDrawingBuffer: false
      }}
      camera={{
        fov: isMobile ? 60 : 50,
        near: 0.1,
        far: 100
      }}
      dpr={isMobile ? [0.5, 1] : [1, 2]}
    >
      <Scene isControlsEnabled={isControlsEnabled} />
    </Canvas>
  )
}
