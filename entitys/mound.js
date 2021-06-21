function Mound(game, xPos, yPos) {
	this.game = game;
	this.ctx = game.ctx;

	this.xPos = xPos;
	this.yPos = yPos;

	this.antCount = 0;
	this.larvaCount = 0;
	this.breedableCount = 0;

	this.foodStorage = 0;
	this.lifeTimeCount = 0;
	this.tick = 0;

	this.colony = [];
	this.breedable = [];
	this.standby = [];
	this.larvae = [];

	this.roleHistogram = [];
	this.forageHistogram = [];
	this.roleMemeHistogram = [];
	this.forageMemeHistogram = [];

	this.breedableGeneHistogram = [];
	this.breedableMemeHistogram = [];

	this.deathAges = {
		breeders: [],
		generalists: [],
		foragers: [],
	};
	this.averageAges = {
		breeders: 0,
		generalists: 0,
		foragers: 0,
		total: 0,
	};

	this.averageGen = 0;
	this.minGen = 0;
	this.maxGen = 0;

	this.graph1 = new Graph(game, this);
	this.graph2 = new Graph2(game, this);
	//this.roleHistogramData = this.game.roleGraph;
	//this.forageHistogramData = this.game.forageGraph;

	this.larvaPeriod = 0;
	this.larvaPeriodData = [];

	this.foragePeriod = 0;
	this.foragePeriodData = [];
	Entity.call(this, game, xPos * CELL_SIZE, yPos * CELL_SIZE);
}

Mound.prototype = new Entity();
Mound.prototype.constructor = Mound;

Mound.prototype.update = function() {
	this.tiles[this.yPos][this.xPos].outPheromone=MAX_PHEROMONE;
	this.lifeTimeCount++;
	if (this.colony.length <= 0) {
		this.game.runNextSetting();
	}
	if (this.lifeTimeCount >= GAME_LIFE_TIME) {
		/*
		if (parseInt(document.getElementById("runNum").innerHTML) < MAX_RUN_COUNT) {
			this.game.restart();
		} else {
			this.game.endGame();
		}
		*/
		this.game.runNextSetting();
	}

	//console.log("Standby: " + this.standby.length);
	if (RANDOM_OR_QUEUE_TOGGLE) {
		while (this.canGrow() && this.standby.length > 0) {
			var size = this.standby.length;

			var rng = Math.floor(size * Math.random());
			this.standby[rng].eggLay();
			this.standby.splice(rng, 1);
		}
	} else {
		while (this.canGrow() && this.standby.length > 0) {
			this.standby[0].eggLay();
			this.standby.shift();
		}
	}


	if (BREEDER_PENALTY_TOGGLE) {
		for (var i = 0; i < this.standby.length; i++) {
			this.standby[i].standbyPenalty += BREEDER_PENALTY_AMOUNT;
		}
	}

	if (BREEDER_STANDBY) {
		var size = this.standby.length;
		for (var i = 0; i < size; i++) {
			var ant = this.standby[i];
			if (ant.standbyCounter > STANDBY_THRESHOLD) {
				ant.standbyCounter = 0;
				ant.role = INTERIM;
				this.standby.splice(i, 1);
				i--;
				size--;
			}
		}
	}
}

Mound.prototype.updatePeriod = function() {
	this.tick++;
	this.larvaPeriodData.push(this.larvaPeriod);
	this.larvaPeriod = 0;
	this.foragePeriodData.push(this.foragePeriod);
	this.foragePeriod = 0;

	this.updateHistograms();

	this.updateBreedableAnts();
	this.updateGeneration();
	this.graph1.updatePeriod();
	this.graph2.updatePeriod();

	this.calculateAvgAges();

	if(PRINT_RESULTS) {
		console.log("Tick #:" + this.tick +
					" Cycle #:" + this.lifeTimeCount +
					" Ant:" + this.antCount +
					" Larva:" + this.larvaCount +
					" Food:" + this.foodStorage);
		console.log("Min Gen:" + this.minGen +
					" Avg Gen:" + this.averageGen +
					" Max Gen:" + this.maxGen);
		console.log(`Avg Breeder Age: ${this.averageAges.breeders}`);
		console.log(`Avg Generalist Age: ${this.averageAges.generalists}`);
		console.log(`Avg Forager Age: ${this.averageAges.foragers}`);
		console.log(`Avg Age: ${this.averageAges.total}`);
		/*
		console.log("Food Total: " + foods);
		console.log("Standby Total: " + this.standby.length);
		console.log("Food Foraged: " + this.foragePeriod);
		console.log("Larva Created: " + this.larvaPeriod);
		*/
	}
}

Mound.prototype.draw = function() {
	this.ctx.fillStyle = "green";

	this.ctx.fillRect(this.x, this.y, CELL_SIZE, CELL_SIZE);
	this.ctx.fillStyle = "black";
	this.ctx.strokeRect(this.x, this.y, CELL_SIZE, CELL_SIZE);
}

Mound.prototype.drawPeriod = function() {
	if(!SIMPLE_INFO) {
		this.ctx.clearRect(0, SIM_Y, SIM_X, this.ctx.height - SIM_Y);

		this.ctx.font = "18px Courier";

		this.genX = 20;
		this.cycleX = 180;
		this.seasonX = 400;
		this.foodX = 615;
		this.ctx.fillStyle = "black";
		this.ctx.fillText("Ant gen Info", this.genX, 630);
		this.ctx.fillText("Cycle Info", this.cycleX, 630);
		this.ctx.fillText("Season Info", this.seasonX, 630);
		this.ctx.fillText("Food/Env Info", this.foodX, 630);

		this.ctx.font = "14px Courier";
		this.ctx.fillText("Minimum gen#: " + this.minGen, this.genX, 655); //minimum, average and maximum
		this.ctx.fillText("Average gen#: " + this.averageGen, this.genX, 675); //generations of the ant population
		this.ctx.fillText("Maximum gen#: " + this.maxGen, this.genX, 695);

		this.ctx.fillText("Current cycle#: " + this.game.updateCounter, this.cycleX, 655);
		this.ctx.fillText("Season end    : " + (this.game.updateCounter - this.game.seasonCounter + SEASON_LENGTH), this.cycleX, 675);
		this.ctx.fillText("Season cycle #: " + this.game.seasonCounter, this.cycleX, 695);
		this.ctx.fillText("Cycle's left  : " + (SEASON_LENGTH - this.game.seasonCounter), this.cycleX, 715);

		this.ctx.fillText("Current Season : " + (this.game.currentSeason + 1),	this.seasonX, 655)
		this.ctx.fillText("Seasons in Year: " + NUM_OF_SEASONS,	this.seasonX, 675)

		//these values should be pre-calculated in another location and stored else-where.
		let nonEmpty = this.game.tiles.filter(tile => tile.foodLevel != 0);
		let numFood = nonEmpty.length;
		let totalFood = this.ungatheredFoodData[this.ungatheredFoodData.length-1]
		let avgFood = totalFood/numFood;
		this.ctx.fillText("Num non-empty: " + Math.trunc(numFood),	this.foodX, 655);
		this.ctx.fillText("Avg non-empty: " + Math.trunc(avgFood),	this.foodX, 675);
		this.ctx.fillText("Sum non-empty: " + Math.trunc(totalFood),	this.foodX, 695);
		this.ctx.fillText("Max of each  : " + Math.trunc(MAX_TILE_FOOD/numFood), this.foodX, 715);
		this.ctx.fillText("Max total    : " + Math.trunc(MAX_TOTAL_FOOD/numFood), this.foodX, 735);
	}

	this.graph1.drawPeriod();
	this.graph2.drawPeriod();
}

Mound.prototype.setTiles = function(tiles) {
	this.tiles = tiles;
}

Mound.prototype.calculateAvgAges = function() {
	var breedAvg = this.deathAges.breeders.length === 0 ? 0 :
		this.deathAges.breeders.reduce((a,b) => (a+b))/this.deathAges.breeders.length;
	var genAvg = this.deathAges.generalists.length === 0 ? 0 :
		this.deathAges.generalists.reduce((a,b) => (a+b))/this.deathAges.generalists.length;
	var forageAvg = this.deathAges.foragers.length === 0 ? 0 :
		this.deathAges.foragers.reduce((a,b) => (a+b))/this.deathAges.foragers.length;

	var totalLen = this.deathAges.breeders.length + this.deathAges.generalists.length + this.deathAges.foragers.length;
	var avg = totalLen === 0 ? 0 :
	this.deathAges.breeders.concat(this.deathAges.generalists.concat(this.deathAges.foragers)).reduce((a,b) => (a+b))/totalLen;

	this.averageAges = {
		breeders: breedAvg,
		generalists: genAvg,
		foragers: forageAvg,
		total: avg,
	}
}

Mound.prototype.spawnAnt = function() {
	var dev = Math.random() * MAX_DEVIATION;
	dev = Math.random() >= 0.5 ? dev : -dev;
	var dev2 = Math.random() * MAX_DEVIATION;
	dev2 = Math.random() >= 0.5 ? dev2 : -dev2;
	var randomAnt = this.breedable[Math.floor(this.breedable.length*Math.random())];
	var ant;
	if (randomAnt === undefined) {
		ant = new Ant(this.game,
					  Math.round(XSIZE/2)-1,
				  	  Math.round(YSIZE/2)-1,
					  this.colony,
					  this.tiles,
					  this,
					  0.5,
					  1,
					  0);
	} else if (Math.random() < MUTATION_RATE) {
		ant = new Ant(this.game,
					  Math.round(XSIZE/2)-1,
				  	  Math.round(YSIZE/2)-1,
					  this.colony,
					  this.tiles,
					  this,
					  randomAnt.geneRole + dev,
					  randomAnt.geneForage + dev2,
					  randomAnt.generation + 1);
	} else {
		ant = new Ant(this.game,
					  Math.round(XSIZE/2)-1,
				  	  Math.round(YSIZE/2)-1,
					  this.colony,
					  this.tiles,
					  this,
					  randomAnt.geneRole,
					  randomAnt.geneForage,
					  randomAnt.generation + 1);
	}

	this.colony.push(ant);
	this.game.addEntity(ant);
	this.antCount++;
}

Mound.prototype.removeAnt = function(ant, reason) {
	var colIndex = this.colony.indexOf(ant);
	this.colony.splice(colIndex, 1);
	this.game.removeEntity(ant);
	this.antCount--;
}

Mound.prototype.spawnLarva = function(parent) {
	var larva = new Larva(this.game, this, parent);
	this.larvae.push(larva);
	this.game.addEntity(larva);
	this.larvaCount++;
	this.larvaPeriod++;
}
Mound.prototype.removeLarva = function(larva) {
	var colIndex = this.colony.indexOf(larva);
	this.larvae.splice(colIndex, 1);
	this.game.removeEntity(larva);
	this.larvaCount--;
}

Mound.prototype.canGrow = function() {
	return this.foodStorage > ((this.larvaCount+this.antCount)*EAT_AMOUNT*2) ||
		   (BREED_TOGGLE) /*&& this.foodStorage > EAT_AMOUNT)*/;
}

Mound.prototype.updateHistograms = function() {
    var roleHistogram = [];
    var forageHistogram = [];
    var roleMemeHistogram = [];
    var forageMemeHistogram = [];

    var breedableGeneHistogram = [];
    var breedableMemeHistogram = [];

	for (var i = 0; i < 20; i++) {
	    roleHistogram.push(0);
	    roleMemeHistogram.push(0);
	    forageHistogram.push(0);
	    forageMemeHistogram.push(0);
	    breedableGeneHistogram.push(0);
	    breedableMemeHistogram.push(0);
    }
	for (var i = 0; i < this.colony.length; i++) {
	    var ant = this.colony[i];

	    //we want a function that converts a particular ant.geneRole real
	    //in the range [0,1] to a integer between [0, 19] based on what multiple of
	    //0.05 they are (starting at 0).

	    //so if we multiply by 20 to to get [0,20] then floor/trunc we get what we want.
	    // I tested this and out of 20 million Math.random real-values
	    //in the range [0,1), exactly NONE came out different from the if-else tree.

	    //there is the potential that a ant with a antgene of exactly 1.0 getting mapped
	    //to 20 however, so I wrapped with a try-catch and it should even match
	    //the behavior of throwing all errors into the same bin.
	    if (ant.geneRole >= 0 && ant.geneRole < 1) {
	        roleHistogram[Math.trunc(ant.geneRole * 20)]++;
	    } else {
	        roleHistogram[19]++;
	    }

	    if (ant.geneForage >= 0 && ant.geneForage < 1) {
	        forageHistogram[Math.trunc(ant.geneForage * 20)]++;
	    } else {
	        forageHistogram[19]++;
	    }

	    if (ant.memeRole >= 0 && ant.memeRole < 1) {
	        roleMemeHistogram[Math.trunc(ant.memeRole * 20)]++;
	    } else {
	        roleMemeHistogram[19]++;
	    }

	    if (ant.memeForage >= 0 && ant.memeForage < 1) {
	        forageMemeHistogram[Math.trunc(ant.memeForage * 20)]++;
	    } else {
	        forageMemeHistogram[19]++;
	    }
	}

	for (var i = 0; i < this.breedable.length; i++) {
	    var ant = this.breedable[i];

	    //we want a function that converts a particular ant.geneRole real
	    //in the range [0,1] to a integer between [0, 19] based on what multiple of
	    //0.05 they are (starting at 0).

	    //so if we multiply by 20 to to get [0,20] then floor/trunc we get what we want.
	    // I tested this and out of 20 million Math.random real-values
	    //in the range [0,1), exactly NONE came out different from the if-else tree.

	    //there is the potential that a ant with a antgene of exactly 1.0 getting mapped
	    //to 20 however, so I wrapped with a try-catch and it should even match
	    //the behavior of throwing all errors into the same bin.
	    if (ant.geneRole >= 0 && ant.geneRole < 1) {
	        breedableGeneHistogram[Math.trunc(ant.geneRole * 20)]++;
	    } else {
	        breedableGeneHistogram[19]++;
	    }

	    if (ant.memeRole >= 0 && ant.memeRole < 1) {
	        breedableMemeHistogram[Math.trunc(ant.memeRole * 20)]++;
	    } else {
	        breedableMemeHistogram[19]++;
	    }
	}

	if(PRINT_RESULTS) {
		console.log("breed/forage: " + roleHistogram);
	}
	this.roleHistogram.push(roleHistogram);
	this.forageHistogram.push(forageHistogram);
	this.roleMemeHistogram.push(roleMemeHistogram);
	this.forageMemeHistogram.push(forageMemeHistogram);

	this.breedableGeneHistogram.push(breedableGeneHistogram);
	this.breedableMemeHistogram.push(breedableMemeHistogram);
}

Mound.prototype.updateBreedableAnts = function() {
	var breed = [];
	var breed2 = [];

	// first pass to get better half
	var cutoff = this.getAverageFitness(this.getBreedableAnts());
	for (var i = 0; i < this.colony.length; i++) {
		if (this.colony[i] !== undefined &&
			this.colony[i].overallFitness >= cutoff) {
			breed.push(this.colony[i]);
		}
	}

	// second pass to get the best quarter
	var cutoff2 = this.getAverageFitness(breed);
	for (var i = 0; i < breed.length; i++) {
		if (breed[i] !== undefined &&
			breed[i].overallFitness >= cutoff2) {
			breed2.push(breed[i]);
		}
	}
	this.breedableCount = breed2.length;
	this.breedable = breed2;
}

Mound.prototype.getAverageFitness = function(arr) {
	var total = 0;
	var count = 0;

	for (var i = 0; i < arr.length; i++) {
		if (arr[i] !== undefined) {
			total += arr[i].overallFitness;
			count++;
		}
	}
	return total/count;
}

Mound.prototype.getBreedableAnts = function() {
	var ofAge = [];
	if (BREED_AGE_TOGGLE) {
		for (var i = 0; i < this.colony.length; i++) {
			if (this.colony[i].age >= BREED_AGE) {
				ofAge.push(this.colony[i]);
			}
		}
	} else {
		ofAge = this.colony;
	}
	return ofAge;
}

Mound.prototype.updateGeneration = function() {
	var total = 0;

	for (var i = 0; i < this.colony.length; i++) {
		if (this.colony[i] !== undefined) {
			total += this.colony[i].generation;
		}
	}

	if (this.colony.length > 0) {
		var average = total/this.colony.length;
		this.averageGen = Math.round(average);

		this.minGen = this.colony.reduce(function(min, cur) {
			return cur.generation < min.generation ? cur : min;
		}).generation;
		this.maxGen = this.colony.reduce(function(max, cur) {
			return cur.generation > max.generation ? cur : max;
		}).generation;
	}
}
