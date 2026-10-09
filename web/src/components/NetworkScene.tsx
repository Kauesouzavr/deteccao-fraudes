"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import * as THREE from "three";

const N_NOS = 90;
const RAIO = 5.6;
const DISTANCIA_CONEXAO = 1.85;
const COR_ACENTO = "#8e97ff";
const COR_ALERTA = "#ff6b7a";

function gerarNos(seed: number) {
  // gerador pseudo-aleatório determinístico (mesmo resultado sempre, sem "hydration mismatch")
  let s = seed;
  function rand() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  }

  const pontos: THREE.Vector3[] = [];
  for (let i = 0; i < N_NOS; i++) {
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(rand() * 2 - 1);
    const r = RAIO * (0.55 + rand() * 0.45);
    pontos.push(
      new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta) * 0.6,
        r * Math.cos(phi)
      )
    );
  }

  const conexoes: [number, number][] = [];
  for (let i = 0; i < pontos.length; i++) {
    for (let j = i + 1; j < pontos.length; j++) {
      if (pontos[i].distanceTo(pontos[j]) < DISTANCIA_CONEXAO) {
        conexoes.push([i, j]);
      }
    }
  }

  const alertas = new Set<number>();
  const nAlertas = Math.max(2, Math.floor(conexoes.length * 0.025));
  for (let i = 0; i < nAlertas; i++) {
    alertas.add(Math.floor(rand() * conexoes.length));
  }

  return { pontos, conexoes, alertas };
}

function Rede(props: ThreeElements["group"]) {
  const grupo = useRef<THREE.Group>(null);
  const { pontos, conexoes, alertas } = useMemo(() => gerarNos(42), []);

  const geometriaLinhas = useMemo(() => {
    const normais: number[] = [];
    const destacadas: number[] = [];
    conexoes.forEach(([i, j], idx) => {
      const alvo = alertas.has(idx) ? destacadas : normais;
      alvo.push(pontos[i].x, pontos[i].y, pontos[i].z, pontos[j].x, pontos[j].y, pontos[j].z);
    });
    const geoNormal = new THREE.BufferGeometry();
    geoNormal.setAttribute("position", new THREE.Float32BufferAttribute(normais, 3));
    const geoDestaque = new THREE.BufferGeometry();
    geoDestaque.setAttribute("position", new THREE.Float32BufferAttribute(destacadas, 3));
    return { geoNormal, geoDestaque };
  }, [pontos, conexoes, alertas]);

  const posicoesNos = useMemo(() => {
    const arr = new Float32Array(pontos.length * 3);
    pontos.forEach((p, i) => {
      arr[i * 3] = p.x;
      arr[i * 3 + 1] = p.y;
      arr[i * 3 + 2] = p.z;
    });
    return arr;
  }, [pontos]);

  const posicoesAlerta = useMemo(() => {
    const idsAlerta = new Set<number>();
    conexoes.forEach(([i, j], idx) => {
      if (alertas.has(idx)) {
        idsAlerta.add(i);
        idsAlerta.add(j);
      }
    });
    const arr: number[] = [];
    idsAlerta.forEach((i) => arr.push(pontos[i].x, pontos[i].y, pontos[i].z));
    return new Float32Array(arr);
  }, [pontos, conexoes, alertas]);

  const reduzMovimento = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useFrame((state, delta) => {
    if (!grupo.current || reduzMovimento) return;
    grupo.current.rotation.y += delta * 0.055;
    grupo.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.08;
  });

  return (
    <group ref={grupo} {...props}>
      <lineSegments geometry={geometriaLinhas.geoNormal}>
        <lineBasicMaterial color={COR_ACENTO} transparent opacity={0.16} />
      </lineSegments>
      <lineSegments geometry={geometriaLinhas.geoDestaque}>
        <lineBasicMaterial color={COR_ALERTA} transparent opacity={0.55} />
      </lineSegments>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[posicoesNos, 3]} />
        </bufferGeometry>
        <pointsMaterial color={COR_ACENTO} size={0.06} transparent opacity={0.85} sizeAttenuation />
      </points>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[posicoesAlerta, 3]} />
        </bufferGeometry>
        <pointsMaterial color={COR_ALERTA} size={0.11} transparent opacity={0.95} sizeAttenuation />
      </points>
    </group>
  );
}

export function NetworkScene() {
  const [pronto, setPronto] = useState(false);
  useEffect(() => setPronto(true), []);

  if (!pronto) return null;

  return (
    <Canvas
      camera={{ position: [0, 0, 9.5], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      className="!absolute !inset-0"
    >
      <Rede />
    </Canvas>
  );
}
