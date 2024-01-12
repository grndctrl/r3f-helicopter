import { Physics } from '@react-three/rapier';
import Helicopter from './Helicopter';
import Terrain from './Terrain';


export default function Scene() {
  return <Physics debug>
    <Helicopter />
    <Terrain />
  </Physics>
}