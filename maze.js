// Global variables
var g_camera;

// Vertex shader program
var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    attribute vec3 a_Normal;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec4 v_VertPos;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
      gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
      v_UV = a_UV;
      // v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1)));
      v_Normal = a_Normal;
      v_VertPos = u_ModelMatrix * a_Position;
    }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;  
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_lightPos2;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos;
  uniform bool u_lightOn;
  uniform bool u_spotlightOn;
  void main() {
    
    if (u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;                  // Use color
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);         // Use UV debug color 
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);  // Use texture0
    } else {                                       
      gl_FragColor = vec4(1,.2,.2,1);              // Error, put Redish     
    }

    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    // float r = length(lightVector);

    vec3 lightVector2 = u_lightPos2 - vec3(v_VertPos);
    // float r2 = length(lightVector2);

    // Red/Green Distance Visualization
    // if (r < 1.0) {
    //   gl_FragColor = vec4(1, 0, 0, 1);
    // } else if (r < 2.0) {
    //   gl_FragColor = vec4(0, 1, 0, 1);
    // }

    // Light Falloff Visualization 1/r^2
    //gl_FragColor = vec4(vec3(gl_FragColor)/(r * r), 1);

    // N dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N, L), 0.0);

    vec3 L2 = normalize(lightVector2);
    vec3 N2 = normalize(v_Normal);
    float nDotL2 = max(dot(N2, L2), 0.0);

    // Reflection
    vec3 R = reflect(-L, N);
    vec3 R2 = reflect(-L2, N2);

    // eye
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

    // Specular
    float specular = pow(max(dot(E, R), 0.0), 15.0);
    float specular2 = pow(max(dot(E, R2), 0.0), 5.0);

    vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.5;
    vec3 diffuse2 = vec3(gl_FragColor) * nDotL2 * 0.3;
    vec3 ambient2 = vec3(gl_FragColor) * 0.3;
    // gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
    if (u_lightOn) {
      if (u_whichTexture == 0) {
        gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
      } else {
        gl_FragColor = vec4(diffuse + ambient, 1.0);
      }
    }

    if (u_spotlightOn) {
      if (u_whichTexture == 0) {
        gl_FragColor = vec4(specular2 + diffuse2 + ambient2, 1.0);
      } else {
        gl_FragColor = vec4(diffuse2 + ambient2, 1.0);
      }
    }
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;
let u_lightPos;
let u_lightPos2;
let u_cameraPos;
let u_lightOn;
let u_spotlightOn;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl");
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of a_UV
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_lightPos
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  // Get the storage location of u_lightPos
  u_lightPos2 = gl.getUniformLocation(gl.program, 'u_lightPos2');
  if (!u_lightPos2) {
    console.log('Failed to get the storage location of u_lightPos2');
    return;
  }

  // Get the storage location of u_lightPos
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }

  // Get the storage location of u_lightPos
  u_spotlightOn = gl.getUniformLocation(gl.program, 'u_spotlightOn');
  if (!u_spotlightOn) {
    console.log('Failed to get the storage location of u_spotlightOn');
    return;
  }
  
  // Get the storage location of u_cameraPos
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }

  // Get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }

  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }

  // Set an identity value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

  g_camera = new Camera();
}

// Globals related to UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_globalAngle = 0;
let g_trunkAngle = 0;
let g_lowtrunkAngle = 0;
let g_frlegAngle = 0;
let g_fllegAngle = 0;
let g_brlegAngle = 0;
let g_bllegAngle = 0;
let g_tailAngle = 0; 
let g_animation = false;
let g_normalOn = false;
let g_lightPos = [0,1,2]; 
let g_lightPos2 = [0,1,2]; 
let g_lightOn = true;
let g_spotlightOn = false;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {
  // Normal Events 
  document.getElementById('normalOn').onclick = function() { g_normalOn = true;};
  document.getElementById('normalOff').onclick = function() { g_normalOn = false;};

  // Light on/off Events
  document.getElementById('lightOn').onclick = function() { g_lightOn = true;};
  document.getElementById('lightOff').onclick = function() { g_lightOn = false;};
  document.getElementById('spotlightOn').onclick = function() { g_spotlightOn = true;};
  document.getElementById('spotlightOff').onclick = function() { g_spotlightOn = false;};

  // Light Slider Events
  document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) { g_lightPos[0] = this.value/100; renderAllShapes(); });
  document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) { g_lightPos[1] = this.value/100; renderAllShapes(); });
  document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) { g_lightPos[2] = this.value/100; renderAllShapes(); });

  // Full animation
  document.getElementById('animationOnButton').onclick = function() { g_animation = true;};
  document.getElementById('animationOffButton').onclick = function() { g_animation = false;};

  // Angle Slider Events
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });
}

function initTextures() {
  var image = new Image();
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }

  var image_1 = new Image();
  if (!image_1) {
    console.log('Failed to create the image object');
    return false;
  }

  // Register the event handler to be called on loading an image
  image.onload = function(){ sendImageToTEXTURE0(image); }
  image_1.onload = function(){sendImageToTEXTURE1(image_1); }
  // Tell the browser to load an image
  image.src = 'grass.jpg';
  image_1.src = 'sky1.jpg';
  // Add more textures here later

  return true;
}

function sendImageToTEXTURE0(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);

  // gl.clear(gl.COLOR_BUFFER_BIT); // Clear <canvas>

  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
  console.log('finished loadTexture');
}

function sendImageToTEXTURE1(image_1) {
  var texture1 = gl.createTexture();
  if (!texture1) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis

  // Bind the texture object to the target
  gl.activeTexture(gl.TEXTURE1);

  gl.bindTexture(gl.TEXTURE_2D, texture1);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image_1);

  // Set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler1, 1);

  // gl.clear(gl.COLOR_BUFFER_BIT); // Clear <canvas>

  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6); // Draw the rectangle
  console.log('finished loadTexture');
}

function main() {
  // Set up canvas and gl variables
  setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();
  
  document.onkeydown = keydown;

  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);
  // renderAllShapes();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {
  // Print some debug information so that we know we are running.
  // console.log(performance.now());

  // save the current time
  g_seconds = performance.now()/1000.0 - g_startTime;
  // console.log(g_seconds);

  // update animation angles
  updateAnimationAngles();

  // Draw everything
  renderAllShapes();

  // Tell the browser to update again when it has time.
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (g_animation) {
    g_trunkAngle = (0.1*Math.sin(g_seconds));
    g_lowtrunkAngle = (0.1*Math.sin(g_seconds));
    g_frlegAngle = (0.05*Math.cos(g_seconds));
    g_fllegAngle = (0.05*Math.cos(g_seconds));
    g_brlegAngle = (0.05*Math.sin(g_seconds));
    g_bllegAngle = (0.05*Math.sin(g_seconds));
    g_tailAngle = (0.05*Math.sin(g_seconds));
  }

  g_lightPos[0] = 6*Math.cos(g_seconds);
  g_lightPos2[2] = 10*Math.cos(g_seconds);
}

function keydown(ev) {
  
  if (ev.keyCode == 87) {
    g_camera.moveForward();
  }
  if (ev.keyCode == 65) {
    g_camera.moveLeft();
  }
  if (ev.keyCode == 83) {
    g_camera.moveBackwards();
  }
  if (ev.keyCode == 68) {
    g_camera.moveRight();
  }
  if (ev.keyCode == 81) {
    g_camera.panLeft();
  }
  if (ev.keyCode == 69) {
    g_camera.panRight();
  }
} 

// var g_eye=[0,0,3];
// var g_at=[0,0,-100];
// var g_up=[0,1,0];
var g_map = [
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2],
  [2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 2],
  [2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 2],
  [2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 2, 2, 2, 2, 2, 0, 0, 2, 2, 0, 0, 2],
  [2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 2, 0, 0, 2, 0, 0, 0, 2, 0, 0, 2, 2, 0, 0, 2],
  [2, 0, 0, 2, 2, 2, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 2, 0, 0, 2, 2, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 2, 2, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 2, 2, 0, 0, 2],
  [2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 0, 0, 0, 2, 0, 0, 2, 2, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 2, 2, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 2, 2, 0, 0, 2],
  [2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 0, 0, 2, 2, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2, 0, 0, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2],
  [2, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 2],
  [2, 0, 0, 2, 0, 0, 2, 0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 0, 2, 0, 0, 2, 2, 2, 2, 2, 0, 2, 0, 0, 2],
  [2, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 2],
  [2, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2],
  [2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 0, 0, 2, 0, 0, 0, 0, 2],
  [2, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 2, 0, 0, 2],
  [2, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 2, 0, 0, 2],
  [2, 0, 0, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 6, 0, 2, 0, 0, 2, 0, 2, 0, 0, 2],
  [2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 2, 0, 0, 2],
  [2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 2, 0, 0, 2],
  [2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2],
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
]

function drawMap() {
  for (x = 0; x < 32; x++) {
    for (y = 0; y < 32; y++) {
      if (g_map[x][y] != 0) {
        var wall = new Cube();
        wall.color = [1.0, 1.0, 1.0, 1.0];
        if (g_normalOn) {
          wall.textureNum = -3;
        } else {
          wall.textureNum = -2;
        }
        wall.matrix.translate(0, -.75, -13.5);
        wall.matrix.scale(1, g_map[x][y], 1);
        wall.matrix.translate(x-16, 0, y-16);
        wall.render();
      }
    }
  }
}

// Draw every shape that is supposed to be in the canvas
function renderAllShapes() {
  // Check the time at the start of this function
  var startTime = performance.now();

  // Pass the projection matrix
  var projMat = new Matrix4();
  projMat.setPerspective(50, canvas.width/canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements); 
  
  // Pass the view matrix
  var viewMat = new Matrix4();
  viewMat.setLookAt(
      g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
      g_camera.at.elements[0],  g_camera.at.elements[1],  g_camera.at.elements[2],
      g_camera.up.elements[0],  g_camera.up.elements[1],  g_camera.up.elements[2],
  );
  // viewMat.setLookAt(0.2,0,5, 0,0,-50, 0,9,0); // (eye, at, up)
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw World
  // Draw the walls
  drawMap();

  // pass the light position to GLSL
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_lightPos2, g_lightPos2[0], g_lightPos2[1], g_lightPos2[2]);

  // pass the camera position to GLSL
  gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);

  // pass light status
  gl.uniform1i(u_lightOn, g_lightOn);
  gl.uniform1i(u_spotlightOn, g_spotlightOn);

  // Draw light
  var light = new Cube();
  light.color = [2, 2, 0, 1];
  light.textureNum = -2;
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-1, -1, -1);
  light.matrix.translate(-.5,-20,-.5);
  light.render();

  // Draw spotlight
  var light2 = new Cube();
  light2.color = [2, 2, 0, 1];
  light2.textureNum = -2;
  light2.matrix.translate(g_lightPos2[0], g_lightPos2[1], g_lightPos2[2]);
  light2.matrix.scale(-.1, -.1, -.1);
  light2.matrix.translate(-0.5, -15, -3);
  light2.render();
  
  // Draw sphere
  // var sphere = new Sphere();
  // sphere.color = [1.0, 0.0, 1.0, 1.0];
  // sphere.matrix.translate(0, .2, 0);
  // if (g_normalOn) {
  //   sphere.textureNum = -3;
  // } else {
  //   sphere.textureNum = 0;
  // }
  // sphere.render();

  // // Draw a cube to test normals
  // var testcube = new Cube();
  // testcube.color = [1.0, 0.0, 0.0, 1.0];
  // testcube.matrix.translate(1, 0, 0);
  // // testcube.matrix.rotate(-20, 1, 0, 0);
  // if (g_normalOn) testcube.textureNum = -3;
  // testcube.render();

  // Draw the floor
  var floor = new Cube(); 
  floor.color = [1.0, 0.0, 0.0, 1.0];
  floor.textureNum = 0;
  floor.matrix.translate(0.0, -.75, 1.5);
  floor.matrix.scale(32, 0, 32);
  floor.matrix.translate(-0.5, 0, 0);
  floor.render();

  // Draw the sky
  var sky = new Cube();
  sky.color = [0.2, 0.2, 0.5, 1.0];
  sky.textureNum = 1;
  sky.matrix.scale(60, 60, 60);
  sky.matrix.translate(-0.5, -0.1, 0.1);
  sky.render(); 

  // Grass around elephant
  var grass1 = new Cube();
  grass1.textureNum = 0;
  grass1.matrix.translate(-9.8, -0.78, -17.3);
  grass1.matrix.scale(0.4, 0.4, 0.4);
  grass1.render();

  var grass2 = new Cube();
  grass2.textureNum = 0;
  grass2.matrix.translate(-9.4, -0.78, -17.4);
  grass2.matrix.scale(0.3, 0.35, 0.3);
  grass2.render();

  var grass3 = new Cube();
  grass3.textureNum = 0;
  grass3.matrix.translate(-10, -0.78, -17.4);
  grass3.matrix.scale(0.5, 0.28, 0.3);
  grass3.render();

  var grass4 = new Cube();
  grass4.textureNum = 0;
  grass4.matrix.translate(-11, -0.78, -16.1);
  grass4.matrix.scale(0.5, 0.45, 1.5);
  grass4.render();

  var grass4 = new Cube();
  grass4.textureNum = 0;
  grass4.matrix.translate(-10.5, -0.78, -17.2);
  grass4.matrix.scale(0.7, 0.19, 0.5);
  grass4.render();

  // Body of elephant
  var body = new Cube();
  body.color = [0.752941, 0.752941, 0.752941, 1.0];
  if (g_normalOn) {
    body.textureNum = -3;
  } else {
    body.textureNum = -2;
  }
  body.matrix.rotate(90, 1, 0, 0);
  body.matrix.translate(-10, -17, 0.5);
  body.matrix.scale(0.7, 0.7, 0.6);
  body.render();  

  var body2 = new Cube();
  body2.color = [0.5, 0.5, 0.5, 1.0];
  if (g_normalOn) {
    body2.textureNum = -3;
  } else {
    body2.textureNum = -2;
  }
  body2.matrix.translate(-9.90, -.45, -16.80);
  body2.matrix.scale(0.55, 0.63, 0.5);
  body2.render();

  // Head of elephant
  var head = new Cube();
  head.color = [0.6, 0.6, 0.6, 1.0];
  if (g_normalOn) {
    head.textureNum = -3;
  } else {
    head.textureNum = -2;
  }
  head.matrix.translate(-9.935, -.4, -17.2);
  head.matrix.scale(0.62, 0.62, 0.38);
  head.render();

  // Ears of elephant
  var ear1 = new Cube();
  ear1.color = [0.8, 0.8, 0.8, 1.0];
  if (g_normalOn) {
    ear1.textureNum = -3;
  } else {
    ear1.textureNum = -2;
  }
  ear1.matrix.translate(-9.55, -0.46, -17.3);
  ear1.matrix.scale(0.45, 0.75, 0.1);
  ear1.render();

  var ear2 = new Cube();
  ear2.color = [0.8, 0.8, 0.8, 1.0];
  if (g_normalOn) {
    ear2.textureNum = -3;
  } else {
    ear2.textureNum = -2;
  }
  ear2.matrix.translate(-10.2, -0.46, -17.3);
  ear2.matrix.scale(0.45, 0.75, 0.1);
  ear2.render();

  // Trunk of elephant
  var trunk1 = new Cube();
  trunk1.color = [0.85, 0.85, 0.85, 1.0];
  if (g_normalOn) {
    trunk1.textureNum = -3;
  } else {
    trunk1.textureNum = -2;
  }
  trunk1.matrix.rotate(g_trunkAngle, 1, 0, 0);
  var trunkCoordinates = new Matrix4(trunk1.matrix);
  trunk1.matrix.translate(-9.71, -0.23, -17.5);
  trunk1.matrix.scale(0.16 , 0.29, 0.15);
  trunk1.render();

  var trunk2 = new Cube();
  trunk2.matrix = trunkCoordinates;
  trunk2.color = [0.9, 0.9, 0.9, 1.0];
  if (g_normalOn) {
    trunk2.textureNum = -3;
  } else {
    trunk2.textureNum = -2;
  }
  trunk2.matrix.rotate(g_lowtrunkAngle, 1, 0, 0);
  trunk2.matrix.translate(-9.695, -0.34, -17.5);
  trunk2.matrix.scale(0.13 , 0.3, 0.13);
  trunk2.render();

  // Legs of elephant/platypus
  // Leg1
  var thigh1 = new Cube();
  thigh1.color = [1, 0.65, 0.0, 1.0];
  if (g_normalOn) {
    thigh1.textureNum = -3;
  } else {
    thigh1.textureNum = -2;
  }
  thigh1.matrix.rotate(g_frlegAngle, 1, 0, 0);
  var thigh1Coordinates = new Matrix4(thigh1.matrix);
  thigh1.matrix.translate(-9.4, -0.60, -16.75);
  thigh1.matrix.scale(0.2 , 0.23, 0.15);
  thigh1.render();

  var leg1 = new Cube();
  leg1.matrix = thigh1Coordinates;
  leg1.color = [1, 0.5, 0.0, 1.0];
  if (g_normalOn) {
    leg1.textureNum = -3;
  } else {
    leg1.textureNum = -2;
  }
  leg1.matrix.rotate(-90, 1, 0, 0);
  leg1.matrix.translate(-9.42, 16.71, -0.6);
  leg1.matrix.scale(0.24, 0.285, 0.14);
  leg1.render();

  // Leg2
  var thigh2 = new Cube();
  thigh2.color = [1, 0.65, 0.0, 1.0];
  if (g_normalOn) {
    thigh2.textureNum = -3;
  } else {
    thigh2.textureNum = -2;
  }
  thigh2.matrix.rotate(g_fllegAngle, 0, 0, 1);
  var thigh2Coordinates = new Matrix4(thigh2.matrix);
  thigh2.matrix.translate(-10.1, -0.60, -16.75);
  thigh2.matrix.scale(0.2 , 0.23, 0.15);
  thigh2.render();

  var leg2 = new Cube();
  leg2.matrix = thigh2Coordinates;
  leg2.color = [1, 0.5, 0.0, 1.0];
  if (g_normalOn) {
    leg2.textureNum = -3;
  } else {
    leg2.textureNum = -2;
  }
  leg2.matrix.rotate(-90, 1, 0, 0);
  leg2.matrix.translate(-10.12, 16.71, -0.6);
  leg2.matrix.scale(0.24, 0.285, 0.14);
  leg2.render();

  // Leg3
  var thigh3 = new Cube();
  thigh3.color = [1, 0.65, 0.0, 1.0];
  if (g_normalOn) {
    thigh3.textureNum = -3;
  } else {
    thigh3.textureNum = -2;
  }
  thigh3.matrix.rotate(g_brlegAngle, 1, 0, 0);
  var thigh3Coordinates = new Matrix4(thigh3.matrix);
  thigh3.matrix.translate(-9.4, -0.60, -16.35);
  thigh3.matrix.scale(0.2 , 0.23, 0.15);
  thigh3.render();

  var leg3 = new Cube();
  leg3.matrix = thigh3Coordinates;
  leg3.color = [1, 0.5, 0.0, 1.0];
  if (g_normalOn) {
    leg3.textureNum = -3;
  } else {
    leg3.textureNum = -2;
  }
  leg3.matrix.rotate(-90, 1, 0, 0);
  leg3.matrix.translate(-9.42, 16.3, -0.6);
  leg3.matrix.scale(0.24, 0.285, 0.14);
  leg3.render();

  // Leg4
  var thigh4 = new Cube();
  thigh4.color = [1, 0.65, 0.0, 1.0]; 
  if (g_normalOn) {
    thigh4.textureNum = -3;
  } else {
    thigh4.textureNum = -2;
  }
  thigh4.matrix.rotate(g_bllegAngle, 0, 0, 1);
  var thigh4Coordinates = new Matrix4(thigh4.matrix);
  thigh4.matrix.translate(-10.1, -0.6, -16.35);
  thigh4.matrix.scale(0.24, 0.23, 0.15);
  thigh4.render();

  var leg4 = new Cube();
  leg4.matrix = thigh4Coordinates;
  leg4.color = [1, 0.5, 0.0, 1.0];
  if (g_normalOn) {
    leg4.textureNum = -3;
  } else {
    leg4.textureNum = -2;
  }
  leg4.matrix.rotate(-90, 1, 0, 0);
  leg4.matrix.translate(-10.1, 16.3, -0.6);
  leg4.matrix.scale(0.24, 0.285, 0.14);
  leg4.render();

  // Tail of platypus
  var tail = new Cube();
  tail.color = [1, 0.5, 0.0, 1.0];
  if (g_normalOn) {
    tail.textureNum = -3;
  } else {
    tail.textureNum = -2;
  }
  tail.matrix.rotate(g_tailAngle, 0, 1, 0);
  tail.matrix.translate(-9.885, -0.27, -16.3);
  tail.matrix.rotate(90, 1, 0, 0);
  tail.matrix.scale(0.5, 0.57, 0.18);
  tail.render();

  // Eyes 
  var white1 = new Cube();
  white1.color = [1.0, 1.0, 1.0, 0.0];
  if (g_normalOn) {
    white1.textureNum = -3;
  } else {
    white1.textureNum = -2;
  }
  white1.matrix.translate(-9.87, 0.04, -17.5);
  white1.matrix.scale(0.12, 0.127, 0.1);
  white1.render();

  var eye1 = new Cube();
  eye1.color = [0.0, 0.0, 0.0, 1.0];
  if (g_normalOn) {
    eye1.textureNum = -3;
  } else {
    eye1.textureNum = -2;
  }
  eye1.matrix.translate(-9.87, 0.04, -17.5);
  eye1.matrix.scale(0.1, 0.1, 0.11);
  eye1.render();

  var white2 = new Cube();
  white2.color = [1.0, 1.0, 1.0, 0.0];
  if (g_normalOn) {
    white2.textureNum = -3;
  } else {
    white2.textureNum = -2;
  }
  white2.matrix.translate(-9.5, 0.04, -17.5);
  white2.matrix.scale(0.12, 0.127, 0.1);
  white2.render();

  var eye2 = new Cube();
  eye2.color = [0.0, 0.0, 0.0, 1.0];
  if (g_normalOn) {
    eye2.textureNum = -3;
  } else {
    eye2.textureNum = -2;
  }
  eye2.matrix.translate(-9.5, 0.04, -17.5);
  eye2.matrix.scale(0.1, 0.1, 0.11);
  eye2.render();
   
  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}
 


