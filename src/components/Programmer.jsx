import React, { useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";

export function Model(props) {
  const group = useRef();
  const { nodes, materials, animations } = useGLTF("/programmer.glb");
  const { actions } = useAnimations(animations, group);
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="Armature003">
          <group name="1">
            <skinnedMesh
              name="Cube006"
              geometry={nodes.Cube006.geometry}
              material={materials["1_shirt"]}
              skeleton={nodes.Cube006.skeleton}
            />
            <skinnedMesh
              name="Cube006_1"
              geometry={nodes.Cube006_1.geometry}
              material={materials["1_vest"]}
              skeleton={nodes.Cube006_1.skeleton}
            />
            <skinnedMesh
              name="Cube006_2"
              geometry={nodes.Cube006_2.geometry}
              material={materials.shared_generic}
              skeleton={nodes.Cube006_2.skeleton}
            />
            <skinnedMesh
              name="Cube006_3"
              geometry={nodes.Cube006_3.geometry}
              material={materials.shared_skin}
              skeleton={nodes.Cube006_3.skeleton}
            />
            <skinnedMesh
              name="Cube006_4"
              geometry={nodes.Cube006_4.geometry}
              material={materials["1_pants"]}
              skeleton={nodes.Cube006_4.skeleton}
            />
            <skinnedMesh
              name="Cube006_5"
              geometry={nodes.Cube006_5.geometry}
              material={materials["1_shoes"]}
              skeleton={nodes.Cube006_5.skeleton}
            />
            <skinnedMesh
              name="Cube006_6"
              geometry={nodes.Cube006_6.geometry}
              material={materials["1_bowtie"]}
              skeleton={nodes.Cube006_6.skeleton}
            />
            <skinnedMesh
              name="Cube006_7"
              geometry={nodes.Cube006_7.geometry}
              material={materials.shared_hair_brown}
              skeleton={nodes.Cube006_7.skeleton}
            />
            <skinnedMesh
              name="Cube006_8"
              geometry={nodes.Cube006_8.geometry}
              material={materials.shared_eye_black}
              skeleton={nodes.Cube006_8.skeleton}
            />
            <skinnedMesh
              name="Cube006_9"
              geometry={nodes.Cube006_9.geometry}
              material={materials.shared_eye_white}
              skeleton={nodes.Cube006_9.skeleton}
            />
          </group>
          <primitive object={nodes.root} />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/programmer.glb");
