import { useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// Material mapping by mesh name (color-coded from 3ds Max)
// Groups identified by color: body panel, glass, wheels, chrome, interior, etc.
const MATERIAL_MAP = {
  wire_134110008: { // dark gold → body paint
    color: '#000000ff',
    roughness: 0.12,
    metalness: 0.85,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    type: 'physical',
  },
  wire_224198087: { // gold/yellow → chrome / trim
    color: '#000000ff',
    roughness: 0.08,
    metalness: 1.0,
    envMapIntensity: 3,
    type: 'standard',
  },
  wire_177028149: { // purple → interior / plastic
    color: '#000000ff',
    roughness: 0.6,
    metalness: 0.1,
    type: 'standard',
  },
  wire_134006006: { // dark red → underbody / frame
    color: '#000000ff',
    roughness: 0.9,
    metalness: 0.15,
    type: 'standard',
  },
  wire_087224198: { // teal → glass
    color: '#000000ff',
    roughness: 0.04,
    metalness: 0.05,
    transmission: 0.88,
    transparent: true,
    opacity: 0.55,
    ior: 1.5,
    type: 'physical',
  },
  wire_006134006: { // green → tires / rubber
    color: '#141414',
    roughness: 0.92,
    metalness: 0.0,
    type: 'standard',
  },
  wire_224086086: { // salmon/red → body panels 2
    color: '#000000ff',
    roughness: 0.12,
    metalness: 0.85,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    type: 'physical',
  },
  wire_229166215: { // pink → lights / lenses
    color: '#000000ff',
    emissive: '#ffe88a',
    emissiveIntensity: 0.6,
    roughness: 0.05,
    metalness: 0.0,
    type: 'standard',
  },
  wire_028089177: { // blue → rim / wheels
    color: '#000000ff',
    roughness: 0.15,
    metalness: 0.95,
    envMapIntensity: 2.5,
    type: 'standard',
  },
  wire_143224087: { // lime → body accent / orange trim (now matching body)
    color: '#000000ff',
    roughness: 0.12,
    metalness: 0.85,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    type: 'physical',
  },
}

function buildMaterial(cfg) {
  if (cfg.type === 'physical') {
    return new THREE.MeshPhysicalMaterial({
      color: cfg.color,
      roughness: cfg.roughness ?? 0.5,
      metalness: cfg.metalness ?? 0.5,
      clearcoat: cfg.clearcoat ?? 0,
      clearcoatRoughness: cfg.clearcoatRoughness ?? 0.1,
      transmission: cfg.transmission ?? 0,
      transparent: cfg.transparent ?? false,
      opacity: cfg.opacity ?? 1,
      ior: cfg.ior ?? 1.5,
      envMapIntensity: cfg.envMapIntensity ?? 1.5,
    })
  }
  return new THREE.MeshStandardMaterial({
    color: cfg.color,
    roughness: cfg.roughness ?? 0.5,
    metalness: cfg.metalness ?? 0.0,
    emissive: cfg.emissive ? new THREE.Color(cfg.emissive) : undefined,
    emissiveIntensity: cfg.emissiveIntensity ?? 0,
    transparent: cfg.transparent ?? false,
    opacity: cfg.opacity ?? 1,
    envMapIntensity: cfg.envMapIntensity ?? 1.5,
  })
}

export default function FordF150() {
  const { scene } = useGLTF('/ford_ranger.glb')
  const groupRef = useRef()

  useEffect(() => {
    if (!scene) return

    // Apply PBR materials based on mesh name
    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true

        const cfg = MATERIAL_MAP[obj.name]
        if (cfg) {
          obj.material = buildMaterial(cfg)
        }
      }
    })

    window.highlightMesh = (meshName) => {
      scene.traverse((obj) => {
        if (obj.isMesh && obj.name.startsWith('wire_')) {
          if (obj.name === meshName) {
            obj.material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
          } else {
            obj.material = new THREE.MeshBasicMaterial({ color: 0x222222, transparent: true, opacity: 0.5 })
          }
        }
      })
    }
  }, [scene])

  // Model is in mm, ~5376mm long → scale to ~5.4 units (real world meters)
  // Bounds min Y = 0 (sits on ground in original), ground in scene = -1.42
  // Scale: 1 unit = 1000mm → 0.001 → but that makes it tiny
  // Let's scale so length ≈ 5.5 units
  const scale = 0.001  // mm → meters (1:1000)
  // Center X offset: center.x = -68 mm → negligible
  // Center Z offset: center.z = -446 mm → shift by +0.446
  // Y: min=0 in model, so bottom is at Y=0 → place at scene ground Y=-1.42

  return (
    <primitive
      ref={groupRef}
      object={scene}
      scale={[scale, scale, scale]}
      position={[0.068, -1.42, 0.446]}
      rotation={[0, Math.PI, 0]}
    />
  )
}

useGLTF.preload('/ford_ranger.glb')
