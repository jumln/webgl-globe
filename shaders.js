const shaders = (function () {
  const vertex = `
    attribute vec4 a_position;
    attribute vec2 a_texcoord;
    
    uniform mat4 u_matrix;

    varying vec2 v_texcoord;


    void main() {

      // Multiply the position by the matrix.
      gl_Position = u_matrix * a_position;
    
      // Pass the color to the fragment shader.
      v_texcoord = a_texcoord;

    }
    `

  const fragment = `
    precision mediump float;

    // Passed in from the vertex shader.
    varying vec2 v_texcoord;

    uniform sampler2D u_texture;

    
    void main() {
        
        gl_FragColor = texture2D(u_texture, v_texcoord);

    }
    `
  return {
    vertex: vertex,
    fragment: fragment
  }
})()
