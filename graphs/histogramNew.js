class HistogramNew{
  constructor (
      game, pointer,
      x, y,
      sx, sy,
      color, name
    /*, fieldPointers, fieldColors, fieldHistories, fieldBuckets, bucketFunctions tickStart, tickEnd*/) {
    Object.assign(this, {
      game,
      x, y,
      sx, sy,
      color, name
      /*fieldPointers, //[<someEntity>.<someField>]
      fieldColors, //["red"]; the color to draw each parallel array's element(s).
      fieldHistories, // [[]]; a linear history of each fields value at each tick.
      fieldBuckets, // []
      bucketFunctions
    , tickStart, tickEnd*/});

    this.fieldHistory = pointer;

    //scaling and dimensions.
    this.numBuckets = 20;
    this.numTicks = Math.round(TICK_DISPLAY);
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
    this.ctx.clearRect(this.x, this.y, this.sx+80, this.sy+20);

    let present = this.fieldHistory.length - 1;
    let past = Math.max(0, present - this.numTicks);
    let missingTicks = this.numTicks - (present - past)
    //the first sub-array to draw is <past> ticks/indexs from the beginning.

    let val;
    for(var i = present; i > past; i--) {
      let sumValue = this.fieldHistory[present].reduce(function (acc, x) {
            return acc + x;
        }, 0);
      for(var j = 0; j < this.numBuckets; j++) {
        val = this.fieldHistory[Math.max(0,i)][j];
        this.fill(val/sumValue, i-past + missingTicks, j, this.width);
        if (!SIMPLE_INFO && val != 0 && i == present) {
          ctx.fillText(j, this.x + this.sx + 5, this.y + this.height*(j+1));
          ctx.fillText((val/sumValue).toFixed(2), this.x + this.sx + 25, this.y + this.height*(j+1));
          ctx.fillText(val, this.x + this.sx + 60, this.y + this.height*(j+1));
        }
      }
    }
    if(!SIMPLE_INFO) {
      ctx.save();

      ctx.strokeStyle = "#000000";
      ctx.lineWidth = this.lineWidth;
      this.ctx.font = "12px Courier";
      ctx.fillStyle = "#000000";

      ctx.fillText("portion", this.x + this.sx + 25, this.y + this.sy + 20);
      ctx.fillText("actual", this.x + this.sx + 60, this.y + this.sy + 10);

      ctx.strokeRect(this.x, this.y, this.sx, this.sy);
      if(past > 1000000) {
        ctx.fillText("k-C# " + (past/1000000).toFixed(3), this.x, this.y + this.sy + 12);
        ctx.fillText("k-C# " + (present/1000000).toFixed(3), this.x + this.sx - 60, this.y + this.sy + 12);
      } else if (past > 1000) {
        ctx.fillText("k-C# " + (past/1000).toFixed(1), this.x, this.y + this.sy + 12);
        ctx.fillText("k-C# " + (present/1000).toFixed(1), this.x + this.sx - 60, this.y + this.sy + 12);
      } else {
        ctx.fillText("C# " + past, this.x, this.y + this.sy + 12);
        ctx.fillText("C# " + present, this.x + this.sx - 60, this.y + this.sy + 12);
      }
      ctx.restore();
    } else {
      ctx.strokeRect(this.x, this.y, this.sx, this.sy);
      ctx.fillText("C# " + past, this.x, this.y + this.sy + 12);
      ctx.fillText("C# " + present, this.x + this.sx - 60, this.y + this.sy + 12);
    }
    ctx.fillText(this.name, this.x + this.sx/2 - 40, this.y + this.sy + 12);

    // if(this.timer > 0 && this.mouse) {
    //   this.drawValue(this.ctx, this.i, this.j, this.mouse);
    // }
  }

  fill(value, x, y, thick) {
    // var c = 255 - Math.floor(color * 256);
    // this.ctx.fillStyle = rgb(c, c, c);
    if(value == 0) {
      return;
    } else if(SIMPLE_INFO) {
      let simple = 256-value*256
      this.ctx.save();
      this.ctx.fillStyle = rgb(simple,simple,simple);
      this.ctx.fillRect(this.x + (x * this.width) - this.width,
                    this.y + (y * this.height),
                this.width,
              this.height);
      this.ctx.restore();
    } else {
      var c = value * 99 + 1;
      c = 511 - Math.floor(Math.log(c) / Math.log(100) * 512);

      this.ctx.save();
      if (c > 255) {
          c = c - 256;

          this.ctx.fillStyle = rgb(c, c, 255);
          //we don't want to drop 2/3 of the color's components
          //otherwise we lose the generalizablity of this class over the previous.
      } else {

          this.ctx.fillStyle = rgb(0, 0, c);
          //we don't want to drop 2/3 of the color's components
          //otherwise we lose the generalizablity of this class over the previous.
      }
      this.ctx.fillRect(this.x + (x * this.width) - thick*2,
                    this.y + (y * this.height) - 1,
                thick,
              this.height-0.5);
      this.ctx.restore();
    }
  }

  drawValue(ctx,i,j){
    // ctx.save();
    // ctx.fillStyle = this.color;
    // ctx.font = 2*this.height+'px serif';
    // if(this.fieldHistory[i][j]) {
    //   ctx.fillText(this.fieldHistory[i][j],
    //     this.x + this.sx + 100, this.y + 0.5*this.sy);
    //   ctx
    // }
    // ctx.restore();
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
