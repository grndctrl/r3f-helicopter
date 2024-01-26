import { Ray } from "@dimforge/rapier3d-compat";
import { Box, Cone, Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CapsuleCollider, RapierRigidBody, RigidBody, interactionGroups, useRapier } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import { Mesh, Quaternion, Vector3 } from "three";
import { useKeyControls } from "../../hooks/keyControls";
import { DebugBalance, DebugFloat } from "./debug";

const _upVector = new Vector3(0, 1, 0)
const _forwardVector = new Vector3(0, 0, 1)
const _leftVector = new Vector3(1, 0, 0)
const _downVector = new Vector3(0, -1, 0)

const _ray = new Ray(new Vector3(), _downVector);

const _lift = new Vector3()
const _throttle = new Vector3()
const _roll = new Vector3()
const _pitch = new Vector3()
const _yaw = new Vector3()
const _impulse = new Vector3()
const _torqueImpulse = new Vector3()

const _balance = new Vector3()
const _facing = new Vector3()
const _side = new Vector3()
const _balanceX = new Vector3()
const _facingY = new Vector3()
const _balanceZ = new Vector3()
const _crossVecOnX = new Vector3()
const _crossVecOnY = new Vector3()
const _crossVecOnZ = new Vector3()


type HelicopterProps = {
  balanceOptions?: {
    springXZ?: number
    dampingXZ?: number
    springY?: number
    dampingY?: number
  }
  debug?: boolean
}

export default function Helicopter({
  balanceOptions,
  debug = true }: HelicopterProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const engineLeftRef = useRef<Mesh>(null)
  const engineRightRef = useRef<Mesh>(null)

  const { forward, backward, left, right, engine } = useKeyControls()
  const [isActive, toggleActive] = useState(false)

  const [balance, setBalance] = useState({
    springXZ: balanceOptions?.springXZ || 10,
    dampingXZ: balanceOptions?.dampingXZ || 5,
    springY: balanceOptions?.springY || 10,
    dampingY: balanceOptions?.dampingY || 5,
  })
  const [float, setFloat] = useState({
    stable: 40, lift: 32, hoverHeight: 4
  })

  const { world } = useRapier()

  const balanceRigidBody = (rigidBody: RapierRigidBody, delta: number) => {
    _balance.copy(_upVector).applyQuaternion(rigidBody.rotation() as Quaternion)
    _facing.copy(_forwardVector).applyQuaternion(rigidBody.rotation() as Quaternion)

    _balanceX.set(0, _balance.y, _balance.z)
    _facingY.set(_facing.x, 0, _facing.z)
    _balanceZ.set(_balance.x, _balance.y, 0)

    _crossVecOnX.copy(_upVector).cross(_balanceX);
    _crossVecOnY.copy(_facing).cross(_facingY);
    _crossVecOnZ.copy(_upVector).cross(_balanceZ);

    const force = new Vector3(
      (_crossVecOnX.x < 0 ? 1 : -1) * (_balanceX.angleTo(_upVector)) * delta * balance.springXZ
      - rigidBody.angvel().x * delta * balance.dampingXZ,
      - rigidBody.angvel().y * delta * balance.dampingY,
      (_crossVecOnZ.z < 0 ? 1 : -1) * (_balanceZ.angleTo(_upVector)) * delta * balance.springXZ
      - rigidBody.angvel().z * delta * balance.dampingXZ,
    );

    _torqueImpulse.add(force)
    // rigidBody.applyTorqueImpulse(force, true)
  };

  const floatRigidBody = (rigidBody: RapierRigidBody, delta: number) => {
    let climbing = false
    _lift.set(0, 0, 0)

    _ray.origin = rigidBody.translation();
    const hit = world.castRay(
      _ray,
      float.hoverHeight * 2,
      true,
      undefined,
      interactionGroups(0, [1])
    );

    if (hit) {
      const point = new Vector3(
        _ray.pointAt(hit.toi).x,
        _ray.pointAt(hit.toi).y,
        _ray.pointAt(hit.toi).z
      );

      const distance = point.distanceTo(rigidBody.translation() as Vector3)

      _lift.y = float.stable * delta;
      _lift.y += ((float.hoverHeight - distance) / float.hoverHeight) * float.lift * delta
        - rigidBody.linvel().y * delta * balance.dampingY

      climbing = true
    }

    if (!climbing) {
      _lift.y = float.stable * delta - rigidBody.linvel().y * delta * balance.dampingY
    }

    // rigidBody.applyImpulse(_lift, true)
    _impulse.add(_lift)
  }

  const moveRigidBody = (rigidBody: RapierRigidBody, delta: number) => {
    _facing.copy(_forwardVector).applyQuaternion(rigidBody.rotation() as Quaternion)
    _side.copy(_leftVector).applyQuaternion(rigidBody.rotation() as Quaternion)

    _throttle.set(_facing.x, 0, _facing.z)
      .normalize()
      .multiplyScalar(24 * delta * (Number(forward) - (Number(backward))))
    _impulse.add(_throttle)

    _yaw.copy(_upVector.clone().multiplyScalar(8 * delta * (Number(left) - (Number(right)))))
    _pitch.copy(_side.clone().multiplyScalar(4 * delta * (Number(forward) - (Number(backward)))))
    _roll.copy(_facing.clone().multiplyScalar(-8 * delta * (Number(left) - (Number(right)))))

    _torqueImpulse.add(_yaw)
    _torqueImpulse.add(_pitch)
    _torqueImpulse.add(_roll)
  }

  useEffect(() => {
    if (engine) {
      toggleActive((state) => !state)
    }
  }, [engine])

  useFrame(({ clock }) => {
    let delta = clock.getDelta()
    delta = delta < 0.001 ? 0.001 : delta

    const { current: rigidBody } = rigidBodyRef

    if (!rigidBody) return

    // physics
    _impulse.set(0, 0, 0)
    _torqueImpulse.set(0, 0, 0)

    if (isActive) {
      setFloat((state) => ({ ...state, stable: 40, hoverHeight: 4 }))

      floatRigidBody(rigidBody, delta)
      moveRigidBody(rigidBody, delta)
    } else {
      if (float.hoverHeight > 0) {
        setFloat((state) => ({ ...state, stable: 32, hoverHeight: state.hoverHeight - (10 * delta) < 0 ? 0 : state.hoverHeight - (10 * delta) }))

        floatRigidBody(rigidBody, delta)
      }
    }

    balanceRigidBody(rigidBody, delta)

    rigidBody.applyImpulse(_impulse, true)
    rigidBody.applyTorqueImpulse(_torqueImpulse, true)

    // visuals
    const { current: engineRight } = engineRightRef
    const { current: engineLeft } = engineLeftRef

    if (!engineRight || !engineLeft) return

    if (isActive) {
      engineRight.rotation.set(.4 * (Number(left) - Number(right)) + .4 * (Number(forward) - Number(backward)), 0, 0)
      engineLeft.rotation.set(.4 * (Number(right) - Number(left)) + .4 * (Number(forward) - Number(backward)), 0, 0)
    }
  })


  return (
    <>
      {debug && <DebugBalance {...{ balance, setBalance }} />}

      {debug && <DebugFloat {...{ float, setFloat }} />}

      <RigidBody
        type="dynamic"
        ref={rigidBodyRef}
        position={[0, 2, 0]}
        collisionGroups={interactionGroups(0, [1])}
        colliders={false}
        restitution={0}
        mass={10}
        angularDamping={1}
        linearDamping={1}
      >
        <CapsuleCollider args={[0.5, 0.25]} rotation={[Math.PI * 0.5, 0, 0]} />
        <Cone rotation={[Math.PI * 0.5, 0, 0]} args={[0.25, 1, 7]}>
          <meshNormalMaterial />
        </Cone>
        <Box args={[.3, .1, .3]} position={[-.5, 0, 0]} ref={engineRightRef}>
          <meshNormalMaterial />
        </Box>
        <Box args={[.3, .1, .3]} position={[.5, 0, 0]} ref={engineLeftRef}>
          <meshNormalMaterial />
        </Box>
        <Line points={[new Vector3(), new Vector3(0, -float.hoverHeight, 0)]}></Line>
      </RigidBody></>
  );
}
