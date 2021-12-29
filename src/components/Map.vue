<script setup lang="ts">
import { Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera, PlaneGeometry, Raycaster, Scene, SphereGeometry, TextureLoader, Vector2, WebGLRenderer } from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { onMounted, onUnmounted, ref, Ref } from 'vue';

import mapImage from '../assets/textures/map-1.jpg';
import { Map } from '../classes/map';
import { World } from '../classes/world';

const canvasElm: Ref<HTMLCanvasElement | undefined> = ref();

let mouseHolding = false;
const mousePosition = new Vector2();
const mouseHoldPosition = new Vector2();

const world = new World();

onMounted(() => {
  if (canvasElm.value instanceof HTMLCanvasElement) {
    const canvasBounds = canvasElm.value.getBoundingClientRect();

    world.setCanvas(canvasElm.value);
    world.setup();

    // renderer = new WebGLRenderer({ canvas: canvasElm.value, antialias: true });
    // renderer.setPixelRatio( window.devicePixelRatio );
    // renderer.setSize( window.innerWidth, window.innerHeight );
    // // renderer.setSize( canvasBounds.width, canvasBounds.height );

    // const raycaster = new Raycaster();
    // renderer.setAnimationLoop(() => {
    //   // cameraRoot.position.x = mousePosition.x * -200;
    //   // cameraRoot.position.y = mousePosition.y * -200;

    //   raycaster.setFromCamera(mousePosition, camera);
    //   const intersection = raycaster.intersectObject(mapObject)[0];

    //   if (intersection !== undefined) {
    //     cursorMesh.position.x = intersection.point.x;
    //     cursorMesh.position.y = intersection.point.y;
    //     cursorMesh.position.z = intersection.point.z;
    //   }

    //   renderer.render( scene, camera );
    // });
  }
});

const onMouseDown = (event: any) => {
  mouseHolding = true;

  mouseHoldPosition.x = mousePosition.x;
  mouseHoldPosition.y = mousePosition.y;
};

const onMouseMove = (event: any) => {
  mousePosition.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mousePosition.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
};

const onMouseUp = (event: any) => {
  mouseHolding = false;
};

onUnmounted(() => {
  world?.dispose();
});
</script>

<template>
  <canvas
    ref="canvasElm"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
  />
</template>

<style scoped>
  canvas {
    position: fixed;
    top: 0;
    left: 0;
  }
</style>
