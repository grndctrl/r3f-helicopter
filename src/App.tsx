import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Scene from "./components/Scene";

export default function App() {
  return <main className="w-full h-screen">
    <Canvas>
      <Scene />
      <OrbitControls />
    </Canvas>
  </main>
}