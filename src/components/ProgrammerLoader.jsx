import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";

import Programmer from "./Programmer";

export default function ProgrammerLoader() {
  return (
    <div className="App">
      <Canvas>
        <Suspense fallback={null}>
          <Programmer />
          <Environment preset="sunset" background />
        </Suspense>
      </Canvas>
    </div>
  );
}
