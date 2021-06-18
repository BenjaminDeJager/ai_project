//ben

//LineGraphs are created at the program's start and fed a array of object literals
//with each tuple having a fieldPointer and a color to be used when drawing it.
//pair it with a reference to a empty array and the caller keeps easy access
//to their fields history as a bonus.
//so {field, color, historyArray}

//<fieldPointers> array of pointers to let it track those fields as they change
//(note that literals carry their contents as references/pointers in python)
//Every updatePeriod it grabs the current value of each field via the pointer and
//store it in a array dedicated to that field.

//every drawPeriod it uses the currently set <tickStart> and <tickEnd> values
//as positive integers
//to determine how to scale/size/shift its stored history of values it has for its given fields.
//iterate through its field's and draw each one's history.

//notes:
// 1): LineGraph will be using <game>'s tick values in general. if issues occur
//related to this, its usage can be replaced with a dynamically defined reference
//to a additional parameter.

// 2): rescaling not currently implemented, currently using default values of (360, 0)
//to represent the current standard of the last 360 ticks of history.

// 3): Because this graph just attempts to store the values in the given fields
// every updatePeriod, any secondary computation on those values should be done
// in parallel to the original values and stored in a "hologram field"
// with a pointer to that hologram instead.

// 4): when initalized, it starts each array off with the current value of
// its respective field. when possable LineGraphs should have their
//updatePeriod's called when the sim's being restarted or otherwise have their
//tracked field values re-set.
class LineGraph{
  constructor(game, x, y, xSize, ySize, fieldTuples/*, tickStart, tickEnd*/) {
    Object.assign(this, {game,
      x, y,
      xSize, ySize,
      fieldTuples/*,
      tickStart, tickEnd*/});

    //remember that fieldtuples should be a array of literals in the form {field, color}
    //these will be used as the "history" when graphing by pulling the latest value
    //each updateperiod for each field and then coloring that pixel if "shown" with
    //the color
    // this.fields = []
    // this.fieldColors = [];
    // this.fieldHistories = [];
    // this.fieldTuples.forEach(field => {
    //   this.fields.push(field.pointer); //pointer to the field
    //   this.fieldColors.push(field.color); //pointer to the color
    //   this.fieldHistories.push(field.history); //probably empty array for history-storage.

      //as a bonus, because these are all pointers, effectively, caller keeps access
      //and can change the color of any of these on the fly.
  // });

    this.numFields = this.fieldTuples.length;
    this.removeFromWorld = false;

    this.mound = this.game.mound;

    this.numTicks = 360;
    this.tickRight = this.numTicks; //360 ticks behind the present.
    this.tickLeft = 0; //graph ends at present.

    this.totalTime = 0;
    this.maxVal = 0;
  }

  updatePeriod() {
    //go through each field and push the latest value of each field to the top of
    //the array for that field.
    var currentTuple;

    for(var i = 0; i < this.numFields; i++) {
      currentTuple = this.fieldTuples[i];
      currentTuple.history.push(currentTuple.pointer);
    }
    this.updateMax();
  }

  drawPeriod(ctx) {
    if(this.numFields > 0 && this.fieldTuples[0].history.length > 1){
      var currentTuple;
      var history;
      ctx.clearRect(this.x,this.y,this.xSize+20,this.ySize+20);
      for(var i = 0; i < this.numFields; i++) {
        currentTuple = this.fieldTuples[i];
        history = currentTuple.history;

        ctx.save();
        ctx.strokeStyle = currentTuple.color;
        ctx.lineWidth = 1;

        ctx.beginPath();
        var xPos = this.x;
        var yPos = this.mound.tick > TICK_DISPLAY ? this.y+this.ySize-Math.floor(history[this.mound.tick-TICK_DISPLAY]/this.maxVal*this.ySize)
                        : this.y+this.ySize-Math.floor(history[0]/this.maxVal*this.ySize);
        ctx.moveTo(xPos, yPos);
        var length = this.mound.tick > TICK_DISPLAY ?
               TICK_DISPLAY : history.length;
        for (var i = 1; i < length; i++) {
          var index = this.mound.tick > TICK_DISPLAY ?
                this.mound.tick-TICK_DISPLAY-1+i : i;
          xPos++;
          yPos = this.y+this.ySize-Math.floor(history[index]/this.maxVal*this.ySize);
          if (yPos <= 0) {
            yPos = 0;
          }

          ctx.lineTo(xPos, yPos);
        }
        ctx.stroke();
        ctx.closePath();

        ctx.strokeStyle = currentTuple.color;
        ctx.fillStyle = currentTuple.color;
        ctx.fillText((i + ", " + history[history.length-1]), this.x+this.xSize + 80, yPos + 10);

        var firstTick = 0;
        firstTick = this.mound.tick > TICK_DISPLAY ? this.mound.tick - TICK_DISPLAY : 0;
        ctx.fillStyle = "#000000";
        ctx.fillText(firstTick, this.x + 15, this.y+this.ySize+10);
        ctx.textAlign = "right";
        ctx.fillText(this.mound.tick-1, this.x+this.xSize-5, this.y+this.ySize+10);
        ctx.restore();
      }

      ctx.fillStyle = currentTuple.color;
      ctx.fillText((history[history.length-1]), this.x+this.xSize + 80, yPos + 10);
    }
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y, this.xSize, this.ySize);
  }

  updateMax() {
    console.log("hi");
  	var tick = this.mound.tick;
    this.sliceArray = [];

    for(var i = 0; i < this.numFields; i++) {
      this.sliceArray.push(this.fieldTuples[i].history.slice(tick-TICK_DISPLAY));
    }

    this.maxVal = this.sliceArray.reduce(function(a, b) {
        return Math.max(...a, ...b);
    });
  	// if (tick > TICK_DISPLAY) {
    //   //the apply method allows for a function to be called across
    //   //all values of a given array from a particular reference (being null here)
    //
    //   //first slice off (tick-TICK_DISPLAY)
    //   var sliceArray = [];
    //
    //   for(var i = 0; i < this.fieldHistories.length; i++) {
    //     sliceArray.push(this.fieldHistories[i].slice(tick-TICK_DISPLAY));
    //   }
    //
    //   this.maxVal = sliceArray.reduce(function(a, b) {
    //       return Math.max(a, b);
    //   });
    // } else {
    //   this.maxVal = sliceArray.reduce(function(a, b) {
    //       return Math.max(a, b);
    //   });
    // }

  }

  //I see no reason to update or draw every game tick, only when visuals change.
  update() {};
  draw(ctx) {};
}
