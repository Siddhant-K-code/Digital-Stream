/*
  Common Tool.
*/

class Tool {
  // random number.
  static randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  // random color rgb.
  static randomColorRGB() {
    return (
      "rgb(" +
      this.randomNumber(0, 255) +
      ", " +
      this.randomNumber(0, 255) +
      ", " +
      this.randomNumber(0, 255) +
      ")"
    );
  }
  // random color hsl.
  static randomColorHSL(hue, saturation, lightness) {
    return (
      "hsl(" +
      hue +
      ", " +
      saturation +
      "%, " +
      lightness +
      "%)"
    );
  }
  // gradient color.
  static gradientColor(ctx, cr, cg, cb, ca, x, y, r) {
    const col = cr + "," + cg + "," + cb;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(" + col + ", " + (ca * 1) + ")");
    g.addColorStop(0.5, "rgba(" + col + ", " + (ca * 0.5) + ")");
    g.addColorStop(1, "rgba(" + col + ", " + (ca * 0) + ")");
    return g;
  }
}

/*
  When want to use angle.
*/

class Angle {
  constructor(angle) {
    this.a = angle;
    this.rad = this.a * Math.PI / 180;
  }

  incDec(num) {
    this.a += num;
    this.rad = this.a * Math.PI / 180;
    return this.rad;
  }
}

/*
  When want to use controller.
*/

class Controller {
  constructor(id) {
    this.id = document.getElementById(id);
  }
  getVal() {
    return this.id.value;
  }
}

let canvas;
const simplex = new SimplexNoise();

class Canvas {
  constructor(bool) {
    // create canvas.
    this.canvas = document.createElement("canvas");
    // if on screen.
    if (bool === true) {
      this.canvas.style.position = 'fixed';
      this.canvas.style.display = 'block';
      this.canvas.style.top = 0;
      this.canvas.style.left = 0;
      document.getElementsByTagName("body")[0].appendChild(this.canvas);
    }
    this.ctx = this.canvas.getContext("2d");
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    // mouse infomation.
    this.mouseX = null;
    this.mouseY = null;
    // controller
    this.checkbox = document.getElementById('checkbox');
    // Shape
    this.shapes = [];
    this.width > this.height ? this.size = 20 : this.size = 20;
    this.xNum = this.width / this.size + 1;
    this.yNum = this.height / this.size + 1;
    this.noiseDist = 100;
    this.glitch;
    this.flg = this.checkbox.checked;
  }
  
  // init, render, resize
  init() {
    for (let x = 0; x < this.xNum; x++) {
      if (this.shapes.length > 2000) break;
      for (let y = 0; y < this.yNum; y++) {
        let s = new Shape(this.ctx, x * this.size, y * this.size, this.size);
        this.shapes.push(s);
      }
    }
    this.glitch = new Glitch(this.ctx);
  }

  render() {
    //this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.globalCompositeOperation = "darken";
    this.ctx.globalAlpha = 0.03;
    this.ctx.fillStyle = "rgb(0,0,0)";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.globalAlpha = 1;
    for (let i = 0; i < this.shapes.length; i++) {
      this.shapes[i].render();
    }
    if (this.flg === true && Math.random() < 0.3) this.glitch.render();
  }
  
  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.shapes = [];
    this.width > this.height ? this.size = 20 : this.size = 20;
    this.xNum = this.width / this.size + 1;
    this.yNum = this.height / this.size + 1;
    this.init();
  }
}

/*
  Shape class.
*/

class Shape {
  constructor(ctx, x, y, r) {
    this.ctx = ctx;
    this.init(x, y, r);
  }

  init(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.t = 1000;
    this.a = new Angle(0);
    if (canvas.width > canvas.height) {
      this.v = {
        x: 1,
        y: 0
      };
    } else {
      this.v = {
        x: 0,
        y: -1
      };
    }
    this.l = Tool.randomNumber(10, 100);
  }

  draw() {
    const ctx = this.ctx;
    const color = simplex.noise3D(this.x / 1000, this.y / 1000, this.t) * Math.sin(this.a.rad * 10) * 360;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'hsl(' + color + ', 80%, 60%)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r / 20, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.restore();
  }

  updatePosition() {
    this.x += (simplex.noise3D(this.x / canvas.noiseDist, this.y / canvas.noiseDist, -this.t) + this.v.x) * 3;
    this.y += (simplex.noise3D(this.x / canvas.noiseDist, this.y / canvas.noiseDist, this.t) + this.v.y) * 3;
  }

  mouseDist() {
    const x = canvas.mouseX - canvas.width / 2;
    const y = canvas.mouseY - canvas.height / 2;
    const d = Math.sqrt(x * x + y * y);
    var colAngle = Math.atan2(canvas.mouseY - canvas.height / 2, canvas.mouseX - canvas.width / 2);
    this.v.x = Math.cos(colAngle);
    this.v.y = Math.sin(colAngle);
    this.x += this.v.x;
    this.y += this.v.y;
  }

  wrapPosition() {
    if (this.x > canvas.width + this.r) {
      this.relocation();
    }
    if (this.x < 0 - this.r) {
      this.relocation();
    }
    if (this.y > canvas.height + this.r) {
      this.relocation();
    }
    if (this.y < 0 - this.r) {
      this.relocation();
    }
  }

  relocation() {
    this.x = Tool.randomNumber(-50, canvas.width + 50);
    this.y = Tool.randomNumber(-50, canvas.height + 50);
  }

  updateParams() {
    this.t += 0.001;
    this.a.incDec(0.1);
    this.l -= 1;
    if (this.l < 0) {
      this.l = Tool.randomNumber(10, 100);
      this.relocation();
    }
  }

  render() {
    this.draw();
    this.updatePosition();
    this.updateParams();
    this.wrapPosition();
    if (canvas.mouseX !== null) this.mouseDist();
  }
}


/*
  Glitch class.
*/

class Glitch {
  constructor(ctx) {
    this.ctx = ctx;
    this.splitNum = 100;
    this.splitY =  canvas.height / this.splitNum;
    this.angles = [];
    this.anglesForRGB = [];
    this.dataArr = [];
    this.getAngles();
    //this.getAnglesForRGB();
  }

  getAnglesForRGB() {
    for (let i = 0; i < 3; i++) {
      const a = Tool.randomNumber(0, 360);
      const r = a * Math.PI / 180;
      const arr = [a, r];
      this.anglesForRGB.push(arr);
    }
  }

  getAngles() {
    for (var i = 0; i < this.splitNum ; i++) {
      const angle = Tool.randomNumber(0, 360);
      const gap = Tool.randomNumber(5, 20);
      const arr = [angle, gap];
      this.angles.push(arr);
    }
  }
  
  getImageData() {
    for (let i = 0; i < this.splitNum ; i++) {
      let d = this.ctx.getImageData(0, this.splitY * i, canvas.width, this.splitY + 1);
      let data = d.data;
      /*
      for (let i = 3; i < data.length - 4; i += 4) {
        if (data[i] > 0) {
          data[i] = 255;
          data[i - 1] = Math.sin(this.anglesForRGB[0][1]) * 255;
          data[i - 2] = Math.cos(this.anglesForRGB[1][1]) * 255;
          data[i - 3] = Math.tan(this.anglesForRGB[2][1]) * 255;
        }
      }
      */
      this.dataArr.push(d);
    }
  }

  updateAnglesForRGB() {
    for (let i = 0; i < this.anglesForRGB.length; i++) {
      this.anglesForRGB[i][1] += Tool.randomNumber(-1, 1) * Math.random();
    }
  }
  
  addImage(){
    for (let i = 0; i < this.splitNum ; i++) {
      if (Math.random() > 0.1) {
        this.ctx.putImageData(this.dataArr[i], Math.sin(this.angles[i][0] * Math.PI / 180) * this.angles[i][1], this.splitY * i);
      } else {
        this.ctx.putImageData(this.dataArr[Tool.randomNumber(0, this.splitNum - 1)], Math.sin(this.angles[i][0] * Math.PI / 180) * canvas.width, this.splitY * i);
      } 
    }
  }

  changeAngle() {
    for (var i = 0; i < this.angles.length; i++) {
      this.angles[i][0] += Tool.randomNumber(-50, 50);
    }
  }
  
  render() {
    this.dataArr = [];
    this.getImageData();
    this.changeAngle();
    //this.updateAnglesForRGB();
    this.addImage();
  }
}

(function () {
  "use strict";
  window.addEventListener("load", function () {
    canvas = new Canvas(true);
    canvas.init();
    
    function render() {
      window.requestAnimationFrame(function () {
        canvas.render();
        render();
      });
    }
    
    render();

    // event
    window.addEventListener("resize", function () {
      canvas.resize();
    }, false);

    window.addEventListener('mousemove', function(e) {
      canvas.mouseX = e.clientX;
      canvas.mouseY = e.clientY;
    }, false);

    canvas.checkbox.addEventListener('click', function(e) {
      if (canvas.flg === false) {
        canvas.flg = true;
      } else {
        canvas.flg = false;
      }
    }, false);

    canvas.canvas.addEventListener('wheel', function(e) {
      canvas.noiseDist += e.deltaY / 10;      
    }, false);

    // smartphone.
    let touchStartY;
    let touchMoveY;
    let touchEndY;

    canvas.canvas.addEventListener('touchstart', function(e) {
      const touch = e.targetTouches[0];
      touchStartY = touch.pageY;
    }, false);

    canvas.canvas.addEventListener('touchmove', function(e) {
      const touch = e.targetTouches[0];
      touchMoveY = touch.pageY;
      touchEndY = touchStartY - touchMoveY;
      canvas.mouseX = touch.pageX;
      canvas.mouseY = touch.pageY;
      if (touchEndY > 0) {
        canvas.noiseDist += touchEndY / 100;
      }
      if (touchEndY < 0) {
        canvas.noiseDist += touchEndY / 100;
      }
    }, false);

    canvas.canvas.addEventListener('touchend', function(e) {
      canvas.mouseX = null;
      canvas.mouseY = null;
      touchStartY = null;
      touchMoveY = null;
      touchEndY = null;
    }, false);

  });
})();
