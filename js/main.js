// for libraries installed by npm
import * as THREE from 'three';
// for libraries not maintained by npm
import { CSG } from './libs/CSGMesh.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geo1 = new THREE.BoxGeometry( 1, 1, 1 );
const mat1 = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
mat1.wireframe = true;
const cube = new THREE.Mesh( geo1, mat1 );
scene.add( cube );
cube.position.set(1, 1, 1);

const geo2 = new THREE.CylinderGeometry(1,1,1,32,1,false,0, Math.PI); 
const mat2 = new THREE.MeshBasicMaterial( {color: 0xffff00} ); 
const cylinder = new THREE.Mesh( geo2, mat2 );
const aCSG = CSG.fromMesh(cylinder);
const tube = CSG.toMesh(aCSG, new THREE.Matrix4());
tube.material.side = THREE.DoubleSide;
tube.material.wireframe = true;
scene.add(tube);

camera.position.z = 5;

function animate() {
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
	tube.rotation.x += 0.01;
	tube.rotation.y += 0.01;
	renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );