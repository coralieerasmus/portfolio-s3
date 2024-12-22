// setting up the scene, camera, and renderer
 const scene = new THREE.Scene();
 const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
 const renderer = new THREE.WebGLRenderer();
 renderer.setSize(window.innerWidth, window.innerHeight);
 document.body.appendChild(renderer.domElement);

 // creating a fullscreen plane, basically it’s just a rectangle that fills the screen
 const geometry = new THREE.PlaneGeometry(2, 2);

// shader material where all the magic happens, not that kinda magic
 const material = new THREE.ShaderMaterial({
     uniforms: {
         u_time: { value: 0.0 }, // this will track time for animations
         u_mouse: { value: new THREE.Vector2(0.5, 0.5) }, // normalized mouse position
         u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) } // resolution of the screen
         },

     // vertex shader, super basic here just sets the position
     vertexShader: `
         void main() {
             gl_Position = vec4(position, 1.0);
         }
     `,

      // fragment shader where I create the noise effect and blend colors
     fragmentShader: `
         uniform float u_time;
         uniform vec2 u_mouse;
         uniform vec2 u_resolution;

        // random function, kind of a standard trick for generating pseudo-random numbers (given from chatgpt)
        float random(vec2 p) {
             return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
         }

          // noise function that smooths out the randomness using interpolation (also from chatgpt)
         float noise(vec2 p) {
             vec2 i = floor(p);
             vec2 f = fract(p);
             vec2 u = f * f * (3.0 - 2.0 * f);

             return mix(
                 mix(random(i), random(i + vec2(1.0, 0.0)), u.x),
                 mix(random(i + vec2(0.0, 1.0)), random(i + vec2(1.0, 1.0)), u.x),
                 u.y
             );
         }

         void main() {
            // normalizing screen coordinates
             vec2 st = gl_FragCoord.xy / u_resolution.xy;

            // normalize mouse position for interaction
             vec2 mouseNorm = u_mouse / u_resolution;
             vec2 p = st * 2.0 - 1.0;

             // using noise to create movement
             float n = noise(p * 3.0 + u_time * 1.0);
             float m = noise(p * 2.0 - u_time * 0.8 + mouseNorm * 2.0);

            // blending between different colors
             vec3 color1 = vec3(1.0, 0.4, 0.1);
             vec3 color2 = vec3(1.0, 0.8, 0.2);
             vec3 color3 = vec3(0.6, 0.1, 0.6);
             vec3 color4 = vec3(0.1, 0.3, 0.8);

            // smooth blending of colors based on noise
             vec3 color = mix(color1, color2, smoothstep(0.0, 1.0, n));
             color = mix(color, color3, smoothstep(0.0, 1.0, m));
             color = mix(color, color4, smoothstep(0.0, 1.0, abs(n - m)));

              // adding some fluid-like movement (with help from chat gpt cause no way you thought i could figure that out by myself)
             vec2 fluidMovement = vec2(sin(u_time * 0.5), cos(u_time * 0.5));
             color += 0.2 * sin(u_time + fluidMovement.x + fluidMovement.y);

             gl_FragColor = vec4(color, 1.0);
         }
     `
 });

// creating the plane mesh and adding it to the scene
 const plane = new THREE.Mesh(geometry, material);
 scene.add(plane);

 // setting the camera’s position so you can see the plane
 camera.position.z = 1;

 // updating the mouse position so the shader can use it
 window.addEventListener('mousemove', (event) => {
     material.uniforms.u_mouse.value.set(event.clientX, event.clientY);
 });

 // handling window resize to keep everything proportional
 window.addEventListener('resize', () => {
     renderer.setSize(window.innerWidth, window.innerHeight);
     material.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
 });

 // the animation loop to keep the scene rendering and update the time uniform
 const animate = function () {
     requestAnimationFrame(animate);
     material.uniforms.u_time.value += 0.01;
     renderer.render(scene, camera);
 };
//the animation loop
 animate();