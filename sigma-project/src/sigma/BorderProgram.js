import { AbstractNodeProgram } from "sigma/rendering/webgl/programs/abstract-node-program";
import { floatColor } from "sigma/utils";

export default class BorderNodeProgram extends AbstractNodeProgram {
  constructor(gl) {
    super(gl, {
      NODE_STRIDE: 8, // x, y, size, color, borderSize, borderR, borderG, borderB
    });
  }

  process(data, index) {
    const array = this.array;

    const color = floatColor(data.color);
    const borderColor = floatColor(data.borderColor || "#000");

    const i = index * this.NODE_STRIDE;

    array[i] = data.x;
    array[i + 1] = data.y;
    array[i + 2] = data.size || 8;

    array[i + 3] = color;

    array[i + 4] = data.borderSize || 0;

    array[i + 5] = borderColor;
  }
}
