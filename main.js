import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 4; // Adjusted for better visibility

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1); // Set background color to white
document.getElementById('threejs-container').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3.5);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Variables to store objects
let model, frontImage, leftImage, rightImage;

// Load GLTF model
const loader = new GLTFLoader();
loader.load('logo.gltf', (gltf) => {
    model = gltf.scene;
    model.position.set(0, 0, 0);
    model.scale.set(20, 20, 20);
    scene.add(model);

    // Create and position images
    const textureLoader = new THREE.TextureLoader();

    // Front image
    textureLoader.load('assets/image2.jpg', (texture) => {
        frontImage = new THREE.Mesh(
            new THREE.PlaneGeometry(1.3, 1),
            new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })
        );
        frontImage.position.set(0, -0.7, 2); // Position in front of the model and a little below
        scene.add(frontImage);
    });

    // Left back image
    textureLoader.load('assets/image2.jpg', (texture) => {
        leftImage = new THREE.Mesh(
            new THREE.PlaneGeometry(1.3, 1),
            new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })
        );
        leftImage.position.set(-2, 0.5, -1); // Position to the left back of the model
        scene.add(leftImage);
    });

    // Right back image
    textureLoader.load('assets/image2.jpg', (texture) => {
        rightImage = new THREE.Mesh(
            new THREE.PlaneGeometry(1.3, 1),
            new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })
        );
        rightImage.position.set(2, 0.5, -1); // Position to the right back of the model
        scene.add(rightImage);
    });
}, undefined, (error) => {
    console.error('Error loading model.gltf:', error);
});

// Scroll event listener
let scrollPosition = 0;
window.addEventListener('scroll', () => {
    console.log('Scroll event triggered'); // Log statement to verify event

    const newScrollPosition = window.scrollY;
    const delta = newScrollPosition - scrollPosition;
    scrollPosition = newScrollPosition;

    const rotationSpeed = 0.005; // Adjust rotation speed as needed
    const rotationAmount = delta * rotationSpeed;

    if (model) {
        model.rotation.y -= rotationAmount; // Rotate the model around the -y axis
    }

    const radius = 2; // Radius for image revolution around the model
    const angle = model ? model.rotation.y : 0;

    if (frontImage) {
        frontImage.position.set(radius * Math.sin(angle), -0.7, radius * Math.cos(angle));
    }
    if (leftImage) {
        leftImage.position.set(radius * Math.sin(angle + Math.PI * 2 / 3), 0.5, radius * Math.cos(angle + Math.PI * 2 / 3));
    }
    if (rightImage) {
        rightImage.position.set(radius * Math.sin(angle + Math.PI * 4 / 3), 0.5, radius * Math.cos(angle + Math.PI * 4 / 3));
    }
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
