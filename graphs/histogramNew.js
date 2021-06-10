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
    this.squareSize = {sx: this.sx/this.numTicks, sy: this.sy/this.numBuckets}

    this.tickStart = 0; //graph starts from present.
    this.tickEnd = sx; //graph ends at sx ticks ago.
    this.timer = 0;

    this.removeFromWorld = false;
    this.lineWidth = 1;
    this.ctx = this.game.ctx;
    this.game.addEntity(this);
  }

  updatePeriod() {
    // if (this.gene === 0) {
    //   this.field.push(this.mound.roleHistogram);
    // } else {
    //   this.data.push(this.mound.forageHistogram);
    // }
  }

  drawPeriod(ctx) {
    this.ctx.clearRect(this.x, this.y, this.sx, this.sy);

    let present = this.fieldHistory.length - 1;
    let past = Math.max(0, present - this.numTicks);
    let missingTicks = this.numTicks - (present - past)
    //the first sub-array to draw is <past> ticks/indexs from the beginning.

    let maxVal = 0;
    let temp;
    for(var i = present; i > past; i--) {
      maxVal = Math.max(...this.fieldHistory[i]);
      for(var j = 0; j < this.numBuckets; j++) {
        temp = this.fieldHistory[Math.max(0,i)][j]/maxVal;
        this.fill(temp, i-past + missingTicks, j, this.color);
      }
    }

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = this.lineWidth;
    ctx.strokeRect(this.x, this.y, this.sx, this.sy);
    ctx.fillText("cycle #" + past, this.x, this.y + this.sy + 10);
    ctx.fillText("cycle #" + present, this.x + this.sx - 50, this.y + this.sy + 10);

    // for(var i = 0; i < end; i++) { //i iterates through each tick of the past.
    //   for(var j = 0; j < this.numBuckets; j++) { //j iterates through each bucket for each tick.
    //     ctx.fillStyle = `rgba(0, 32, 0, ${0.01*this.fieldHistory[present - i][j]})`;
    //     ctx.fillRect(this.x + (numTicks/rectSize-i)*rectSize, this.y + j*rectSize, rectSize, rectSize)
    //     //ctx.fillText((this.fieldHistories[0][this.fieldHistories[0].length-1 - i]), this.x, this.y + j*rectSize);
    //   }
    // }

  }

  fill(color, x, y, base) {
    //var c = 255 - Math.floor(color * 256);
    //this.ctx.fillStyle = rgb(c, c, c);

    var c = color * 99 + 1;
    c = 511 - Math.floor(Math.log(c) / Math.log(100) * 512);
    if (c > 255) {
        c = c - 256;
        if(base === "red") {
          this.ctx.fillStyle = rgb(255, c, c);
        } else if (base === "green") {
          this.ctx.fillStyle = rgb(c, 255, c);
        } else {
          this.ctx.fillStyle = rgb(c, c, 255);
        }
    }
    else {
        //c = 255 - c;
        this.ctx.fillStyle = rgb(0, 0, c);
    }

    var width = Math.trunc(this.sx / this.numTicks);
    var height = Math.floor(this.sy / this.numBuckets);
    this.ctx.fillRect(this.x + (x * width) - 2,
		              this.y + (y * height),
				      width,
					  height);
}

  update(){};
  draw(ctx){};
}
