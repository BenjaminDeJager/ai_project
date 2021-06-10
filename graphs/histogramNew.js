class HistogramNew{
  constructor (
      game, pointer,
      x, y,
      sx, sy,
      color
    /*, fieldPointers, fieldColors, fieldHistories, fieldBuckets, bucketFunctions tickStart, tickEnd*/) {
    Object.assign(this, {
      game,
      x, y,
      sx, sy,
      color
      /*fieldPointers, //[<someEntity>.<someField>]
      fieldColors, //["red"]; the color to draw each parallel array's element(s).
      fieldHistories, // [[]]; a linear history of each fields value at each tick.
      fieldBuckets, // []
      bucketFunctions
    , tickStart, tickEnd*/});

    this.fieldHistory = pointer;

    this.numBuckets = 20;
    this.numTicks = TICK_DISPLAY;
    this.width = Math.trunc(this.sx / this.numTicks);
    this.height = Math.trunc(this.sy / this.numBuckets);

    this.tickStart = 0; //graph starts from present.
    this.tickEnd = sx; //graph ends at sx ticks ago.
    this.timer = 0;
    this.mouse;

    this.removeFromWorld = false;
    this.lineWidth = 1;
    this.ctx = this.game.ctx;
    this.game.addEntity(this);
  }

  updatePeriod() {}

  drawPeriod(ctx) {
    this.ctx.clearRect(this.x, this.y, this.sx, this.sy);

    let present = this.fieldHistory.length - 1;
    let past = Math.max(0, present - this.numTicks);
    let missingTicks = this.numTicks - (present - past)
    //the first sub-array to draw is <past> ticks/indexs from the beginning.

    for(var i = present; i > past; i--) {
      let maxValue = Math.max(...(this.fieldHistory[present]));
      for(var j = 0; j < this.numBuckets; j++) {
        this.fill(this.fieldHistory[Math.max(0,i)][j]/maxValue, i-past + missingTicks, j, this.color, this.width);
      }
    }

    if(!SIMPLE_INFO) {
      for(let k = 0 ; k < this.numBuckets; k++) {
        this.fill(k/this.numBuckets, this.numTicks + 5, k, this.color, this.width*10);
        ctx.fillText(k/this.numBuckets, this.x + this.sx + 20, this.y + this.height*(k+1));
      }
    }

    ctx.save();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = this.lineWidth;
    ctx.fillStyle = "#000000";
    ctx.strokeRect(this.x, this.y, this.sx, this.sy);
    ctx.fillText("cycle #" + past, this.x, this.y + this.sy + 10);
    ctx.fillText("cycle #" + present, this.x + this.sx - 50, this.y + this.sy + 10);
    ctx.restore();

    // for(var i = 0; i < end; i++) { //i iterates through each tick of the past.
    //   for(var j = 0; j < this.numBuckets; j++) { //j iterates through each bucket for each tick.
    //     ctx.fillStyle = `rgba(0, 32, 0, ${0.01*this.fieldHistory[present - i][j]})`;
    //     ctx.fillRect(this.x + (numTicks/rectSize-i)*rectSize, this.y + j*rectSize, rectSize, rectSize)
    //     //ctx.fillText((this.fieldHistories[0][this.fieldHistories[0].length-1 - i]), this.x, this.y + j*rectSize);
    //   }
    // }
    // if(this.timer > 0 && this.mouse) {
    //   this.drawValue(this.ctx, this.i, this.j);
    // }
  }

  fill(value, x, y, base, thick) {
    // var c = 255 - Math.floor(color * 256);
    // this.ctx.fillStyle = rgb(c, c, c);
    if(value == 0) {
      return;
    } else if(SIMPLE_INFO) {
      let simple = 256-value*256
      this.ctx.fillStyle = rgb(simple,simple,simple);
      this.ctx.fillRect(this.x + (x * this.width) - this.width,
                    this.y + (y * this.height),
                this.width,
              this.height);
    } else {
      var c = value * 99 + 1;
      c = 511 - Math.floor(Math.log(c) / Math.log(100) * 512);
      this.ctx.save();
      if (c > 255) {
          c = c - 256;
          this.ctx.fillStyle = rgb(c*base[0], c*base[1], c*base[2]);
      } else {
          //c = 255 - c;
          this.ctx.fillStyle = rgb(c*base[1], c*base[2], c*base[0]);
      }
      this.ctx.fillRect(this.x + (x * this.width) - this.width,
                    this.y + (y * this.height),
                this.width*thick,
              this.height);
      this.ctx.restore();
    }
  }

  drawValue(ctx,i,j){
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.font = 2*this.height+'px serif';
    if(this.fieldHistory[i][j]) {
      ctx.fillText(this.fieldHistory[i][j],
        this.x + this.sx + 5, this.y + j*this.height);
    }
    ctx.restore();
  }

  update(){
    // //use this if you want to give the graph interactiablity.
    // if(this.game.isClicked) {
    //   this.mouse = this.game.mouseClick;
    //   let mouse = this.mouse;
    //   if(mouse.x > this.x && mouse.x < this.x + this.sx
    //     && mouse.y > this.y && mouse.y < this.y + this.sy) {
    //       this.timer = 3;
    //       let present = this.fieldHistory.length - 1;
    //       this.i = present - Math.trunc((mouse.x - this.x)/this.sx);
    //       this.j = Math.trunc((mouse.y - this.y)/this.numBuckets);
    //     }
    // } else if (this.timer > 0) {
    //   this.timer -= this.game.clockTick;
    // } else {
    //   this.timer = 0;
    // }
  };
  draw(ctx){};
}
