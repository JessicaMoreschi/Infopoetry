import * as THREE from "three";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { AfterimagePass } from "three/addons/postprocessing/AfterimagePass.js";

//VIEWPORT AND CAMERA SETTING
let WIDTH = window.innerWidth,
HEIGHT = window.innerHeight,
ASPECT = WIDTH / HEIGHT,
VIEW_ANGLE = 50,
NEAR = 0.1,
FAR = 1000;

//THREE.JS REQUIRED VARIABLES
let container,
renderer,
camera,
scene,
composer, //tail effect
afterimagePass, //tail effect
raycaster, //OrbitControls
mouse; //OrbitControls

//SCENE VARIABLES
let particles, //cloud of points
positions, //position of each point
v, //updated position of each point
acc,       //accelleration of each point
a, //updated accelleration of each point
c, //updated color of each point
// curs, //position of cursor
direct = 1,  //updated direction of the point
counter = 0; //updated counter

//EMOTION CONTROLLER: COLOR AND HB
var params = {
positivo: true, //true=blu - false=red
battiti: 60,
// theta2: -Math.PI/2
};

//SETUP |––––––––––––––––––––––––––––––––––––––––––
function init() {
//div element that will hold renderer
container = document.getElementById('canvas')

//renderer
renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0x000000);
renderer.setSize(WIDTH, HEIGHT);
container.appendChild(renderer.domElement);
//scene
scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 1, 10000);
//camera
camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
camera.setFocalLength( 50 );
camera.position.set(0, 0, 500);
camera.lookAt(0, 0, 0);
scene.add(camera);
//gui
const gui = new dat.GUI();
const um = gui.addFolder("umore");
um.add(params, "positivo").name("positivo");
const hr = gui.addFolder("hr");
hr.add(params, "battiti", 40, 180).name("hrv");
//orbit controls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.maxPolarAngle = Math.PI * 0.5;
// controls.minDistance = 200;
// controls.maxDistance = 500;
// raycaster = new THREE.Raycaster();
// mouse = new THREE.Vector2();
// window.addEventListener("pointerdown", onPointerDown);
// tail effect
composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
afterimagePass = new AfterimagePass();
afterimagePass.uniforms["damp"] = { value: 0.7 };
composer.addPass(afterimagePass);

//generate points
let distance = 50; //distance between points
const nOfPoints = 3000;
const points = [];
const accelleration = [];
for (let i = 0; i < nOfPoints; i++) {
    let theta = THREE.Math.randFloatSpread(360); //random n 0-360
    let phi = THREE.Math.randFloatSpread(360); //random n 0-360
    points.push(
    new THREE.Vector3(
        distance * Math.sin(theta) * Math.cos(phi), //formule sfera
        distance * Math.sin(theta) * Math.sin(phi),
        distance * Math.cos(theta)
    )
    );
    accelleration.push(
    new THREE.Vector3(
        THREE.Math.randFloatSpread(-20, 20), //vettore di accelerazione random -2 2
        THREE.Math.randFloatSpread(-20, 20),
        THREE.Math.randFloatSpread(-20, 20)
    )
    );
}


//geometry
let geometryP = new THREE.BufferGeometry().setFromPoints(points); //crea vettore xyz per ogni punto
let geometryA = new THREE.BufferGeometry().setFromPoints(accelleration); //crea vettore accel xyz per ogni punto
geometryP.setAttribute(
    "accelleration", //applica attributo accelerazione ai punti
    new THREE.BufferAttribute(
    geometryA.attributes.position.array,
    geometryA.attributes.position.array.length
    )
);
//mesh
particles = new THREE.Points( //applica material alle geometryP
    geometryP,
    new THREE.PointsMaterial({
    color: 0xCCCCFF,
    size: 1,
    })
);
//Add particles to scene
scene.add(particles);
}

// ITERATING FUNCTION |––––––––––––––––––––––––––––––––––––––––––
function update() {
//get positions, accelerations, color for each point
positions = particles.geometry.attributes.position.array; //array [i]=x [i+1]=y [i+2]=z
acc = particles.geometry.attributes.accelleration.array;  //array [i]=x [i+1]=y [i+2]=z
c = particles.material.color; //vector .r .g .b
//run actions
pulse(positions, acc, c);
rotation();
color();

//update render
particles.geometry.attributes.position.needsUpdate = true;
composer.render();
requestAnimationFrame(update); //to iterate
}

// MOVEMENTS FUNCTIONS |––––––––––––––––––––––––––––––––––––––––––
function pulse() {
//set hr timing
if (counter * 2 < (60 / params.battiti) * 60) { 
    counter++;
} else {
    direct = -direct;
    counter = 0;
}
//update distance and velocity
for (let i = 0; i < positions.length; i += 3) {
    v = new THREE.Vector3( //posizione xyz
    positions[i],
    positions[i + 1],
    positions[i + 2]
    );
    a = new THREE.Vector3( //accelerazione xyz
    acc[i] * (params.battiti / 1800) * direct,
    acc[i + 1] * (params.battiti / 1800) * direct,
    acc[i + 2] * (params.battiti / 1800) * direct
    ); //apply
    
    if (params.positivo == true) {
        positions[i] = a.x + v.x;
        positions[i + 1] = a.y + v.y;
        positions[i + 2] = a.z + v.z
    } else  if (params.positivo == false) {
        positions[i] = a.x + v.x;
        positions[i + 1] = a.y + v.y;
        positions[i + 2] = a.z + v.z
    }
}
}

function rotation() {
particles.rotation.x += 0.005;
particles.rotation.y += 0.005;
particles.rotation.z += 0.005;
}
function color() { //shade to blu
if (params.positivo == true) {
    if (c.r > 0.8 && c.r <= 2) {c.r -= 0.01;} //0.8
    if (c.g > -1 && c.g < 0.8) {c.g += 0.01;} //0.8
    if (c.b > -1 && c.b < 1) {c.b += 0.01;} //1
}  //shade to red
else if (params.positivo == false) {
    if (c.r > -1 && c.r < 1) {c.r += 0.01;} //1
    if (c.g > 0.3 && c.g <= 2) {c.g -= 0.01;} //0.4
    if (c.b > 0.5 && c.b <= 2) {c.b -= 0.01;} //0.5
}
}

// VIEWPORT FUNCTIONS |––––––––––––––––––––––––––––––––––––––––––
//orbit function
// function onPointerDown(event) {
// event.preventDefault();
// mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
// mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
// raycaster.setFromCamera(mouse, camera)
// }

//window resize
window.onresize = function () {
WIDTH = window.innerWidth;
HEIGHT = window.innerHeight;
camera.aspect = ASPECT;
camera.updateProjectionMatrix();
composer.render();
};

//run setup and iterate functions
init();
update();



