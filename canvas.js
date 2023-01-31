import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { AfterimagePass } from "three/addons/postprocessing/AfterimagePass.js";
import { Perlin, FBM } from 'THREE_Noise';

let dataset = d3.csv("assets/dataset/dataset.csv");

dataset.then(function (data) {
    let d3id = 0; //slider position

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
        mouse, //OrbitControls
        tutorial=true


let clock = new THREE.Clock();
let delta = 0;
let interval = 1 / 60; // 60 fps

    //SCENE VARIABLES
    let particles, //cloud of points based on sphere vertex
        sphere, //primary sphere
        perlin, //perlin noise
        sposition, //array of sphere vertex position
        snormal,   //array of sphere vertex normals
        l, //n. of vertex (particles)
        c, //color
        scaleFactor = 1,
        scaleFactorMax, //max pulse
        scaleFactorMin, //min pulse
        direct = 1,  //updated direction of the point
        counter = 0  //updated counter

    //EMOTION CONTROLLER: COLOR AND HB
    var params = {
        positivo: data[d3id].Stress,
        battiti: data[d3id].HR,
        context: data[d3id].Context,
        time: data[d3id].HOUR
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
        //camera
        camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        camera.setFocalLength(50);
        camera.position.set(0, 0, 140);
        camera.lookAt(0, 0, 0);
        scene.add(camera);
        //orbit controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.maxPolarAngle = Math.PI * 0.5;
        controls.minDistance = 40;
        controls.maxDistance = 200;
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();
        window.addEventListener("pointerdown", onPointerDown);
        // tail effect
        composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        afterimagePass = new AfterimagePass();
        afterimagePass.uniforms["damp"] = { value: 0.6 };
        composer.addPass(afterimagePass);

        const geometry = new THREE.SphereGeometry(10, 75, 75); //raggio, punti, punti
        const material = new THREE.MeshBasicMaterial({ wireframe: false });
        sphere = new THREE.Mesh(geometry, material);
        let geometryP = new THREE.BufferGeometry(); //crea vettore xyz per ogni punto
        geometryP.setAttribute(
            "position",
            sphere.geometry.attributes.position.clone() //copia posizione dei vertici della sfera
        );
        var texture = new THREE.TextureLoader().load(
            "./assets/imgs/disc.png"
        )
        particles = new THREE.Points( //applica material alle geometryP
            geometryP,
            new THREE.PointsMaterial({
                color: 0xCCCCFF,
                size: 0.8,
                map: texture,
                transparent: true,
                blending: THREE.AdditiveBlending,
            })
        );
        perlin = new Perlin(Math.random());
        scene.add(particles); //no sphere! non serve

        sposition = sphere.geometry.attributes.position.clone();
        snormal = sphere.geometry.attributes.normal.clone();
        l = sposition.count;
        particles.rotation.x = 0.1;
    }



    // ITERATING FUNCTION |––––––––––––––––––––––––––––––––––––––––––
    function update(dt) {
        requestAnimationFrame(update); //to iterate a 60fps
       
        delta += clock.getDelta();
        if (delta  > interval) {
            particles.rotation.y += 0.002; //slight rotation
            c = particles.material.color; //vector .r .g .b
            //update render
            particles.geometry.attributes.position.needsUpdate = true;
            composer.render();
            //listen to the slider and refer to dataset
            params.positivo = data[d3id].Stress;
            params.battiti = data[d3id].HR;
            params.context = data[d3id].Context;
            params.time = data[d3id].HOUR;
            //functions to run
            umor(dt);
            pulse(dt)
            color();     
            delta = delta % interval;
        }
    }

  

    // MOVEMENTS FUNCTIONS |––––––––––––––––––––––––––––––––––––––––––
    //shape of the sphere
    const umor = function (dt) {
        const position = sphere.geometry.attributes.position;
        const positionPart = particles.geometry.attributes.position;

        const p = [];
        for (let i = 0; i < l; i++) {
            const pos = new THREE.Vector3().fromBufferAttribute(sposition, i);
            const norm = new THREE.Vector3().fromBufferAttribute(snormal, i);
            const newPos = pos.clone();

            if (params.positivo < 25) {
                pos.multiplyScalar(1); //0 sferico; ++(0.1) frammentato
            } else { pos.multiplyScalar(0.2) }; //0 sferico; ++(0.1) frammentato
            pos.x +=
                dt * 0.0005 + // accelerazione della frammentazione
                i / 300; // 300 disordinato; 1000 ordinato
            const n = perlin.get3(pos) * THREE.Math.mapLinear(params.positivo, -10, 94, 0, 3);; //0 sferico; ++(4) distanza orbite frammentazione
            newPos.add(norm.multiplyScalar(n * ((params.positivo, -10, 94, 0, 0.5)))); // q. di onde/oscillazioni: 0 sferico; 0.5 max
            newPos.add(pos.multiplyScalar(n * ((params.positivo, -10, 94, 2, 5)))); //0 sferico; ++(5) frammentato

            p.push(newPos);
        }
        //apply position
        position.copyVector3sArray(p);
        positionPart.copyVector3sArray(p);
    };

    //pulse action
    const pulse = function () {
        //set hr timing
        if (counter < ((120 / params.battiti) * 15)) {
            counter++;
            scaleFactor += direct //dynamic scale value
        } else {
            if (direct < 0) {
                scaleFactorMax = scaleFactor  //max scale value of that hr
                scaleFactorMin = scaleFactorMax - counter  //min scale value of that hr
            }
            direct = -direct; //change direction
            counter = 0;      //reset counter
        }
        //apply scalar
        particles.scale.setScalar(THREE.Math.mapLinear(scaleFactor, scaleFactorMin, scaleFactorMax, 0.5, 1)) //map the scale factor to a min and max range (otherwise the pulse could reach negative values)
    };

    //change color
    const color = function () {
        //map the stress to a colour range from blu to red
        c.r = THREE.Math.mapLinear(params.positivo, 10, 94, 0.55, 0.5) //r
        c.g = THREE.Math.mapLinear(params.positivo, 10, 94, 0.65, 0.15); //g
        c.b = THREE.Math.mapLinear(params.positivo, 10, 94, 1, 0.15) //b
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
            value: 0, //421
            radius: HEIGHT/2,  
            circleShape: "half-top",
            sliderType: "min-range",
            showTooltip: true,
            width: 1,
            max: 599,
            step: 1,
            mouseScrollAction: true,
            handleSize: "+42",
            borderWidth: 0,
            update: function (args) {
                d3id = args.value;
                updMsg = params.context
            },
            tooltipFormat: function (args) {
                return data[args.value].HOUR
            },
            start: function (args) {
                document.getElementsByClassName('tutorial')[0].style.display = 'none'
                if(tutorial==true && args.value>100)
                {   tutorial=false
                    document.getElementById('tutorial2').style.display = 'flex'}
            }
        });
    }
    );
})


