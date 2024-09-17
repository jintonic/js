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
cube.position.set(-3, 0, -3);
scene.add( cube );


// use Shape and ExtrudeGeometry to create a solid tube
var pie = new THREE.Shape();
// https://threejs.org/docs/#api/en/extras/core/Path.absarc
var phi0=Math.PI/3; var dPhi=Math.PI/3;
var x0=0, y0=0, z0=0, pRMin=0.5, pRMax=1, pDz=1;
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
cone.position.set(3, 0, -3);
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
Sphere.position.set(-5,0,5)
scene.add(Sphere);

const SphereHelper = new THREE.BoxHelper(Sphere, 0xffff00);
scene.add(SphereHelper);

//Create Torus
function GetTorus(pRmin, pRmax, pRtor, pSPhi, pDPhi) {

    const OuterTorusGeometry = new THREE.TorusGeometry(pRtor, pRmax);
    const innerTorusGeometry = new THREE.TorusGeometry(pRtor, pRmin);

    const pieShape = new THREE.Shape();
    pieShape.absarc(0, 0, pRtor + pRmax+0.1, pSPhi, pSPhi + pDPhi, false);
    pieShape.lineTo(0, 0);
    const extrusionsettings = { depth: pRmax * 2, bevelEnabled: false };
    const pieGeometry = new THREE.ExtrudeGeometry(pieShape, extrusionsettings);
    pieGeometry.translate(0, 0, -pRmax);

    // Convert geometries to CSG objects
    const OuterTorusCSG = CSG.fromGeometry(OuterTorusGeometry);
    const innerTorusCSG = CSG.fromGeometry(innerTorusGeometry);
    const pieCSG = CSG.fromGeometry(pieGeometry);

    let resultCSG = OuterTorusCSG;

    // If a partial cut is needed (not a full circle)
    if (pSPhi + pDPhi < Math.PI * 2) {
        resultCSG = resultCSG.intersect(pieCSG); 
    }
    resultCSG = resultCSG.subtract(innerTorusCSG);

    // Convert CSG back to a mesh
    const Torus = CSG.toMesh(resultCSG, new THREE.Matrix4(), mat1); 
    // Torus.rotateX(Math.PI/2)   
    return Torus;
}

const Torus = GetTorus(0.25, 0.75, 1.5, 0, Math.PI*1.67 );  //pRmin, pRmax, pRtor, pSPhi, pDPhi
Torus.position.set(5,0,5)
scene.add(Torus)

//Addidng Torus Helper
const TorusHelper = new THREE.BoxHelper(Torus, 0xffff00);
scene.add(TorusHelper);


// Create an tube with elliptical cross section
function createEllipseMesh( xSemiAxis, ySemiAxis, Dz) {
    const material = new THREE.MeshLambertMaterial({ color: 0x00ab12});
    const ellipseShape = new THREE.Shape();
    ellipseShape.ellipse(0, 0,  xSemiAxis, ySemiAxis, 0, Math.PI * 2); // Full ellipse

    // Define extrude settings
    const extrudeSettings = { depth: Dz, bevelEnabled: false,curveSegments: 200};
    const geometry = new THREE.ExtrudeGeometry(ellipseShape, extrudeSettings);

    const ellipseMesh = new THREE.Mesh(geometry, material);
    return ellipseMesh;
}

// Example usage:
const Ellipse = createEllipseMesh(2, 1, 4); // xRadius, yRadius, depth
Ellipse.position.set(4,0,0)
scene.add(Ellipse);
 
//Adding Elliptical Tube Helper
const EllipticalTubeHelper= new THREE.BoxHelper(Ellipse,0xffff00);
scene.add(EllipticalTubeHelper);


//Create Trapezooid
function createTrapezoid(dx1, dx2, dy1, dy2, dz) {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshLambertMaterial( { color: 0x00ab12,side: THREE.DoubleSide, wireframe:false  } );

    // Define vertices for the trapezoid (top smaller, bottom larger)
    const vertices = new Float32Array([
        // Bottom face (larger rectangle)
        -dx1, -dy1, -dz,   // Bottom left
         dx1, -dy1, -dz,   // Bottom right
         dx1,  dy1, -dz,   // Top right (bottom face)
        -dx1,  dy1, -dz,   // Top left (bottom face)

        // Top face (smaller rectangle)
        -dx2, -dy2, dz,    // Bottom left (top face)
         dx2, -dy2, dz,    // Bottom right (top face)
         dx2,  dy2, dz,    // Top right (top face)
        -dx2,  dy2, dz     // Top left (top face)
    ]);

    // Define indices to form triangles (two triangles per face)
    const indices = [
        // Bottom face
        0, 1, 2,  0, 2, 3,

        // Top face
        4, 5, 6,  4, 6, 7,

        // Side faces
        0, 1, 5,  0, 5, 4, // Side 1
        1, 2, 6,  1, 6, 5, // Side 2
        2, 3, 7,  2, 7, 6, // Side 3
        3, 0, 4,  3, 4, 7  // Side 4
    ];

    // Set the position and index attributes
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();   // Compute the normals for proper lighting calculations
    // Create the mesh
    const trapezoidMesh = new THREE.Mesh(geometry, material);

    trapezoidMesh.rotation.x = -Math.PI / 2; 
    return trapezoidMesh;
}
const Trapezoid = createTrapezoid(2, 0.5, 2, 0.5, 2);  // dx1, dx2, dy1, dy2, dz
Trapezoid.position.set(0,0,-6);
scene.add(Trapezoid);

const TrapezoidHelper=new THREE.BoxHelper(Trapezoid,0xffff00);
scene.add(TrapezoidHelper);


//Create Tetrahedron
function CreateTetrahedron(anchor, p2, p3, p4, degeneracyFlag = 0) {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshLambertMaterial({ color: 0x00ab12, side: THREE.DoubleSide, wireframe: false }); 
    let vertices;

    // Check degeneracy based on the flag
    if (degeneracyFlag === 0) {
        // No degeneracy - regular solid tetrahedron
        vertices = new Float32Array([
            ...anchor, // Vertex 0 (anchor)
            ...p2,     // Vertex 1 (p2)
            ...p3,     // Vertex 2 (p3)
            ...p4      // Vertex 3 (p4)
        ]);
    } else if (degeneracyFlag === 1) {
        // Planar degeneracy - collapse into a 2D plane
        vertices = new Float32Array([
            ...anchor, // Vertex 0 (anchor)
            ...p2,     // Vertex 1 (p2)
            ...p3,     // Vertex 2 (p3)
            ...anchor  // Collapse p4 onto the anchor point
        ]);
    } else if (degeneracyFlag === 2) {
        // Line degeneracy - collapse points into a line
        vertices = new Float32Array([
            ...anchor, // Vertex 0 (anchor)
            ...p2,     // Collapse p2 into anchor
            ...anchor, // Collapse p3 into anchor
            ...p2      // Vertex 3 (p2)
        ]);
    } else if (degeneracyFlag === 3) {
        // Point degeneracy - all points collapse into one point
        vertices = new Float32Array([
            ...anchor, // Vertex 0 (anchor)
            ...anchor, // All other points collapse into the anchor point
            ...anchor,
            ...anchor
        ]);
    } else {
        alert("Unknown degeneracy flag, it ranges from 0 to 3, 0 for normal");
        return;
    }

    // Define faces (triangles) for the solid tetrahedron
    const indices = [
        0, 1, 2, // First face (Anchor, p2, p3)
        0, 1, 3, // Second face (Anchor, p2, p4)
        0, 2, 3, // Third face (Anchor, p3, p4)
        1, 2, 3  // Base face (p2, p3, p4)
    ];

    // Set position attribute
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices); // Add indices to form triangular faces
    geometry.computeVertexNormals(); // compute normals for proper shading and lighting

    const tetrahedronMesh = new THREE.Mesh(geometry, material);
    return tetrahedronMesh;
}

const Tetrahedron = CreateTetrahedron(
    [0, 0, 0], // anchor
    [3, 1, 0], // p2
    [2,  3, 1], // p3
    [2, 2, 2], // p4
    0 // degeneracyFlag
);
Tetrahedron.position.set(6,0,-6);
scene.add(Tetrahedron);

const TetrahedronHelper=new THREE.BoxHelper(Tetrahedron,0xffff00); //Box helper for Tetrahedron
scene.add(TetrahedronHelper);

// Adding grid and axes helpers
const gridHelper = new THREE.GridHelper( 20, 20 );
scene.add( gridHelper );

// // https://threejs.org/docs/#api/en/helpers/AxesHelper
const axesHelper = new THREE.AxesHelper( 10 );
scene.add( axesHelper );

// Setting up the camera
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight );
camera.position.x = 10;
camera.position.y = 10;
camera.position.z = 10;

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
const drag = new DragControls([cube, tube, cone,  Sphere, Torus, Ellipse, Trapezoid,Tetrahedron], camera, renderer.domElement);

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
    TorusHelper.update();
    EllipticalTubeHelper.update();
    TrapezoidHelper.update();
    TetrahedronHelper.update();
});

// Animation loop
function animate() {
    renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );
