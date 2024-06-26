import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x71A274, 1); // Set background color to greenish
document.body.appendChild(renderer.domElement);

camera.position.z = 4.5;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3.5);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

const loader = new GLTFLoader();
let logo;
loader.load('logo.gltf', (gltf) => {
    logo = gltf.scene;
    logo.position.set(0, 0, 0);
    adjustLogoScale();
    scene.add(logo);
}, undefined, (error) => {
    console.error(error);
});

const images = [];
const imageCount = 8; // Number of images in the carousel

function getResponsiveRadius() {
    return Math.max(2, Math.min((window.innerWidth / 1800) * 3)); // Decrease radius as screen width decreases, minimum radius of 1.5
}

function getResponsiveImageSize() {
    const baseWidth = 1.4;
    const baseHeight = 1.1;
    const scaleFactor = Math.min(window.innerWidth / 200, window.innerHeight / 700);
    return {
        width: baseWidth * scaleFactor,
        height: baseHeight * scaleFactor,
    };
}

function adjustLogoScale() {
    const scaleFactor = Math.min(window.innerWidth , window.innerHeight / 500);
    if (logo) {
        logo.scale.set(scaleFactor * 30, scaleFactor * 30, scaleFactor * 30);
    }
}

function createCarousel() {
    const radius = getResponsiveRadius();
    images.forEach(mesh => scene.remove(mesh)); // Remove existing images
    images.length = 0; // Clear the array

    for (let i = 0; i < imageCount; i++) {
        const texture = new THREE.TextureLoader().load(`assets/image2.jpg`);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const { width, height } = getResponsiveImageSize();
        const geometry = new THREE.PlaneGeometry(width, height);
        const mesh = new THREE.Mesh(geometry, material);

        const angle = (i / imageCount) * Math.PI * 2;
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        const y = -0.5 * Math.sin(angle); // Tilted axis

        mesh.position.set(x, y, z);
        mesh.material.transparent = true;
        mesh.material.opacity = 0; // Initially invisible
        images.push(mesh);
        scene.add(mesh);
    }
}

function adjustImageProperties(image, transitionFactor) {
    // Apply opacity smoothly
    const opacityFactor = 1.3 * transitionFactor;
    image.material.opacity = opacityFactor;
    image.material.transparent = true; // Ensure transparency is enabled
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    adjustLogoScale();
    createCarousel();
}

window.addEventListener('resize', onWindowResize);

function animate() {
    requestAnimationFrame(animate);

    const rotationSpeed = scrollFactor; // Adjust speed as needed

    // Rotate the logo
    if (logo) {
        logo.rotation.y = -(rotationSpeed * Math.PI * 3);
    }

    // Rotate the carousel
    const radius = getResponsiveRadius();
    for (let i = imageCount - 1; i >= 0; i--) {
        const image = images[i];
        const angle = (scrollFactor + i * (1 / imageCount)) * Math.PI * 2;
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        const y = -0.7 * Math.sin(angle); // Tilted axis

        image.position.set(x, y, z);

        // Calculate visibility based on scroll factor
        const startAppear = (imageCount - 1 - i) / imageCount; // When the image starts to appear
        const endAppear = (imageCount - i - 0.5) / imageCount; // When the image is fully visible
        const transitionFactor = Math.max(0, Math.min(1, (scrollFactor - startAppear) / (endAppear - startAppear)));

        // Calculate visibility based on angle
        const cameraAngle = Math.atan2(y, z - 1);
        const angleFactor = 1 - Math.abs(cameraAngle / (Math.PI / 2));

        // Combine both factors
        const finalTransitionFactor = transitionFactor * angleFactor;

        adjustImageProperties(image, finalTransitionFactor);
    }

    renderer.render(scene, camera);
}

let scrollFactor = 0;
window.addEventListener('scroll', () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollFactor = window.scrollY / maxScroll;
});

createCarousel();
animate();