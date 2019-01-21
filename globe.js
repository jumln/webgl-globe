'use strict'

// Get A WebGL context
const canvas = document.getElementById('canvas')
const gl = canvas.getContext('webgl')
if (!gl) {
  console.log("Your browsers doesn't support webgl")
}

// Parameters to build the sphere
const sphereConfig = {
  widthSegments: 50,
  heightSegments: 50,
  radius: Math.min(gl.canvas.clientWidth / 2, gl.canvas.clientHeight / 2) - 50 // 25 pixels space in both sides
}

// Parameters for the projection matrix
const pmatrixConfig = {
  translation: [gl.canvas.clientWidth / 2, gl.canvas.clientHeight / 2, 0],
  rotation: [0, 0, Math.PI]
}

// Variables for mouse events
const mouse = {
  friction: 0.9, // The sphere rotation slow down factor after mouse release
  speedFactor: 0.005, // Speed of which the sphere is rotated with mouse events
  drag: false,
  oldX: 0,
  oldY: 0,
  dX: 0,
  dY: 0,
  THETA: 0,
  PHI: 0,
  timeoutId: 0,
  timeout: false
}

const IMAGEURL = './world.jpg'
let rotationSpeed = 0.5

function main () {
  // setup GLSL program
  const program = utils.createProgramFromShaders(gl, shaders.vertex, shaders.fragment) // Shaders got from shaders.js

  // Attribute locations to put data in
  const positionLocation = gl.getAttribLocation(program, 'a_position')
  const texcoordLocation = gl.getAttribLocation(program, 'a_texcoord')

  // Uniform locations
  const matrixLocation = gl.getUniformLocation(program, 'u_matrix')
  const textureLocation = gl.getUniformLocation(program, 'u_texture')

  // Get the coordinates for the sphere and the texture
  const sphere = getSphereCoords(sphereConfig.heightSegments, sphereConfig.widthSegments, sphereConfig.radius)

  // Set sphere coordinates to buffer
  const positionBuffer = utils.setDataToBuffer(gl, sphere.sphereCoords)

  // Set texture coordinates to buffer
  const textureCoordBuffer = utils.setDataToBuffer(gl, sphere.textureCoords)

  // Before texture loads set the texture to be a blue 1x1 pixel
  const texture = utils.setTextureToBlue(gl)

  // Asynchronously load the image used for the texture
  utils.loadImageTexture(gl, IMAGEURL, texture)

  let then = 0

  // Start drawing
  requestAnimationFrame(drawScene)

  function drawScene (now) {
    // Convert to seconds
    now *= 0.001

    // Subtract the previous time from the current time
    const deltaTime = now - then

    // Remember the current time for the next frame.
    then = now

    // Rotate the sphere every frame
    pmatrixConfig.rotation[1] -= rotationSpeed * deltaTime

    if (!mouse.drag) {
      // Slow down the rotation caused by the mouse when its not dragging
      mouse.dX *= mouse.friction
      mouse.dY *= mouse.friction
      mouse.THETA += mouse.dX
      mouse.PHI += mouse.dY
    }

    // Resize the canvas
    utils.resize(gl.canvas)

    // Translate the sphere to the center of resized canvas
    pmatrixConfig.translation = [canvas.clientWidth / 2, canvas.clientHeight / 2, 0]

    // Tell WebGL the viewport
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // Tell WebGL to use the program
    gl.useProgram(program)

    // Turn on culling
    gl.enable(gl.CULL_FACE)

    // Enable the depth buffer
    gl.enable(gl.DEPTH_TEST)

    utils.setDataToAttribute(gl, positionLocation, positionBuffer, 3, gl.FLOAT, false, 0, 0)

    // Tell the texture attribute how to get data out of texture buffer
    utils.setDataToAttribute(gl, texcoordLocation, textureCoordBuffer, 2, gl.FLOAT, false, 0, 0)

    // Create projection matrix
    let pmatrix = matrix.orthographic(gl.canvas.clientWidth, 0, gl.canvas.clientHeight, 0, Math.max(gl.canvas.clientWidth, gl.canvas.clientHeight), 0)
    matrix.translate(pmatrix, pmatrixConfig.translation[0], pmatrixConfig.translation[1], pmatrixConfig.translation[2])
    matrix.xRotate(pmatrix, mouse.PHI)
    matrix.yRotate(pmatrix, pmatrixConfig.rotation[1] + (2 * Math.PI - mouse.THETA))
    matrix.zRotate(pmatrix, pmatrixConfig.rotation[2])

    // Set the texture location
    gl.uniform1i(textureLocation, 0)

    // Set the matrix.
    gl.uniformMatrix4fv(matrixLocation, false, pmatrix)

    // Draw the geometry.
    const primitiveType = gl.TRIANGLES
    const offset = 0
    const count = Math.floor(sphere.textureCoords.length / 2) // How many triangles
    gl.drawArrays(primitiveType, offset, count)

    requestAnimationFrame(drawScene)
  }
}

/* ------------------------------ SPHERE AND TEXTURE COORDINATES ------------------------------- */

function getSphereCoords (heightSegments, widthSegments, radius) {
  let sphereCoords = []
  let textureCoords = []
  let normalCoords = []
  /* Calculates the x, y, z coordinates for a sphere using uv mapping
        https://en.wikipedia.org/wiki/UV_mapping
        Every tile on the sphere consists of two triangles
        down * across determines how many rectangles are formed. i.e how smooth the sphere is.

        // for each rect we need 4 points, two triangles.

            1________2
            |      / |
            |    /   |
            |  /     |
            |/       |
            3--------4
    */
  let uStep = 2 * Math.PI / heightSegments
  let vStep = Math.PI / widthSegments

  for (let u = 0; u < 2 * Math.PI; u += uStep) {
    for (let v = 0; v < Math.PI; v += vStep) {
      // The four points
      const p1 = getSpherePoint(u, v, radius)
      const p2 = getSpherePoint(u + uStep, v, radius)
      const p3 = getSpherePoint(u, v + vStep, radius)
      const p4 = getSpherePoint(u + uStep, v + vStep, radius)

      // Adding each point to their respected array
      addTriangle(sphereCoords, p1.point, p2.point, p3.point)
      addTriangle(sphereCoords, p3.point, p2.point, p4.point)
      addTriangle(textureCoords, p1.uv, p2.uv, p3.uv)
      addTriangle(textureCoords, p3.uv, p2.uv, p4.uv)
      addTriangle(normalCoords, p1.normal, p2.normal, p3.normal)
      addTriangle(normalCoords, p3.normal, p2.normal, p4.normal)
    }
  }

  return { sphereCoords: sphereCoords, textureCoords: textureCoords, normalCoords: normalCoords }
}
function getSpherePoint (u, v, r) {
  // https://en.wikipedia.org/wiki/Spherical_coordinate_system#Cartesian_coordinates
  // Radius can be tought as pixels.
  const nx = Math.cos(u) * Math.sin(v)
  const ny = Math.cos(v)
  const nz = Math.sin(u) * Math.sin(v)

  // Point is the x, y, z coordinate in the sphere.
  // uv is the x and y coordinates on the 2d texture.
  // Normals are the spheres normals i. e. unit vectors
  return { point: [nx * r, ny * r, nz * r], uv: [(1 - u) / (2 * Math.PI), v / Math.PI], normal: [nx, ny, nz] }
}

function addTriangle (array, point1, point2, point3) {
  // Adds points corresponding to a triangle to the specified array
  array.push(...point1, ...point2, ...point3)
}

/* ------------------------------ MOUSE EVENTS ------------------------------ */

const mouseDown = function (e) {
  clearTimeout(mouse.timeoutId)
  stopRotation()
  mouse.drag = true
  mouse.oldX = e.pageX
  mouse.oldY = e.pageY
  e.preventDefault()
}

const mouseUp = function (e) {
  mouse.drag = false
  mouse.timeoutId = setTimeout(startRotation, 3000)
}
const mouseMove = function (e) {
  if (!mouse.drag) return
  mouse.dX = (e.pageX - mouse.oldX) * mouse.speedFactor
  mouse.dY = (e.pageY - mouse.oldY) * mouse.speedFactor
  mouse.THETA += mouse.dX
  mouse.PHI += mouse.dY
  mouse.oldX = e.pageX
  mouse.oldY = e.pageY
}

canvas.addEventListener('mousedown', mouseDown)
canvas.addEventListener('mouseup', mouseUp)
canvas.addEventListener('mouseout', mouseUp)
canvas.addEventListener('mousemove', mouseMove)

function startRotation () {
  mouse.timeout = false
  rotationSpeed = 0.5
}

function stopRotation () {
  mouse.timeout = true
  rotationSpeed = 0
}

main()
