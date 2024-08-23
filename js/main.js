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

// Creating the hollow cylinder using CSG
const cyr1 = 0.8, cyr2 = 0.3, cyh = 2, cysegm = 60;
const outerCylinderGeo = new THREE.CylinderGeometry(cyr1, cyr2, cyh, cysegm);
const innerCylinderGeo = new THREE.CylinderGeometry(cyr1 / 1.5, cyr2 / 1.5, cyh, cysegm);

// Use CSG to create a hollow cylinder
const outerCylinderCSG = CSG.fromGeometry(outerCylinderGeo);
const innerCylinderCSG = CSG.fromGeometry(innerCylinderGeo);
const hollowCylinderCSG = outerCylinderCSG.subtract(innerCylinderCSG);

const cylinder = CSG.toMesh(hollowCylinderCSG, new THREE.Matrix4(), mat1);
cylinder.receiveShadow = true;
cylinder.position.set(0, 0, 3);
scene.add(cylinder);

const cylinderHelper = new THREE.BoxHelper(cylinder, 0xffff00);
scene.add(cylinderHelper);

// Create the sphere geometry
const sr1 = 1, sr2 = 32, sr3 = 32;
const bigsphereGeo = new THREE.SphereGeometry(sr1, sr2, sr3);

// Create a box that will cut the sphere in half
const boxGeo = new THREE.BoxGeometry(2, 2, 1); // The height (Z-dimension) is set to 1 to create a hemisphere
boxGeo.translate(0, 0, 0.5); // Translate the box to overlap with the lower half of the sphere

// Convert geometries to CSG
const sphereCSG = CSG.fromGeometry(bigsphereGeo);
const boxCSG = CSG.fromGeometry(boxGeo);

// Subtract the box from the sphere to create a hemisphere
const resultCSG = sphereCSG.subtract(boxCSG);

// Convert the result CSG back to a THREE.Mesh
const hemisphere = CSG.toMesh(resultCSG, new THREE.Matrix4(), mat1);
hemisphere.receiveShadow = true;
hemisphere.position.set(3, 0, 0);

// Add the resulting mesh to the scene
scene.add(hemisphere);

// Optional: Add a BoxHelper to visualize the boundaries
const hemisphereHelper = new THREE.BoxHelper(hemisphere, 0xffff00);
scene.add(hemisphereHelper);

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
const drag = new DragControls([cube, tube, cylinder, hemisphere], camera, renderer.domElement);

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
    cylinderHelper.update();
    hemisphereHelper.update();
});

// Animation loop
function animate() {
    renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );
