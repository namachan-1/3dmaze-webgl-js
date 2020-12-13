class Cube {
    // Constructor
    constructor() {
        this.type = 'cube';
        // this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        // this.size = 5.0;
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum = 0;
    }

    // Render this shape
    render() {
        // var xy = this.position;
        var rgba = this.color;
        // var size = this.size;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);
    
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of Cube
        drawTriangle3DUVNormal( 
            [0.0,0.0,0.0,  1.0,1.0,0.0,  1.0,0.0,0.0], 
            [0.0,0.0, 1.0,1.0, 1.0,0.0],
            [0,0,1, 0,0,1, 0,0,1]);

        drawTriangle3DUVNormal( 
            [0.0,0.0,0.0,  0.0,1.0,0.0,  1.0,1.0,0.0], 
            [0.0,0.0, 1.0,0.0, 1.0,1.0],
            [0,0,1, 0,0,1, 0,0,1]);

        // Pass the color of a point to u_FragColor uniform variable
        // gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

        // Left of Cube
        drawTriangle3DUVNormal( 
            [0.0,0.0,0.0,  0.0,0.0,-1.0,  0.0,1.0,-1.0], 
            [0.0,0.0, 1.0,1.0, 1.0,0.0],
            [-1,0,0, -1,0,0, -1,0,0]);

        drawTriangle3DUVNormal( 
            [0.0,0.0,0.0,  0.0,1.0,0.0,  0.0,1.0,-1.0], 
            [0.0,0.0, 1.0,1.0, 1.0,0.0],
            [-1,0,0, -1,0,0, -1,0,0]);

        // Pass the color of a point to u_FragColor uniform variable
        // gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

        // Right of Cube
        drawTriangle3DUVNormal( 
            [1.0,0.0,0.0,  1.0,0.0,-1.0,  1.0,1.0,0.0], 
            [0.0,0.0, 1.0,1.0, 1.0,0.0],
            [1,0,0, 1,0,0, 1,0,0]);
        
        drawTriangle3DUVNormal( 
            [1.0,1.0,0.0,  1.0,1.0,-1.0,  1.0,0.0,-1.0], 
            [1.0,0.0, 0.0,0.0, 1.0,1.0],
            [1,0,0, 1,0,0, 1,0,0]);

        // Pass the color of a point to u_FragColor uniform variable
        // gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);

        // Top of Cube
        drawTriangle3DUVNormal( 
            [0.0,1.0,0.0,  0.0,1.0,-1.0,  1.0,1.0,0.0], 
            [1.0,0.0, 1.0,1.0, 0.0,0.0],
            [0,1,0, 0,1,0, 0,1,0]);

        drawTriangle3DUVNormal( 
            [1.0,1.0,0.0,  1.0,1.0,-1.0,  0.0,1.0,-1.0], 
            [0.0,0.0, 1.0,0.0, 1.0,1.0],
            [0,1,0, 0,1,0, 0,1,0]);

        // Pass the color of a point to u_FragColor uniform variable
        // gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);

        // Bottom of Cube
        drawTriangle3DUVNormal( 
            [0.0,0.0,0.0,  0.0,0.0,-1.0,  1.0,0.0,0.0], 
            [1.0,1.0, 1.0,0.0, 0.0,0.0],
            [0,-1,0, 0,-1,0, 0,-1,0]);

        drawTriangle3DUVNormal( 
            [1.0,0.0,0.0,  1.0,0.0,-1.0,  0.0,0.0,-1.0], 
            [0.0,0.0, 1.0,1.0, 1.0,0.0],
            [0,-1,0, 0,-1,0, 0,-1,0]);

        // Pass the color of a point to u_FragColor uniform variable
        // gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]);

        // Back of Cube
        drawTriangle3DUVNormal( 
            [0.0,0.0,-1.0,  0.0,1.0,-1.0,  1.0,0.0,-1.0], 
            [1.0,1.0, 1.0,0.0, 0.0,0.0],
            [0,0,-1, 0,0,-1, 0,0,-1]);

        drawTriangle3DUVNormal( 
            [1.0,0.0,-1.0,  1.0,1.0,-1.0,  0.0,1.0,-1.0], 
            [0.0,0.0, 1.0,1.0, 1.0,0.0],
            [0,0,-1, 0,0,-1, 0,0,-1]);

        // Pass the color of a point to u_FragColor uniform variable
        // gl.uniform4f(u_FragColor, rgba[0]*.4, rgba[1]*.4, rgba[2]*.4, rgba[3]);
    }
}