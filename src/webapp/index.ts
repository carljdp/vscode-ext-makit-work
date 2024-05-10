// file: src/webapp/index.ts

import * as THREE from 'three';

// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


console.log('###### Hello from webapp/index.ts ######');


let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

let container: HTMLDivElement;
let camera: THREE.PerspectiveCamera, scene: THREE.Scene, renderer: THREE.WebGLRenderer, cube: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>;
let controls: OrbitControls;
const frustumSize = 600;

let ambientLight: THREE.AmbientLight, directionalLight: THREE.DirectionalLight;

init();
animate();




function addPixelGrid(scene: { add: (arg0: THREE.InstancedMesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.InstancedMeshEventMap>) => void; }, gridSizeX: number, gridSizeY: number, spacing: number) {
    const halfSizeX = gridSizeX / 2;
    const halfSizeY = gridSizeY / 2;

    const pixelGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const pixelMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });

    const count = (gridSizeX / spacing) * (gridSizeY / spacing);
    const pixelMesh = new THREE.InstancedMesh(pixelGeometry, pixelMaterial, count);

    let i = 0;
    const matrix = new THREE.Matrix4();

    for (let x = -halfSizeX; x < halfSizeX; x += spacing) {
        for (let y = -halfSizeY; y < halfSizeY; y += spacing) {
            matrix.makeTranslation(x + spacing / 2, y + spacing / 2, 0);
            pixelMesh.setMatrixAt(i++, matrix);
        }
    }

    scene.add(pixelMesh);
}

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();

    //

    camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 10000);

    camera.position.set(0, 0, 100); // Adjust as needed
    camera.lookAt(scene.position);

    //

    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];

    for (let i = 0; i < 10000; i++) {

        vertices.push(THREE.MathUtils.randFloatSpread(2000)); // x
        vertices.push(THREE.MathUtils.randFloatSpread(2000)); // y
        vertices.push(THREE.MathUtils.randFloatSpread(2000)); // z

    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const particles = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x888888 }));
    scene.add(particles);

    //

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    container.appendChild(renderer.domElement);

    //

    window.addEventListener('resize', onWindowResize);
    document.addEventListener('keydown', onKeyDown);

    // Set up controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableRotate = true; // Disable rotation
    controls.enablePan = true; // Enable panning

    // Add lights
    ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    // Add grid
    // const gridHelper = new THREE.GridHelper(100, 100);
    // scene.add(gridHelper);

    addPixelGrid(scene, 100, 100, 1);

    // // Add wireframe cube
    // const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    // const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    // cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    // scene.add(cube);

    // Add wireframe cube
    const cubeGeometry = new THREE.BoxGeometry(10, 10, 10);
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    scene.add(cube);

}

//

function onKeyDown(event: { keyCode: any; }) {

    switch (event.keyCode) {

        case 79: /*O*/

            break;

        case 80: /*P*/

            break;

    }

}

//

function onWindowResize() {

    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;
    aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

    camera.aspect = aspect;
    camera.updateProjectionMatrix();

}

//

function animate() {

    requestAnimationFrame(animate);

    render();

}


function render() {

    // renderer.setClearColor(0x111111, 1);
    // renderer.setViewport(SCREEN_WIDTH, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.render(scene, camera);

}