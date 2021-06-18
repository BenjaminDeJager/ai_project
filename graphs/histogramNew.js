class HistogramNew{
  constructor (
      game, pointer,
      x, y,
      sx, sy,
      color, name) {
    Object.assign(this, {
      game,
      x, y,
      sx, sy,
      color, name});

    this.fieldHistory = pointer;

    //scaling and dimensions.
    this.numBuckets = 20;
    this.numTicks = Math.trunc(TICK_DISPLAY);
    this.width = Math.trunc(this.sx / this.numTicks);
    this.height = Math.trunc(this.sy / this.numBuckets);
    this.tickStart = 0;

    this.timer = 0;
    this.baseWait = 3;
    this.start;

    this.removeFromWorld = false;
    this.lineWidth = 1;
    this.ctx = this.game.ctx;
    this.lastClick = {
      hasClick: false,
      x: null, y: null, //x,y relative to this graph's pos
      i: null, j: null  //i,j generated via getIndexAt(x,y);
    };
    this.valueOfLastClick;

    this.r = this.color[0];
    this.g = this.color[1];
    this.b = this.color[2];

    this.numForgotten = 0;
  }

  //incase other classes want access to whats being displayed.
  getIndexAt(x, y) {
    //x, y relative to upperleft corner of this graph.
    this.lastClick.i = this.fieldHistory.length - this.tickStart - (x/this.width)
    this.lastClick.j = this.numBuckets - (y/this.height) - 1;
  }

  updatePeriod() {
    let mouse = this.game.mouse
    if(mouse.timer > 0 && mouse.clickX != this.lastClick.x && mouse.clickY != this.lastClick.y
      && mouse.clickX > this.x && mouse.clickX < this.x + this.sx
      && mouse.clickY > this.y && mouse.clickY < this.y + this.sy)
      //been within 3 seconds of clicking and inside this graph and not new click.
    {
      this.lastClick.hasClick = true;
      this.lastClick.x = mouse.clickX;
      this.lastClick.y = mouse.clickY;
      this.timer = this.baseWait;
      this.getIndexAt(this.lastClick.x - this.x, this.lastClick.y - this.y);
    } else if (mouse.timer > 0) {
      this.timer -= this.game.clockTick;
    }
  }

  drawPeriod(ctx) {
    this.ctx.clearRect(this.x, this.y, this.sx+100, this.sy+20);

    this.present = this.fieldHistory.length - 1;
    this.start = Math.min(this.present, Math.max(0, this.present - this.tickStart));
    this.end = Math.max(0, this.start - this.numTicks);
    let missingTicks = this.numTicks - (this.start - this.end)
    //the first sub-array to draw is <past> ticks/indexs from the beginning.

    let val;
    let offsetY = 2;
    for(var i = this.start; i > this.end; i--) {
      let sumValue = this.fieldHistory[i].reduce(function (acc, x) {
            return acc + x;
        }, 0);
      for(var j = 0; j < this.numBuckets; j++) {
        val = this.fieldHistory[Math.max(0,i)][j];
        this.fill(val/sumValue, i-this.end + missingTicks, j, this.width);

        if (!SIMPLE_INFO && val != 0 && i == this.start) {
          ctx.fillText(j, this.x + this.sx + 4, this.y + this.height*(j+1) - offsetY);
          ctx.fillText((val/sumValue).toFixed(2), this.x + this.sx + 20, this.y + this.height*(j+1) - offsetY);
          ctx.fillText(val, this.x + this.sx + 45, this.y + this.height*(j+1) - offsetY);
        }
      }
    }
    ctx.save();
    ctx.lineWidth = this.lineWidth;
    this.ctx.font = "12px Courier";
    ctx.fillStyle = "#000000";
    ctx.fillText(this.name, this.x + this.sx/2 - this.name.length*2, this.y + this.sy + 12);
    ctx.fillText("C# " + (this.end + this.numForgotten), this.x, this.y + this.sy + 12);
    ctx.fillText("C# " + (this.start + this.numForgotten), this.x + this.sx - 55, this.y + this.sy + 12);
    if(!SIMPLE_INFO) {
      ctx.fillText("fract", this.x + this.sx + 20, this.y + this.sy + 10);
      ctx.fillText("actual", this.x + this.sx + 55, this.y + this.sy + 20);

      this.ctx.font = "10px Courier";
      ctx.beginPath();
      let delin = Math.ceil(((this.sx/5)+1)/10)*10;
      let x;
      let y;
      let dashSize = Math.floor(this.sy/this.numBuckets)/3;
      for(let i = (this.start) - (this.start + this.numForgotten)%delin; i > this.end; i-=delin) {
        x = this.x + (i-this.end)*this.width;
        if(this.fieldHistory[i][this.numBuckets-1] == 0) {
          y = this.y + this.sy
          ctx.fillText(i + this.numForgotten, x - 5 - 2*Math.log10(i+this.numForgotten), y - dashSize);
        } else {
          y = this.y
          ctx.fillText(i + this.numForgotten, x - 5 - Math.log10(i+this.numForgotten), y + dashSize);
        }
        ctx.moveTo(x, y-dashSize);
        ctx.lineTo(x, y+dashSize);
        ctx.stroke();
      }
      ctx.closePath();
    }
    ctx.strokeStyle = "#000000";
    ctx.strokeRect(this.x, this.y, this.sx, this.sy);
    ctx.restore();
    if(this.fieldHistory.length > this.numTicks*2) {
      this.fieldHistory.shift();
      this.numForgotten++;
    }
  }

  fill(value, x, y, thick, highlight) {
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

  update(){};
  draw(ctx){};
}
