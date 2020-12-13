class Camera {
    constructor() {
        this.eye = new Vector3([0,0,3]);
        this.at = new Vector3([0,0,-100]);
        this.up = new Vector3([0,1,0]); 
    } 

    moveForward() {
        let f = new Vector3([0,0,0]);
        f.set(this.at);
        f.sub(f, this.eye);
        f.normalize(f);
        f.mul(f, .2);
        g_camera.eye.add(this.eye, f);
        g_camera.at.add(this.at, f);
    }

    moveBackwards() {
        let b = new Vector3([0,0,0]);
        b.set(this.eye);
        b.sub(b, this.at);
        b.normalize(b);
        b.mul(b, .2);
        g_camera.eye.add(this.eye, b);
        g_camera.at.add(this.at, b);
    }

    moveLeft() {
        let l = new Vector3([0,0,0]);
        l.set(this.at);
        l.sub(l, this.eye);
        l = Vector3.cross(this.up, l);
        l.normalize(l);
        l.mul(l, .2);
        g_camera.eye.add(this.eye, l);
        g_camera.at.add(this.at, l);
    }

    moveRight() {
        let r = new Vector3([0,0,0]);
        r.set(this.at);
        r.sub(r, this.eye);
        r = Vector3.cross(r, this.up);
        r.normalize(r);
        r.mul(r, .2);
        g_camera.eye.add(this.eye, r);
        g_camera.at.add(this.at, r);
    }

    panLeft() {
        let pl =  new Vector3([0,0,0]);
        pl.set(this.at);
        pl.sub(pl, this.eye);

        let rotateL = new Matrix4();
        rotateL.setRotate(5, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        var l_prime = rotateL.multiplyVector3(pl);
        g_camera.at = pl.add(this.eye, l_prime);
    }

    panRight() {
        let pr =  new Vector3([0,0,0]);
        pr.set(this.at);
        pr.sub(pr, this.eye);

        let rotateR = new Matrix4();
        rotateR.setRotate(-5, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        var r_prime = rotateR.multiplyVector3(pr);
        g_camera.at = pr.add(this.eye, r_prime);
    }
}