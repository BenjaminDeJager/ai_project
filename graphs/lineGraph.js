//ben

//LineGraphs are created at the program's start and fed a
//<fieldPointers> array of pointers to let it track those fields as they change.
//Every updatePeriod it grabs the current value of each field via the pointer and
//store it in a array dedicated to that field.

//every drawPeriod it uses the currently set <tickStart> and <tickEnd> values
//as positive integers
//to determine how to scale/size/shift its stored history of values it has for its given fields.


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
function LineGraph(game, x, y, xSize, ySize, fieldPointers, colors, object/*, tickStart, tickEnd*/) {
  Object.assign(this, {game, game.ctx,
    x, y,
    xSize, ySize,
    fieldPointers, colors, object/*, tickStart, tickEnd*/});

  //creating a map object from each field in fieldPointers to a array for holding values
  //taken during updatePeriod().
  //these will be used as the "history" when graphing.
  this.fieldHistories = new Map();
  this.fieldPointers.forEach(field => {
    this.fieldHistories.set(field, []);
  });

  this.tickHistory = []; //used to store the game-engine ticks on each
  //updatePeriod call. see updatePeriod() for information.

  this.tickStart = 360; //360 ticks behind the present.
  this.tickEnd = 0; //graph ends at present.

  //the apply method allows for a function to be called across
  //all values of a given array from a particular reference (being null here)
  this.maxVal = Math.max.apply(null, this.fieldHistories);
  //not sure why we need to be applying Math.max to each empty array however.

  // I don't see much need to make graphs Entitys, but whatever.
  Entity.call(this, game, x, y);
}

LineGraph.prototype.updatePeriod = function() {
  //go through each field and push the latest value of each field to its
  //current value.

  this.fieldHistories.forEach(history => {
    history.push(this.field)
  });

  // we want to store the game-time, or "tick" in which
  //these values for taken.

  this.tickHistory = this.game.clo
}

LineGraph.prototype.drawPeriod = function(ctx) {
  this.updateMax();

}

//
LineGraph.prototype.updateMax = function() {
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
LineGraph.prototype.update = function () {};
LineGraph.prototype.draw = function (ctx) {};
