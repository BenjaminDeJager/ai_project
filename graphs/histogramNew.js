function Graph(game, x, y, automata, label) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.automata = automata;
    this.label = label;

    this.xSize = 360;
    this.ySize = 175;
    this.ctx = game.ctx;
    this.seedData = [];
    this.humanData = [];
    this.maxVal = Math.max(...this.seedData,
						   ...this.humanData);
}

Graph.prototype.update = function () {
    this.seedData = this.automata.seedPop;
    this.humanData = this.automata.humanPop;
    this.updateMax();
}

Graph.prototype.draw = function (ctx) {
    if (this.seedData.length > 1) {
        // seeds
        this.ctx.strokeStyle = "#00BB00";
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        var xPos = this.x;
        var yPos = this.seedData.length > this.xSize ? this.y + this.ySize - Math.floor(this.seedData[this.seedData.length - this.xSize] / this.maxVal * this.ySize)
										: this.y + this.ySize - Math.floor(this.seedData[0] / this.maxVal * this.ySize);
        this.ctx.moveTo(xPos, yPos);
        var length = this.seedData.length > this.xSize ?
            this.xSize : this.seedData.length;
        for (var i = 1; i < length; i++) {
            var index = this.seedData.length > this.xSize ?
						this.seedData.length - this.xSize - 1 + i : i;
            xPos++;
            yPos = this.y + this.ySize - Math.floor(this.seedData[index] / this.maxVal * this.ySize);
            if (yPos <= 0) {
                yPos = 0;
            }

            this.ctx.lineTo(xPos, yPos);
        }
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.strokeStyle = "#000000";
        this.ctx.fillSytle = "#000000";
        this.ctx.fillText(this.seedData[this.seedData.length - 1], this.x + this.xSize + 5, yPos + 10);

        // humans
        this.ctx.strokeStyle = "#CCCCCC";
        this.ctx.beginPath();
        var xPos = this.x;
        var yPos = this.humanData.length > this.xSize ? this.y + this.ySize - Math.floor(this.humanData[this.humanData.length - this.xSize] / this.maxVal * this.ySize)
										: this.y + this.ySize - Math.floor(this.humanData[0] / this.maxVal * this.ySize);
        this.ctx.moveTo(xPos, yPos);
        var length = this.humanData.length > this.xSize ?
            this.xSize : this.humanData.length;
        for (var i = 1; i < length; i++) {
            var index = this.humanData.length > this.xSize ?
						this.humanData.length - this.xSize - 1 + i : i;
            xPos++;
            yPos = this.y + this.ySize - Math.floor(this.humanData[index] / this.maxVal * this.ySize);
            if (yPos <= 0) {
                yPos = 0;
            }

            this.ctx.lineTo(xPos, yPos);
        }
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.strokeStyle = "#000000";
        this.ctx.fillSytle = "#000000";
        this.ctx.fillText(this.humanData[this.humanData.length - 1], this.x + this.xSize + 5, yPos + 10);

        var firstTick = 0;
        firstTick = this.humanData.length > this.xSize ? this.humanData.length - this.xSize : 0;
        this.ctx.fillText(firstTick * params.reportingPeriod, this.x, this.y + this.ySize + 10);
        this.ctx.textAlign = "right";
        this.ctx.fillText(this.automata.day - 1, this.x + this.xSize - 5, this.y + this.ySize + 10);
    }
    this.ctx.strokeStyle = "#000000";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(this.x, this.y, this.xSize, this.ySize);

}

Graph.prototype.updateMax = function () {
    var tick = this.seedData.length;
    if (tick > this.xSize) {
        var recentSeed = this.seedData.slice(tick - this.xSize);
        var recentHuman = this.humanData.slice(tick - this.xSize);

        this.maxVal = Math.max(...recentSeed,
		                       ...recentHuman);
    } else {
        this.maxVal = Math.max(...this.seedData,
							   ...this.humanData);
    }
}
