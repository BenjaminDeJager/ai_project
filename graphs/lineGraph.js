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
class LineGraph {
  constructor (
      game,
      x, y,
      sx, sy,
      fieldTuples) {
    Object.assign(this, {
      game,
      x, y,
      sx, sy,
      fieldTuples});

    //remember that fieldtuples should be a array of literals in the form {fieldValue}
    //these will be used as the "history" when graphing by pulling the latest value
    //each updateperiod for each field and then coloring that pixel if "shown" with
    //the color
    this.fields = []
    this.fieldColors = [];
    this.fieldHistories = [];

    this.fieldTuples.forEach(field => {
      this.fields.push(field.pointer); //pointer to the field
      this.fieldColors.push(field.color); //pointer to the color
      this.fieldHistories.push(field.history); //probably empty array for history-storage.

      //as a bonus, because these are all pointers, effectively, caller keeps access
      //and can change the color of any of these on the fly.
    });

    this.numFields = this.fieldHistories.length;
    this.tickHistory = [this.game.clockTick]; //used to store the game-engine ticks on each
    //updatePeriod call. see updatePeriod() for information.

    this.tickStart = 360; //360 ticks behind the present.
    this.tickEnd = 0; //graph ends at present.

    this.totalTime = 0;

    //the apply method allows for a function to be called across
    //all values of a given array from a particular reference (being null here)
    //this.maxVal = Math.max.apply(null, this.fieldHistories);
    //not sure why we need to be applying Math.max to each empty array however.

    // I don't see much need to make graphs Entitys, but whatever.
    Entity.call(this, game, x, y, 360, 180);
  }

  updatePeriod(){
    //go through each field and push the latest value of each field to the top of
    //the array for that field.

    for(var i = 0; i<this.numFields; i++) {
      this.fieldHistories[i].push(this.fields[i]);
      //this feels so wrong, but I think it works?
    }


    // we want to store the game-time, or "tick" in which
    //these values were taken.
    this.totalTime += this.game.clockTick;
    this.tickHistory.push(this.game.update);
    //might run into issues if the game is paused.
    //might need testing for that and add second timer.
  }

  drawPeriod(ctx){
    // this.updateMax();
    // if(this.fieldHistories.size > 0
    //   && this.fieldHistories.values().next().length > 1){
    //   // this.fieldHistories.forEach((fieldHistory, fieldPointer) => {
    //   //   this.ctx.strokeStyle = this.colors[]
    //   // });
    //
    // }
  }

  updateMax() {
  	var tick = this.game
  	if (tick > TICK_DISPLAY) {
      //the apply method allows for a function to be called across
      //all values of a given array from a particular reference (being null here)

      //first slice off (tick-TICK_DISPLAY)

  		var recentAnt = this.antData.slice(tick-TICK_DISPLAY);
  		var recentLarva = this.larvaData.slice(tick-TICK_DISPLAY);

  		this.maxVal = Math.max(...recentAnt,
  							   ...recentLarva);
  	} else {
  		this.maxVal = Math.max(...this.antData,
  							   ...this.larvaData);
  	}

  }

  //I see no reason to update or draw every game tick, only when visuals change.
  update(){};
  draw(ctx){};
}
