
const utils = (function () {
  function compileShader (gl, shaderSource, shaderType) {
  // Create the shader object
    const shader = gl.createShader(shaderType)

    // Set the shader source code.
    gl.shaderSource(shader, shaderSource)

    // Compile the shader
    gl.compileShader(shader)

    // Check if it compiled
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    if (!success) {
    // Something went wrong during compilation; get the error
      throw 'could not compile shader:' + gl.getShaderInfoLog(shader)
    }
    return shader
  }

  function createProgram (gl, vertexShader, fragmentShader) {
  // create a program.
    const program = gl.createProgram()

    // attach the shaders.
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)

    // link the program.
    gl.linkProgram(program)

    // Check if it linked.
    const success = gl.getProgramParameter(program, gl.LINK_STATUS)
    if (!success) {
    // something went wrong with the link
      throw ('program filed to link:' + gl.getProgramInfoLog(program))
    }

    return program
  };

  function createProgramFromShaders (gl, vertexSrc, fragmentSrc) {
    let vertexShader = compileShader(gl, vertexSrc, gl.VERTEX_SHADER)
    let fragmentShader = compileShader(gl, fragmentSrc, gl.FRAGMENT_SHADER)
    return createProgram(gl, vertexShader, fragmentShader)
  }

  function setDataToAttribute (gl, attributeLocation, dataBuffer, size, type, normalize, stride, offset) {
  /* size = components per iteration
    type = data type
    normalize = should the data be normalized
    stride = move forward size * sizeof(type) each iteration to get the next position
    offset = where to start from the buffer
  */

    // Turn on the attribute
    gl.enableVertexAttribArray(attributeLocation)

    // Bind the data buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, dataBuffer)

    // Tell the attribute how to get data out of Buffer
    gl.vertexAttribPointer(attributeLocation, size, type, normalize, stride, offset
    )
  }

  function setDataToBuffer (gl, data) {
  // Create a buffer to set data in
    const buffer = gl.createBuffer()

    // Bind it to ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

    // set data in the buffer
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(data),
      gl.STATIC_DRAW
    )

    return buffer
  }

  function resize (canvas) {
  // Lookup the size the browser is displaying the canvas.
    const displayWidth = canvas.clientWidth
    const displayHeight = canvas.clientHeight

    // Check if the canvas is not the same size.
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    // Make the canvas the same size
      canvas.width = displayWidth
      canvas.height = displayHeight
    }
  }

  function setTextureToBlue (gl) {
  // Create a texture.
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)

    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 255, 255]))

    return texture
  }

  function loadImageTexture (gl, imageurl, texture) {
    function isPowerOf2 (value) {
      return (value & (value - 1)) === 0
    }

    const image = new Image()
    image.crossOrigin = ''
    image.src = imageurl

    image.addEventListener('load', () => {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

      // Check if the image is a power of 2 in both dimensions.
      // WebGL 1 only supports mips for these images
      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      // Generate mips
        gl.generateMipmap(gl.TEXTURE_2D)
      } else {
      // Turn off mips and set wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      }
    })
  }

  return {
    compileShader: compileShader,
    createProgram: createProgram,
    createProgramFromShaders: createProgramFromShaders,
    setDataToAttribute: setDataToAttribute,
    setDataToBuffer: setDataToBuffer,
    resize: resize,
    loadImageTexture: loadImageTexture,
    setTextureToBlue: setTextureToBlue
  }
})()
