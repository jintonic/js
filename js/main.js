// for libraries installed by npm
import * as THREE from 'three';
// for libraries not maintained by npm
import { CSG } from './libs/CSGMesh.js';
// for three.js add-on's in node_modules/three/examples/jsm/
import { MapControls } from 'three/addons/controls/MapControls.js';
import { DragControls } from 'three/addons/controls/DragControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xaaaaaa );

const geo1 = new THREE.BoxGeometry( 2/2, 1/2, 1/2 );
const mat1 = new THREE.MeshLambertMaterial( { color: 0x00ab12 } );
const cube = new THREE.Mesh( geo1, mat1 );
cube.receiveShadow = true;
cube.position.set(0, 0, -3);
scene.add( cube );


// use Shape and ExtrudeGeometry to create a solid pie
// Creating the tube with CSG (as it was in the original code)
var pie = new THREE.Shape();
// https://threejs.org/docs/#api/en/extras/core/Path.absarc
const phi0=Math.PI/3; const dPhi=Math.PI/3;
const x0=0, y0=0, z0=0, rMin=0.5, rMax=1, dZ=1;
pie.absarc(x0, y0, rMax, phi0, phi0+dPhi, false);
pie.lineTo(0, 0);
// https://threejs.org/docs/#api/en/geometries/ExtrudeGeometry
const settings = { depth: 2*dZ, bevelEnabled: false };
const outerTubeGeo = new THREE.ExtrudeGeometry( pie, settings ); 
outerTubeGeo.translate(x0,y0,z0-dZ);

const innerTubeGeo = new THREE.CylinderGeometry( rMin, rMin, 2*dZ );
innerTubeGeo.rotateX(Math.PI/2);
innerTubeGeo.translate(x0,y0,z0);

const innerTubeCSG = CSG.fromGeometry(innerTubeGeo);
const outerTubeCSG = CSG.fromGeometry(outerTubeGeo);
const tubeCSG = outerTubeCSG.subtract(innerTubeCSG);
const tube = CSG.toMesh(tubeCSG, new THREE.Matrix4(), mat1);
tube.receiveShadow = true;
scene.add(tube);

const tubeHelper = new THREE.BoxHelper(tube, 0xffff00);
scene.add(tubeHelper);

// Define parameters for the cone (formerly the cylinder)
const pRmax1 = 0.8, pRmin2 = 0.3, pDz = 2, openend=false, pSPhi = 0, pDPhi = Math.PI *2
const outerConeGeo = new THREE.CylinderGeometry(pRmin2, pRmax1,  pDz, 60, 1, openend, pSPhi, pDPhi);
const innerConeGeo = new THREE.CylinderGeometry(pRmin2 / 1.5, pRmax1 / 1.5,  pDz, 60, 1, openend, pSPhi, pDPhi);

// Use CSG to create a hollow cone
const outerConeCSG = CSG.fromGeometry(outerConeGeo);
const innerConeCSG = CSG.fromGeometry(innerConeGeo);
const hollowConeCSG = outerConeCSG.subtract(innerConeCSG);

const cone = CSG.toMesh(hollowConeCSG, new THREE.Matrix4(), mat1);
cone.receiveShadow = true;
cone.position.set(0, 0, 3);
scene.add(cone);

const coneHelper = new THREE.BoxHelper(cone, 0xffff00);
scene.add(coneHelper);

// Create the sphere geometry
// Define parameters
const innerRadius = 0.5;  
const outerRadius = 1;   
const startPhi = 0;       
const deltaPhi = Math.PI*2;  
const startTheta = 0;      
const deltaTheta = Math.PI*2; 
const radius = (innerRadius + outerRadius) / 2; 
const segmentsWidth = 32;
const segmentsHeight = 32;

// Create the sphere geometry with the desired segment parameters
const sphereGeo = new THREE.SphereGeometry(radius, segmentsWidth, segmentsHeight, startPhi, deltaPhi, startTheta, deltaTheta);

// Create a box that will cut the sphere segment if needed
const boxGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5); // Adjust dimensions as needed
boxGeo.translate(0.5, 0.5, 0); // Translate the box to overlap with the lower part of the sphere segment if necessary

// Convert geometries to CSG
const sphereCSG = CSG.fromGeometry(sphereGeo);
const boxCSG = CSG.fromGeometry(boxGeo);

// Subtract the box from the sphere to create a hemisphere if needed
const resultCSG = sphereCSG.subtract(boxCSG);

// Convert the result CSG back to a THREE.Mesh
const sphere = CSG.toMesh(resultCSG, new THREE.Matrix4(), mat1);
sphere.receiveShadow = true;
sphere.position.set(3, 0, 0);

// Add the resulting mesh to the scene
scene.add(sphere);

// Optional: Add a BoxHelper to visualize the boundaries
const sphereHelper = new THREE.BoxHelper(sphere, 0xffff00);
scene.add(sphereHelper);

// Adding grid and axes helpers
const gridHelper = new THREE.GridHelper( 10, 10 );
scene.add( gridHelper );

// https://threejs.org/docs/#api/en/helpers/AxesHelper
const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

// Setting up the camera
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight );
camera.position.x = 5;
camera.position.y = 5;
camera.position.z = 5;

// https://threejs.org/examples/#misc_controls_drag
const light = new THREE.SpotLight( 0xffffff, 5 ); // intensity cannot be too bright
light.position.set( 5, 10, 20 ); // avoid same x, y, z numbers
light.castShadow = true;
light.decay = 0; // no decay
scene.add( light );

// Setting up the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true; // needed to show shadow
document.body.appendChild( renderer.domElement );

// Setting up the MapControls and DragControls
// https://discourse.threejs.org/t/control-camera-using-mouse-click-and-drag/39612
// https://threejs.org/docs/#examples/en/controls/MapControls
let controls = new MapControls(camera, renderer.domElement);
controls.enablePan = true; // Allow panning
controls.enableRotate = true; // Disable camera rotation
controls.enableZoom = true; // Allow zooming

// https://threejs.org/docs/#examples/en/controls/DragControls
const drag = new DragControls([cube, tube, cone, sphere], camera, renderer.domElement);

// Disable MapControls while dragging objects
drag.addEventListener('dragstart', function () {
    controls.enabled = false;
});

// Enable MapControls after dragging objects
drag.addEventListener('dragend', function () {
    controls.enabled = true;
});

// Update BoxHelpers on drag
drag.addEventListener('drag', function () {

    tubeHelper.update();
    coneHelper.update();
    sphereHelper.update();
});

// Animation loop
function animate() {
    renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );
