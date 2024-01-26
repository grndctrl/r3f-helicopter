import { Box } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

// type TerrainProps = {
//   children: React.ReactNode;
// };

export default function Terrain() {
  return <RigidBody colliders="trimesh" type="fixed">
    <Box args={[1000, 1, 1000]} position={[0, -0.5, 0]}>
      <meshBasicMaterial />
    </Box>
  </RigidBody>
}