import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { AfterimagePass } from "three/addons/postprocessing/AfterimagePass.js";
import { Perlin, FBM } from 'THREE_Noise';

let dataset = d3.csv("assets/dataset/dataset.csv");

dataset.then(function (data){
let d3id = 421; //slider position

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
mouse //OrbitControls

//SCENE VARIABLES
let particles, //cloud of points
perlin,
pp,
positions, //position of each point
v, //updated position of each point
acc,       //accelleration of each point
a, //updated accelleration of each point
c, //updated color of each point
// curs, //position of cursor
direct = 1,  //updated direction of the point
counter = 0, //updated counter
nOfPoints,
scaleF=1;


//EMOTION CONTROLLER: COLOR AND HB
var params = {
positivo: data[d3id].Stress<20, //true=blu - false=red
battiti: data[d3id].HR,
context: data[d3id].Context,
time:data[d3id].HOUR
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
// scene.fog = new THREE.Fog(0x000000, 340, 400); //here to turn on the fog
//camera
camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
camera.setFocalLength( 50 );
camera.position.set(0, 0, 340);
camera.lookAt(0, 0, 0);
scene.add(camera);
//orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI * 0.5;
controls.minDistance = 200;
controls.maxDistance = 500;
raycaster = new THREE.Raycaster();
mouse = new THREE.Vector2();
window.addEventListener("pointerdown", onPointerDown);
// tail effect
composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
afterimagePass = new AfterimagePass();
afterimagePass.uniforms["damp"] = { value: 0.4 };
composer.addPass(afterimagePass);

//perlin 
perlin = new Perlin(Math.random())

//generate points
let distance = 40; //distance between points
const passoT = 5,
passoP = 3;
nOfPoints = 12960;

positions = new Float32Array(nOfPoints);
acc = new Float32Array(nOfPoints);


//parametrical spread
let i = 0;

for (let phi = 0; phi < 180; phi+= passoP) {
for (let theta = 0; theta < 360; theta+= passoT) {
    
        acc[i]= THREE.Math.randFloatSpread(-20, 20); //vettore di accelerazione random -2 2
        acc[i + 1]= THREE.Math.randFloatSpread(-20, 20);
        acc[i + 2]= THREE.Math.randFloatSpread(-20, 20);

        positions[i]= distance * (Math.cos(theta) * Math.sin(phi)) + (acc[i]/5); //formule sfera
        positions[i + 1]= distance * (Math.sin(theta) * Math.sin(phi)) + (acc[i+1]/5);
        positions[i + 2]= distance * (Math.cos(phi)) + (acc[i+2]/5);
    
        i+=3
    }
}

//random spread
// for (let i = 0; i < nOfPoints; i+=3) {
//     acc[i]= THREE.Math.randFloatSpread(-20, 20); //vettore di accelerazione random -2 2
//     acc[i + 1]= THREE.Math.randFloatSpread(-20, 20);
//     acc[i + 2]= THREE.Math.randFloatSpread(-20, 20);

//     const theta = THREE.Math.randFloatSpread(360);
//     const phi = THREE.Math.randFloatSpread(180);
//     positions[i]= distance * (Math.cos(theta) * Math.sin(phi)); //formule sfera
//     positions[i + 1]= distance * (Math.sin(theta) * Math.sin(phi));
//     positions[i + 2]= distance * (Math.cos(phi));
    
// }



//geometry
let geometryP = new THREE.BufferGeometry(); //crea vettore xyz per ogni punto
geometryP.setAttribute( 
    'position', 
    new THREE.BufferAttribute(
        positions, 
       3 ) );
geometryP.setAttribute(
    "accelleration", //applica attributo accelerazione ai punti
    new THREE.BufferAttribute(
    acc,
3    )
);
//mesh
particles = new THREE.Points( //applica material alle geometryP
    geometryP,
    new THREE.PointsMaterial({
    // color: 0xFFFFFF,
    color: 0xCCCCFF,
    size: 1.2,
    })
);
//Add particles to scene
scene.add(particles);
}

// ITERATING FUNCTION |––––––––––––––––––––––––––––––––––––––––––
function update() {
c = particles.material.color; //vector .r .g .b
//run actions

pulse();
rotation();
color();
scale()

//update render
particles.geometry.attributes.position.needsUpdate = true;
composer.render();

    params.positivo=data[d3id].Stress<50;
    params.battiti=data[d3id].HR;
    params.context= data[d3id].Context;
    params.time= data[d3id].HOUR;

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
// for (let i = 0; i < positions.length; i += 3) {
//     v = new THREE.Vector3( //posizione xyz
//     positions[i],
//     positions[i + 1],
//     positions[i + 2]
//     );
//     a = new THREE.Vector3( //accelerazione xyz
//     acc[i] * (params.battiti / 1800) * direct,
//     acc[i + 1] * (params.battiti / 1800) * direct,
//     acc[i + 2] * (params.battiti / 1800) * direct
//     ); //apply
//     positions[i] = a.x + v.x;
//     positions[i + 1] = a.y + v.y;
//     positions[i + 2] = a.z + v.z
// }





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
    positions[i] = a.x + v.x;
    positions[i + 1] = a.y + v.y;
    positions[i + 2] = a.z + v.z
}
}

let rotF
function rotation() {

if(params.positivo==true)
    { particles.rotation.x += 0.005;
        particles.rotation.y += 0.005;
        particles.rotation.z += 0.005;
    }
    else if(params.positivo==false)
   { particles.rotation.x += 0.01;
    particles.rotation.y += 0.01;
    particles.rotation.z += 0.01;
    }
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


function scale(){
  if(params.positivo==true) {if(scaleF<1)
    { particles.scale.x = scaleF;
     particles.scale.y = scaleF;
     particles.scale.z = scaleF;
     scaleF+=0.01}}
    else if(params.positivo==false) {if(scaleF>0.7)
   { particles.scale.x = scaleF;
    particles.scale.y = scaleF;
    particles.scale.z = scaleF;
    scaleF-=0.01}}
}

// VIEWPORT FUNCTIONS |––––––––––––––––––––––––––––––––––––––––––
// orbit function
function onPointerDown(event) {
// event.preventDefault(); removed becouse it prevents the slider toggle
mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
raycaster.setFromCamera(mouse, camera)
}

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


// SLIDER |––––––––––––––––––––––––––––––––––––––––––
$(document).ready(function () {
    $("#slider").roundSlider({
        svgMode: true,
        value: 421,
        radius: 340,
        circleShape: "half-top",
        sliderType: "min-range",
        showTooltip: true,
        width: 1,
        max: 599,
        step: 1,
        mouseScrollAction: true,
        handleSize: "+30",
        borderWidth:0,
        update: function (args){
            d3id = args.value;
            updMsg = params.context
        },
        tooltipFormat: function (args){
            return data[args.value].HOUR
        }
    });
}
); 
})
