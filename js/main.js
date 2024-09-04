// for libraries installed by npm
import * as THREE from 'three';
// for libraries not maintained by npm
import { CSG } from './libs/CSGMesh.js';
// for three.js add-on's in node_modules/three/examples/jsm/
import { MapControls } from 'three/addons/controls/MapControls.js';
import { DragControls } from 'three/addons/controls/DragControls.js';

//Adding box
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xaaaaaa );
var pX=1 ,pY=1,pZ=1;
const geo1 = new THREE.BoxGeometry( pX*2, pY*2, pZ*2 );
const mat1 = new THREE.MeshLambertMaterial( { color: 0x00ab12 } );
const cube = new THREE.Mesh( geo1, mat1 );
cube.receiveShadow = true;
cube.position.set(0, 0, -3);
scene.add( cube );


// use Shape and ExtrudeGeometry to create a solid tube
var pie = new THREE.Shape();
// https://threejs.org/docs/#api/en/extras/core/Path.absarc
var phi0=Math.PI/3; var dPhi=Math.PI/3;
var x0=0, y0=0, z0=0, pRMin=0.5, pRMax=0.5, pDz=1;
pie.absarc(x0, y0, pRMax, phi0, phi0+dPhi, false);
pie.lineTo(0, 0);
// https://threejs.org/docs/#api/en/geometries/ExtrudeGeometry
const settingss = { depth: 2*pDz, bevelEnabled: false };
const outerTubeGeo = new THREE.ExtrudeGeometry( pie, settingss ); 
outerTubeGeo.translate(x0,y0,z0-pDz);

const innerTubeGeo = new THREE.CylinderGeometry( pRMin, pRMin, 2*pDz );
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


// Adding cone
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
cone.rotation.x=Math.PI/2;
scene.add(cone);

const coneHelper = new THREE.BoxHelper(cone, 0xffff00);
scene.add(coneHelper);


// Adding Sphere pie shape
var radius = 1, startPhi = 0,  deltaPhi = Math.PI/2;  

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
// scene.add(sphere);

// Optional: Add a BoxHelper to visualize the boundaries
const sphereHelper = new THREE.BoxHelper(sphere, 0xffff00);
// scene.add(sphereHelper);


/// Create the pie shape with a larger radius to cut through the entire sphere
let pieshape = new THREE.Shape(),  pieradius = 2, piestartphi = 0, piedeltaphi = Math.PI / 2;
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
coneremain.position.set(-3, 0, 3);

// Add the resulting mesh to the scene
// scene.add(coneremain);

// Optional: Add a BoxHelper to visualize the boundaries
const coneremainHelper = new THREE.BoxHelper(coneremain, 0xffff00);
// scene.add(coneremainHelper);

function GetSphere(pRmin, pRmax, pSTheta, pDTheta, pSPhi, pDPhi) {

    const pETheta=pSTheta+pDTheta;  //adding end Theta as it accepts delta phi
    //create sphere geometry
    const sphereGeometry = new THREE.SphereGeometry(pRmax);
    const innerSphereGeometry = new THREE.SphereGeometry(pRmin);

    //Create box geometry for making hemisphere cuts
    const boxGeometry = new THREE.BoxGeometry(pRmax * 2, pRmax, pRmax * 2);
    boxGeometry.rotateX(Math.PI/2);
    boxGeometry.translate(0, 0, pRmax / 2);

    // Create Cone geometries to make a cut
    const cone1Geometry = new THREE.CylinderGeometry(  pRmax * Math.tan(pSTheta), 0.00001,pRmax); //Smaller upper cone
    cone1Geometry.rotateX(Math.PI/2);
    cone1Geometry.translate(0, 0, pRmax / 2);

    const cone2Geometry = new THREE.CylinderGeometry( pRmax * Math.tan(pETheta), 0.0001 , pRmax); //Bigger upper cone
    cone2Geometry.rotateX(Math.PI/2);
    cone2Geometry.translate(0,0 ,pRmax / 2);

    const cone3Geometry = new THREE.CylinderGeometry(0.0001,  pRmax * Math.tan(Math.PI-pSTheta), pRmax); //Smaller lower cone
    cone3Geometry.rotateX(Math.PI/2);
    cone3Geometry.translate(0, 0,-pRmax / 2);

    const cone4Geometry = new THREE.CylinderGeometry(0.0001, pRmax * Math.tan(Math.PI-pETheta), pRmax); //Bigger lower cone
    cone4Geometry.rotateX(Math.PI/2);
    cone4Geometry.translate(0, 0, -pRmax / 2);

    // Create the pie shape 
    const pieShape = new THREE.Shape();
    pieShape.absarc(0, 0, pRmax, pSPhi, pSPhi + pDPhi, false);
    pieShape.lineTo(0, 0);
    const extrusionsettings = { depth: 2 * pRmax, bevelEnabled: false };
    const pieGeometry = new THREE.ExtrudeGeometry(pieShape, extrusionsettings);
    pieGeometry.translate(0, 0, -pRmax);

    // Convert geometries to CSG objects
    const sphereCSG = CSG.fromGeometry(sphereGeometry);  
    const innerSphereCSG = CSG.fromGeometry(innerSphereGeometry);
    const cone1CSG = CSG.fromGeometry(cone1Geometry);
    const cone2CSG = CSG.fromGeometry(cone2Geometry);
    const cone3CSG = CSG.fromGeometry(cone3Geometry);
    const cone4CSG = CSG.fromGeometry(cone4Geometry);
    const boxCSG = CSG.fromGeometry(boxGeometry);
    const pieCSG = CSG.fromGeometry(pieGeometry);

    let resultCSG;
    //get shapes under different conditions
    if ((pSTheta === 0) && (pETheta > 0 && pETheta < Math.PI / 2)) {  
        resultCSG = cone2CSG.intersect(sphereCSG);

    } else if ((pSTheta === 0) && (pETheta === Math.PI / 2)) {
        resultCSG = boxCSG.intersect(sphereCSG);

    } else if ((pSTheta === 0) && (pETheta > Math.PI / 2 && pETheta < Math.PI)) { 
        resultCSG = sphereCSG.subtract(cone4CSG);

    } else if ((pSTheta > 0 && pSTheta < Math.PI / 2) && (pETheta > pSTheta && pETheta < Math.PI / 2)) { 
        var step1CSG = cone2CSG.subtract(cone1CSG);
        resultCSG = step1CSG.intersect(sphereCSG);

    } else if ((pSTheta > 0 && pSTheta < Math.PI / 2) && (pETheta === Math.PI / 2)) { 
        var step1CSG = boxCSG.subtract(cone1CSG);
        resultCSG = step1CSG.intersect(sphereCSG);

    } else if ((pSTheta > 0 && pSTheta < Math.PI / 2) && (pETheta > Math.PI / 2 && pETheta < Math.PI)) { 
        var step1CSG = sphereCSG.subtract(cone1CSG);
        resultCSG = step1CSG.subtract(cone4CSG);

    } else if ((pSTheta > 0 && pSTheta < Math.PI / 2) && (pETheta === Math.PI)) { 
        resultCSG = sphereCSG.subtract(cone1CSG);

    } else if ((pSTheta === Math.PI / 2) && (pETheta > Math.PI / 2 && pETheta < Math.PI)) { 
        var step1CSG = sphereCSG.subtract(boxCSG);
        resultCSG = step1CSG.subtract(cone4CSG);

    } else if ((pSTheta === Math.PI / 2) && (pETheta === Math.PI)) { 
        resultCSG = sphereCSG.subtract(boxCSG);

    } else if ((pSTheta > Math.PI / 2 && pSTheta < Math.PI) && (pETheta > pSTheta && pETheta < Math.PI)) { //test
        step1CSG = cone3CSG.subtract(cone4CSG);
        resultCSG = step1CSG.intersect(sphereCSG);

    } else if ((pSTheta > Math.PI / 2 && pSTheta < Math.PI) && (pETheta === Math.PI)) { 
        resultCSG = sphereCSG.intersect(cone3CSG);
    }

    if (pDPhi<Math.PI*2){                       //make a cut when Phi is less than 360
        resultCSG = resultCSG.intersect(pieCSG);
    }
    if (pRmin>0){
        resultCSG = resultCSG.subtract(innerSphereCSG);
    }
    if (resultCSG) {
        
        const spheree = CSG.toMesh(resultCSG, new THREE.Matrix4(), mat1);
        return spheree;
    }

}

// Call the function and add the resulting mesh to the scene
const Sphere = GetSphere(0, 2, Math.PI/4, Math.PI/1.5 , Math.PI/4, Math.PI/1.5 ); //pRmin, pRmax, pSPhi, pDPhi, pSTheta, pDTheta
scene.add(Sphere);

const SphereHelper = new THREE.BoxHelper(Sphere, 0xffff00);
scene.add(SphereHelper);

// Adding grid and axes helpers
const gridHelper = new THREE.GridHelper( 10, 10 );
scene.add( gridHelper );

// // https://threejs.org/docs/#api/en/helpers/AxesHelper
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
const drag = new DragControls([cube, tube, cone,  Sphere], camera, renderer.domElement);

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
    // sphereHelper.update();
    // coneremainHelper.update();
    SphereHelper.update();
});

// Animation loop
function animate() {
    renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );
