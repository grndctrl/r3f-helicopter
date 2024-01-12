import { MathUtils, Raycaster, Vector3 } from "three";
import { Cone } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Ray } from '@dimforge/rapier3d-compat'
import { CapsuleCollider, RigidBody, RapierRigidBody, useRapier, interactionGroups } from "@react-three/rapier";
import { useControls } from "leva";
import { useEffect, useRef } from "react";




export default function Helicopter() {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const { hoverForce, maxVelocity, hoverHeight, enable } = useControls('helicopter', {
    hoverForce: {
      value: 0.02, min: -0.1, max: 0.1
    },
    maxVelocity: {
      value: 0,
      min: 0, max: 5
    },
    hoverHeight: {
      value: 5,
      min: 0,
      max: 10
    },
    enable: false,
  })
  const position = new Vector3(0, 2, 0)
  const downVector = new Vector3(0, -1, 0);
  const upVector = new Vector3(0, 1, 0);
  const ray = new Ray(position, downVector);
  const force = new Vector3()
  const velocity = new Vector3()
  const raycaster = new Raycaster()
  const currentHoverHeight = useRef(0)

  const { world } = useRapier()

  useEffect(() => {
    const { current: rigidBody } = rigidBodyRef

    if (!rigidBody) return

    rigidBody.lockRotations(true, true)
  }, [])

  useFrame(() => {
    const { current: rigidBody } = rigidBodyRef

    if (!rigidBody) return

    ray.origin = rigidBody.translation();
    ray.dir = downVector.clone()
    const hit = world.castRay(
      ray,
      hoverHeight,
      true,
      undefined,
      interactionGroups(0, [1])
    )

    if (hit) {
      const point = new Vector3(
        ray.pointAt(hit.toi).x,
        ray.pointAt(hit.toi).y,
        ray.pointAt(hit.toi).z
      );


      if (enable) {
        currentHoverHeight.current = MathUtils.lerp(currentHoverHeight.current, hoverHeight, 0.01);
      } else {
        currentHoverHeight.current = MathUtils.lerp(currentHoverHeight.current, 0, 0.0025);
      }

      const diff = currentHoverHeight.current - point.distanceTo(ray.origin as Vector3)
      const forceVector = upVector
        .clone()
        .normalize()
        .multiplyScalar(diff * hoverForce);

      rigidBody.applyImpulseAtPoint(forceVector, ray.origin, true);
    }

  })


  return <RigidBody ref={rigidBodyRef} collisionGroups={interactionGroups(0, [1])} colliders={false} position={position} restitution={0} mass={10} linearDamping={2}>
    <CapsuleCollider args={[0.5, 0.25]} rotation={[Math.PI * -0.5, 0, 0]} />
    <Cone rotation={[Math.PI * -0.5, 0, 0]} args={[0.25, 1, 7]}>
      <meshNormalMaterial />
    </Cone>
  </RigidBody>
}