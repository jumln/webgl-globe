
const matrix = (function () {

  let orthographic = function (r, l, t, b, f, n) {
    return [
            2 / (r - l),                  0,                  0,        0,
                      0,       -2 / (t - b),                  0,        0,
                      0,                  0,        2 / (f - n),        0,
      -(r + l) /(r - l),  (t + b) / (t - b),  (f + n) / (f - n),        1
    ]
  }

  let multiply = function (a, b) {
    // Modifies the Matrix a
    let tmp = Array(16).fill(0)

    tmp[0] = b[0 * 4 + 0] * a[0 * 4 + 0] + b[0 * 4 + 1] * a[1 * 4 + 0] + b[0 * 4 + 2] * a[2 * 4 + 0] + b[0 * 4 + 3] * a[3 * 4 + 0],
    tmp[1] = b[0 * 4 + 0] * a[0 * 4 + 1] + b[0 * 4 + 1] * a[1 * 4 + 1] + b[0 * 4 + 2] * a[2 * 4 + 1] + b[0 * 4 + 3] * a[3 * 4 + 1],
    tmp[2] = b[0 * 4 + 0] * a[0 * 4 + 2] + b[0 * 4 + 1] * a[1 * 4 + 2] + b[0 * 4 + 2] * a[2 * 4 + 2] + b[0 * 4 + 3] * a[3 * 4 + 2],
    tmp[3] = b[0 * 4 + 0] * a[0 * 4 + 3] + b[0 * 4 + 1] * a[1 * 4 + 3] + b[0 * 4 + 2] * a[2 * 4 + 3] + b[0 * 4 + 3] * a[3 * 4 + 3],
    tmp[4] = b[1 * 4 + 0] * a[0 * 4 + 0] + b[1 * 4 + 1] * a[1 * 4 + 0] + b[1 * 4 + 2] * a[2 * 4 + 0] + b[1 * 4 + 3] * a[3 * 4 + 0],
    tmp[5] = b[1 * 4 + 0] * a[0 * 4 + 1] + b[1 * 4 + 1] * a[1 * 4 + 1] + b[1 * 4 + 2] * a[2 * 4 + 1] + b[1 * 4 + 3] * a[3 * 4 + 1],
    tmp[6] = b[1 * 4 + 0] * a[0 * 4 + 2] + b[1 * 4 + 1] * a[1 * 4 + 2] + b[1 * 4 + 2] * a[2 * 4 + 2] + b[1 * 4 + 3] * a[3 * 4 + 2],
    tmp[7] = b[1 * 4 + 0] * a[0 * 4 + 3] + b[1 * 4 + 1] * a[1 * 4 + 3] + b[1 * 4 + 2] * a[2 * 4 + 3] + b[1 * 4 + 3] * a[3 * 4 + 3],
    tmp[8] = b[2 * 4 + 0] * a[0 * 4 + 0] + b[2 * 4 + 1] * a[1 * 4 + 0] + b[2 * 4 + 2] * a[2 * 4 + 0] + b[2 * 4 + 3] * a[3 * 4 + 0],
    tmp[9] = b[2 * 4 + 0] * a[0 * 4 + 1] + b[2 * 4 + 1] * a[1 * 4 + 1] + b[2 * 4 + 2] * a[2 * 4 + 1] + b[2 * 4 + 3] * a[3 * 4 + 1],
    tmp[10] = b[2 * 4 + 0] * a[0 * 4 + 2] + b[2 * 4 + 1] * a[1 * 4 + 2] + b[2 * 4 + 2] * a[2 * 4 + 2] + b[2 * 4 + 3] * a[3 * 4 + 2],
    tmp[11] = b[2 * 4 + 0] * a[0 * 4 + 3] + b[2 * 4 + 1] * a[1 * 4 + 3] + b[2 * 4 + 2] * a[2 * 4 + 3] + b[2 * 4 + 3] * a[3 * 4 + 3],
    tmp[12] = b[3 * 4 + 0] * a[0 * 4 + 0] + b[3 * 4 + 1] * a[1 * 4 + 0] + b[3 * 4 + 2] * a[2 * 4 + 0] + b[3 * 4 + 3] * a[3 * 4 + 0],
    tmp[13] = b[3 * 4 + 0] * a[0 * 4 + 1] + b[3 * 4 + 1] * a[1 * 4 + 1] + b[3 * 4 + 2] * a[2 * 4 + 1] + b[3 * 4 + 3] * a[3 * 4 + 1],
    tmp[14] = b[3 * 4 + 0] * a[0 * 4 + 2] + b[3 * 4 + 1] * a[1 * 4 + 2] + b[3 * 4 + 2] * a[2 * 4 + 2] + b[3 * 4 + 3] * a[3 * 4 + 2],
    tmp[15] = b[3 * 4 + 0] * a[0 * 4 + 3] + b[3 * 4 + 1] * a[1 * 4 + 3] + b[3 * 4 + 2] * a[2 * 4 + 3] + b[3 * 4 + 3] * a[3 * 4 + 3]

    for(let i = 0; i < 16; i++) {
      a[i] = tmp[i]
    }
  }

  let translation = function (tx, ty, tz) {
    return [
       1,  0,  0, 0,
       0,  1,  0, 0,
       0,  0,  1, 0,
       tx,  ty,  tz,  1
    ]
  }

  let xRotation = function (angle) {
    let cos = Math.cos
    let sin = Math.sin

    return [
      1,           0,          0,       0,
      0,  cos(angle), sin(angle),       0,
      0, -sin(angle), cos(angle),       0,
      0,           0,          0,       1
    ]
  }

  let yRotation = function (angle) {
    let cos = Math.cos
    let sin = Math.sin

    return [
      cos(angle),       0, -sin(angle),       0,
               0,       1,           0,       0,
      sin(angle),       0,  cos(angle),       0,
               0,       0,           0,       1
    ]
  }

  let zRotation = function (angle) {
    let cos = Math.cos
    let sin = Math.sin

    return [
       cos(angle), sin(angle),      0,      0,
      -sin(angle), cos(angle),      0,      0,
                0,          0,      1,      0,
                0,          0,      0,      1
    ]
  }

  let scaling = function (sx, sy, sz) {
    return [
      sx,  0,   0,  0,
       0, sy,   0,  0,
       0,  0,  sz,  0,
       0,  0,   0,  1
    ]
  }

  let translate = function (m, tx, ty, tz) {
    multiply(m, translation(tx, ty, tz))
  }

  let scale = function (m, sx, sy, sz) {
    multiply(m, scaling(sx, sy, sz))
  }

  let xRotate = function (m, a) {
    multiply(m, xRotation(a))
  }

  let yRotate = function (m, a) {
    multiply(m, yRotation(a))
  }

  let zRotate = function (m, a) {
    multiply(m, zRotation(a))
  }

  return {
    orthographic: orthographic,
    multiply: multiply,
    translate: translate,
    scale: scale,
    yRotate: yRotate,
    xRotate: xRotate,
    zRotate: zRotate
  }
})()
