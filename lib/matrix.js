/** @babel */
const LUMA_R = 0.212671;
const LUMA_G = 0.71516;
const UMA_B = 0.072169;
const LUMA_R2 = 0.3086;
const LUMA_G2_R2 = 0.6094;
const LUMA_B2 = 0.0820;
const ONETHIRD = 1 / 3;
const IDENTITY = [
    1, 0, 0, 0, 0,
    0, 1, 0, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 0, 1, 0
];
const RAD = Math.PI / 180;

export class ColorMatrix {

    constructor(mat = null) {
        if (mat instanceof ColorMatrix) {
            this.matrix = mat.matrix.concat();
        } else if (Array.isArray(mat)) {
            this.matrix = mat.concat();
        } else {
            this.reset();
        }
    }

    adjustBrightness(r = 0, g = NaN, b = NaN) {
        if (isNaN(g)) g = r;
        if (isNaN(b)) b = r;
        this.concat([1, 0, 0, 0, r,
            0, 1, 0, 0, g,
            0, 0, 1, 0, b,
            0, 0, 0, 1, 0]);
    }

    adjustContrast(r0, g = NaN, b = NaN) {
        if (isNaN(g)) g = r;
        if (isNaN(b)) b = r;
        r += 1;
        g += 1;
        b += 1;
        this.concat([r, 0, 0, 0, (128 * (1 - r)),
            0, g, 0, 0, (128 * (1 - g)),
            0, 0, b, 0, (128 * (1 - b)),
            0, 0, 0, 1, 0]);
    }

    adjustHue(degrees = 0) {
        degrees *= RAD;
        let cos = Math.cos(degrees);
        let sin = Math.sin(degrees);
        this.concat([((LUMA_R + (cos * (1 - LUMA_R))) + (sin * -(LUMA_R))), ((LUMA_G + (cos * -(LUMA_G))) + (sin * -(LUMA_G))), ((UMA_B + (cos * -(UMA_B))) + (sin * (1 - UMA_B))), 0, 0,
            ((LUMA_R + (cos * -(LUMA_R))) + (sin * 0.143)), ((LUMA_G + (cos * (1 - LUMA_G))) + (sin * 0.14)), ((UMA_B + (cos * -(UMA_B))) + (sin * -0.283)), 0, 0,
            ((LUMA_R + (cos * -(LUMA_R))) + (sin * -((1 - LUMA_R)))), ((LUMA_G + (cos * -(LUMA_G))) + (sin * LUMA_G)), ((UMA_B + (cos * (1 - UMA_B))) + (sin * UMA_B)), 0, 0,
            0, 0, 0, 1, 0]);
    }

    adjustSaturation(s = 0) {
        let sInv = (1 - s);
        let irlum = (sInv * LUMA_R);
        let iglum = (sInv * LUMA_G);
        let iblum = (sInv * UMA_B);
        this.concat([(irlum + s), iglum, iblum, 0, 0,
            irlum, (iglum + s), iblum, 0, 0,
            irlum, iglum, (iblum + s), 0, 0,
            0, 0, 0, 1, 0]);
    }

    colorize(rgb = 0, amount = NaN) {
        if (isNaN(amount)) {
            amount = 1;
        }
        let r = (((rgb >> 16) & 0xFF) / 0xFF);
        let g = (((rgb >> 8) & 0xFF) / 0xFF);
        let b = ((rgb & 0xFF) / 0xFF);
        let inv_amount = (1 - amount);
        this.concat([(inv_amount + ((amount * r) * LUMA_R)), ((amount * r) * LUMA_G), ((amount * r) * UMA_B), 0, 0,
            ((amount * g) * LUMA_R), (inv_amount + ((amount * g) * LUMA_G)), ((amount * g) * UMA_B), 0, 0,
            ((amount * b) * LUMA_R), ((amount * b) * LUMA_G), (inv_amount + ((amount * b) * UMA_B)), 0, 0,
            0, 0, 0, 1, 0]);
    }

    concat(mat = []) {
        let temp = [];
        let i = 0;
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 5; x++) {
                temp[i + x] = mat[i] * this.matrix[x] +
                    mat[i + 1] * this.matrix[x + 5] +
                    mat[i + 2] * this.matrix[x + 10] +
                    mat[i + 3] * this.matrix[x + 15] +
                    (x === 4 ? mat[i + 4] : 0);
            }
            i += 5;
        }
        this.matrix = temp;
    }

    filter() {
        return new ColorMatrixFilter(this.matrix);
    }

    reset() {
        this.matrix = IDENTITY.concat();
    }
}

export class ColorMatrixFilter {

    constructor(matrix=null) {
        this.matrix=matrix || IDENTITY.concat();
    }

    clone() {
        return new ColorMatrixFilter(this.matrix);
    }

}