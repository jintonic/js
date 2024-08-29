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
const settingss = { depth: 2*dZ, bevelEnabled: false };
const outerTubeGeo = new THREE.ExtrudeGeometry( pie, settingss ); 
outerTubeGeo.translate(x0,y0,z0-dZ);

const innerTubeGeo = new THREE.CylinderGeometry( rMin, rMin, 2*dZ );
innerTubeGeo.rotateX(Math.PI/2);
innerTubeGeo.translate(x0,y0,z0);

const innerTubeCSG = CSG.fromGeometry(innerTubeGeo);
const outerTubeCSG = CSG.fromGeometry(outerTubeGeo);
const tubeCSG = outerTubeCSG.subtract(innerTubeCSG);
const tube = CSG.toMesh(tubeCSG, new THREE.Matrix4(), mat1);
tube.receiveShadow = true;
tube.position.set(-3,0,0)
scene.add(tube);

const tubeHelper = new THREE.BoxHelper(tube, 0xffff00);
scene.add(tubeHelper);

// Define parameters for the cone (formerly the cylinder)
const pRmaxbottom = 1, pRmintop = 0.5, pDzheight = 2
const outerConeGeo = new THREE.CylinderGeometry(pRmintop, pRmaxbottom,  pDzheight);
const innerConeGeo = new THREE.CylinderGeometry(pRmintop / 1.5, pRmaxbottom / 1.5,  pDzheight);

// Use CSG to create a hollow cone
const outerConeCSG = CSG.fromGeometry(outerConeGeo);
const innerConeCSG = CSG.fromGeometry(innerConeGeo);
const hollowConeCSG = outerConeCSG.subtract(innerConeCSG);

const box1geo= new THREE.BoxGeometry(pRmaxbottom*2,pDzheight,pRmaxbottom*2)
box1geo.translate(0,0,1)

const boxcsg= CSG.fromGeometry(box1geo)
const hollowboxcsg= hollowConeCSG.subtract(boxcsg)

const cone = CSG.toMesh(hollowboxcsg, new THREE.Matrix4(), mat1);
cone.receiveShadow = true;
cone.position.set(0, 0, 3);
scene.add(cone);

const coneHelper = new THREE.BoxHelper(cone, 0xffff00);
scene.add(coneHelper);


// Sphere pie shape
const radius = 1;   
const startPhi = 0;       
const deltaPhi = Math.PI/2;  

// Create the pie shape with a larger radius to cut through the entire sphere
const pie2 = new THREE.Shape();
pie2.absarc(0, 0, radius, startPhi, startPhi+deltaPhi , false);
pie2.lineTo(0, 0);
const settings = { depth: 2*radius, bevelEnabled: false }; //depth is the length of pie
const pieGeometry = new THREE.ExtrudeGeometry(pie2, settings);
pieGeometry.translate(0, 0, 0-radius);


const sphereGeo = new THREE.SphereGeometry(radius);
const innersphereGeo= new THREE.SphereGeometry(radius/1.5);


//Everthing into CSG
const pieCSG = CSG.fromGeometry(pieGeometry);
const sphereCSG = CSG.fromGeometry(sphereGeo);
const innersphereCSG=CSG.fromGeometry(innersphereGeo)
const resultCSG = sphereCSG.intersect(pieCSG); //csg for pie and sphere
const finalcsg=resultCSG.subtract(innersphereCSG)  //csg for innersphere and outersphere

// Convert the result CSG back to a THREE.Mesh
const sphere = CSG.toMesh(finalcsg, new THREE.Matrix4(), mat1);
sphere.rotation.y=Math.PI/2;
sphere.receiveShadow = true;
sphere.position.set(3, 0, 0);

// Add the resulting mesh to the scene
scene.add(sphere);

// Optional: Add a BoxHelper to visualize the boundaries
const sphereHelper = new THREE.BoxHelper(sphere, 0xffff00);
scene.add(sphereHelper);


/// Create the pie shape with a larger radius to cut through the entire sphere
const pieshape = new THREE.Shape();
const pieradius = 2;
const piestartphi = 0;
const piedeltaphi = Math.PI / 2;
pieshape.absarc(0, 0, pieradius, piestartphi, piestartphi + piedeltaphi, false);
pieshape.lineTo(0, 0);

// Increase the extrusion depth to ensure the pie cuts through the sphere
const extrusionsettings = { depth: 2 * pieradius, bevelEnabled: false };
const piegeometry = new THREE.ExtrudeGeometry(pieshape, extrusionsettings);
piegeometry.translate(0, 0, -pieradius);
const rotationmatrix = new THREE.Matrix4();
rotationmatrix.makeRotationFromEuler(new THREE.Euler(Math.PI / 2, Math.PI, 3)); // Rotate 90 degrees around Y and 180 degrees around X
piegeometry.applyMatrix4(rotationmatrix);

//Adding cone using cylinder concept
const conegeometry = new THREE.CylinderGeometry(0.001, pieradius, pieradius);
conegeometry.translate(0, -pieradius/2, 0);
const conerotationmatrix = new THREE.Matrix4();
conerotationmatrix.makeRotationX(Math.PI);
conegeometry.applyMatrix4(conerotationmatrix);

const spheregeometry = new THREE.SphereGeometry(pieradius);
const innerspheregeometry = new THREE.SphereGeometry(pieradius / 1.5);

// Everything into CSG
const piecsg = CSG.fromGeometry(piegeometry);
const spherecsg = CSG.fromGeometry(spheregeometry);
const innerspherecsg = CSG.fromGeometry(innerspheregeometry);
const conecsg = CSG.fromGeometry(conegeometry);

// Creating mesh
const intersectedcsg = spherecsg.intersect(piecsg); // CSG for pie and sphere
const finalmeshcsg = intersectedcsg.subtract(innerspherecsg); // CSG for final result
const lastcsg = finalmeshcsg.intersect(conecsg); // CSG for pie, sphere, and cone

// Convert the result CSG back to a THREE.Mesh
const coneremain = CSG.toMesh(lastcsg, new THREE.Matrix4(), mat1);
coneremain.receiveShadow = true;
coneremain.position.set(0, 0, 0);

// Add the resulting mesh to the scene
scene.add(coneremain);

// Optional: Add a BoxHelper to visualize the boundaries
const coneremainHelper = new THREE.BoxHelper(coneremain, 0xffff00);
scene.add(coneremainHelper);


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
const drag = new DragControls([cube, tube, cone, sphere, coneremain], camera, renderer.domElement);

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
    coneremainHelper.update();
});

// Animation loop
function animate() {
    renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );
