import { Physics } from '@react-three/rapier';
import Helicopter from './Helicopter';
import Terrain from './Terrain';
import IsometricCamera from './IsometricCamera';


export default function Scene() {
  return <Physics debug>
    <IsometricCamera />
    <Helicopter />
    <Terrain />
  </Physics>
}