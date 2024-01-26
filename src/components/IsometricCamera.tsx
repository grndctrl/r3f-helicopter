import { OrthographicCamera as Camera, useHelper } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
  RefObject,
  forwardRef,
  useImperativeHandle,
  useRef
} from 'react';
import { CameraHelper, Object3D, OrthographicCamera, Vector3 } from 'three';
import { create } from 'zustand';

interface CameraState {
  translation: Vector3;
  setTranslation: (translation: Vector3) => void;
}

export const useCameraStore = create<CameraState>()((set) => ({
  translation: new Vector3(),
  setTranslation: (translation) => set(() => ({ translation })),
}));

type IsometricCameraProps = {
  far?: number;
  near?: number;
  offset?: number;
  zoom?: number;
  makeDefault?: boolean;
  helper?: boolean;
};

export type IsometricCameraRef = RefObject<OrthographicCamera>;

const IsometricCamera = forwardRef<OrthographicCamera, IsometricCameraProps>(
  function IsometricCamera(
    {
      far = 256,
      near = 0,
      offset = 48,
      zoom = 32,
      // makeDefault = false,
      helper = false,
    },
    ref
  ) {
    const cameraRef = useRef<OrthographicCamera>(null!);
    const translation = useCameraStore((state) => state.translation);
    const cameraOffset = new Vector3(offset, offset, offset);
    const cameraOrientationRef = useRef({
      position: cameraOffset.clone(),
      lookAt: new Vector3(),
    });

    useImperativeHandle(ref, () => {
      return cameraRef.current;
    });

    useHelper(
      helper ? (cameraRef as React.MutableRefObject<Object3D>) : null,
      CameraHelper
    );

    useFrame(() => {
      const { current: camera } = cameraRef;
      const { current: cameraOrientation } = cameraOrientationRef;

      if (!camera) return;

      cameraOrientation.position.copy(translation.clone().add(cameraOffset));
      cameraOrientation.lookAt.lerp(translation, 0.05);
      camera.position.lerp(cameraOrientation.position, 0.05);

      camera.lookAt(cameraOrientation.lookAt);
    });

    return (
      <>
        <Camera
          ref={cameraRef}
          far={far}
          near={near}
          zoom={zoom}
          makeDefault
          position={cameraOffset}
          rotation={[Math.atan(-1 / Math.sqrt(2)), Math.PI / 4, 0]}
          onUpdate={(self) => self.updateProjectionMatrix()}
        />
      </>
    );
  }
);

export default IsometricCamera;
