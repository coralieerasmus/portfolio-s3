 // Initialize scene, camera, and renderer
 const scene = new THREE.Scene();
 const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
 const renderer = new THREE.WebGLRenderer();
 renderer.setSize(window.innerWidth, window.innerHeight);
 document.body.appendChild(renderer.domElement);

 // Create a fullscreen plane
 const geometry = new THREE.PlaneGeometry(2, 2);

 // Shader material
 const material = new THREE.ShaderMaterial({
     uniforms: {
         u_time: { value: 0.0 },
         u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
         u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
     },
     vertexShader: `
         void main() {
             gl_Position = vec4(position, 1.0);
         }
     `,
     fragmentShader: `
         uniform float u_time;
         uniform vec2 u_mouse;
         uniform vec2 u_resolution;

         float random(vec2 p) {
             return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
         }

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
             vec2 st = gl_FragCoord.xy / u_resolution.xy;

             vec2 mouseNorm = u_mouse / u_resolution;
             vec2 p = st * 2.0 - 1.0;

             float n = noise(p * 3.0 + u_time * 1.0);
             float m = noise(p * 2.0 - u_time * 0.8 + mouseNorm * 2.0);

             vec3 color1 = vec3(1.0, 0.4, 0.1);
             vec3 color2 = vec3(1.0, 0.8, 0.2);
             vec3 color3 = vec3(0.6, 0.1, 0.6);
             vec3 color4 = vec3(0.1, 0.3, 0.8);

             vec3 color = mix(color1, color2, smoothstep(0.0, 1.0, n));
             color = mix(color, color3, smoothstep(0.0, 1.0, m));
             color = mix(color, color4, smoothstep(0.0, 1.0, abs(n - m)));

             vec2 fluidMovement = vec2(sin(u_time * 0.5), cos(u_time * 0.5));
             color += 0.2 * sin(u_time + fluidMovement.x + fluidMovement.y);

             gl_FragColor = vec4(color, 1.0);
         }
     `
 });

 const plane = new THREE.Mesh(geometry, material);
 scene.add(plane);

 camera.position.z = 1;

 window.addEventListener('mousemove', (event) => {
     material.uniforms.u_mouse.value.set(event.clientX, event.clientY);
 });

 window.addEventListener('resize', () => {
     renderer.setSize(window.innerWidth, window.innerHeight);
     material.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
 });

 const animate = function () {
     requestAnimationFrame(animate);
     material.uniforms.u_time.value += 0.01;
     renderer.render(scene, camera);
 };

 animate();