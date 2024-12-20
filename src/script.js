import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as dat from "lil-gui";

/**
 * Base
 */
// Debug GUI
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Models
 */

// Load GLTF Model
const gltfLoader = new GLTFLoader();
gltfLoader.load(
  "public/models/bridges.gltf",
  (gltf) => {
    const model = gltf.scene;
    model.position.set(0, 0, 0); // Adjust position as needed
    model.scale.set(1, 1, 1); // Adjust scale as needed
    scene.add(model);

    // Handle animations if present
    if (gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
      });
    }
  },
  undefined,
  (error) => {
    console.error("An error occurred while loading the model:", error);
  }
);

/**
 * Galaxy Background
 */
const galaxyParameters = {
  rotationSpeed: 0.05,
  starSize: 0.01,
  starColor: 0xffffff,
};

const galaxyGeometry = new THREE.BufferGeometry();
const galaxyMaterial = new THREE.PointsMaterial({
  size: galaxyParameters.starSize,
  sizeAttenuation: true,
  color: new THREE.Color(galaxyParameters.starColor),
});
const galaxyParticles = 5000;
const positions = new Float32Array(galaxyParticles * 3);

for (let i = 0; i < galaxyParticles * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 100; // Spread out galaxy particles
}

galaxyGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);
const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
scene.add(galaxy);

/**
 * Raging Sea
 */
const seaParameters = {
  waveSpeed: 0.5,
  waveAmplitude: 0.5,
  color: "#006994",
};

const seaGeometry = new THREE.PlaneGeometry(70, 80, 128, 128);
const seaMaterial = new THREE.MeshStandardMaterial({
  color: seaParameters.color,
  side: THREE.DoubleSide,
  flatShading: true,
});
const sea = new THREE.Mesh(seaGeometry, seaMaterial);
sea.rotation.x = -Math.PI * 0.5;
scene.add(sea);

// Animate the sea waves
function animateSea(elapsedTime) {
  const vertices = sea.geometry.attributes.position.array;

  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const y = vertices[i + 1];
    vertices[i + 2] =
      Math.sin(elapsedTime * seaParameters.waveSpeed + x * 0.1 + y * 0.1) *
      seaParameters.waveAmplitude; // Create wave effect
  }
  sea.geometry.attributes.position.needsUpdate = true;
}

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const lightParameters = {
  ambientColor: ambientLight.color.getHex(),
  ambientIntensity: ambientLight.intensity,
  directionalColor: directionalLight.color.getHex(),
  directionalIntensity: directionalLight.intensity,
};

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(-8, 4, 8);
scene.add(camera);

const cameraParameters = {
  fov: camera.fov,
};

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 1, 0);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * GUI Controls
 */

// Galaxy GUI
const galaxyFolder = gui.addFolder("Galaxy");
galaxyFolder
  .add(galaxyParameters, "rotationSpeed", 0, 1, 0.01)
  .name("Rotation Speed");
galaxyFolder
  .add(galaxyParameters, "starSize", 0.001, 0.05, 0.001)
  .name("Star Size")
  .onChange((value) => {
    galaxyMaterial.size = value;
    galaxyMaterial.needsUpdate = true;
  });
galaxyFolder
  .addColor(galaxyParameters, "starColor")
  .name("Star Color")
  .onChange((value) => {
    galaxyMaterial.color.set(value);
  });

// Sea GUI
const seaFolder = gui.addFolder("Sea");
seaFolder.add(seaParameters, "waveSpeed", 0.1, 2, 0.1).name("Wave Speed");
seaFolder
  .add(seaParameters, "waveAmplitude", 0.1, 2, 0.1)
  .name("Wave Amplitude");
seaFolder
  .addColor(seaParameters, "color")
  .name("Sea Color")
  .onChange((value) => {
    seaMaterial.color.set(value);
  });

// Lights GUI
const lightsFolder = gui.addFolder("Lights");
lightsFolder
  .addColor(lightParameters, "ambientColor")
  .name("Ambient Light Color")
  .onChange((value) => {
    ambientLight.color.set(value);
  });
lightsFolder
  .add(lightParameters, "ambientIntensity", 0, 2, 0.1)
  .name("Ambient Intensity")
  .onChange((value) => {
    ambientLight.intensity = value;
  });
lightsFolder
  .addColor(lightParameters, "directionalColor")
  .name("Directional Light Color")
  .onChange((value) => {
    directionalLight.color.set(value);
  });
lightsFolder
  .add(lightParameters, "directionalIntensity", 0, 2, 0.1)
  .name("Directional Intensity")
  .onChange((value) => {
    directionalLight.intensity = value;
  });

// Camera GUI
const cameraFolder = gui.addFolder("Camera");
cameraFolder
  .add(cameraParameters, "fov", 30, 120, 1)
  .name("Field of View")
  .onChange((value) => {
    camera.fov = value;
    camera.updateProjectionMatrix();
  });

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Animate sea
  animateSea(elapsedTime);

  // Rotate galaxy
  galaxy.rotation.y += galaxyParameters.rotationSpeed * deltaTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
