//(ben) is this class strictly needed? no, I'm just making it to help me think about this.
class Mouse{
  constructor(game, colorPrimary, colorSecondary, r, thickness) {
    Object.assign(this, {game, colorPrimary, colorSecondary, r, thickness})
    this.isClicked = false;
    this.clickX;
    this.clickY;
    this.x;
    this.y;
    this.yOffset = document.getElementById('canvas');
    this.ctx = this.game.ctx;
    this.timer;
    this.baseWait = 2;
  }

  drawMouse(){
    let ctx = this.ctx;
    ctx.save();
    // ctx.beginPath();
    // ctx.fillStyle = this.colorPrimary;
    // ctx.strokeStyle = this.colorSecondary;
    // ctx.beginPath();
    // ctx.arc(this.x, this.y, this.r - this.thickness, 0, 2 * Math.PI);
    // ctx.fill();
    if(HIGHLIGHT_CLICKS && this.timer > 0) {
      //highlight where last click was.
      this.highlightPoint(this.clickX, this.clickY);
    }
    ctx.restore();
  }

  highlightPoint(x, y) {
    let ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = this.colorPrimary;
    ctx.lineWidth = this.thickness;
    ctx.beginPath();
    ctx.moveTo(x - this.r, y);
    ctx.lineTo(x + this.r, y);
    ctx.stroke();
    ctx.moveTo(x, y - this.r);
    ctx.lineTo(x, y + this.r);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }

  updateMouse(){
    if(this.isClicked) {
      this.timer = this.baseWait;
      this.isClicked = false;
    } else if (this.timer > 0) {
      this.timer -= this.game.clockTick;
    } else {
      //!this.click && this.timer <= 0
      this.timer = 0;
    }
  }

}
