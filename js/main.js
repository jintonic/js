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
cube.position.set(0, 0, 2);
scene.add( cube );

// use Shape and ExtrudeGeometry to create a solid pie
var pie = new THREE.Shape();
// https://threejs.org/docs/#api/en/extras/core/Path.absarc
const phi0=Math.PI/3; const dPhi=Math.PI/3;
const x0=0, y0=0, z0=0, rMin=0.5, rMax=1, dZ=2;
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

const gridHelper = new THREE.GridHelper( 10, 10 );
scene.add( gridHelper );

// https://threejs.org/docs/#api/en/helpers/AxesHelper
const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

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

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true; // needed to show shadow
document.body.appendChild( renderer.domElement );

// https://discourse.threejs.org/t/control-camera-using-mouse-click-and-drag/39612
// https://threejs.org/docs/#examples/en/controls/MapControls
let controls = new MapControls( camera, renderer.domElement );
// https://threejs.org/docs/#examples/en/controls/DragControls
const drag = new DragControls( [cube, tube], camera, renderer.domElement );

function animate() {
  renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );
