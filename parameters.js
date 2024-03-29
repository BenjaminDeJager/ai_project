// main
var CELL_SIZE = 12;
var XSIZE = Math.floor(800/CELL_SIZE);
var YSIZE = Math.floor(600/CELL_SIZE);
var SIM_X = 800;
var SIM_Y = 600;
var CHART_X = 400;
var CHART_Y = 600;
var CHART_BOTTOM_Y = 200;

var TICK_DISPLAY = 360;

var NORTH = 0;
var EAST = 1;
var SOUTH = 2;
var WEST = 3;

var GAME_LIFE_TIME = 1000000;
var UPDATE_PERIOD = 100;
var DRAW_PERIOD = 10;

var MAX_RUN_COUNT = 10;

// mound
var INIT_ANTS = 10;

// ant
var EXPLORE = 0;
var EXPLOIT = 1;
var LAY_EGG = 2;
var EGG_DOWN_TIME = 3;
var STANDBY = 4;
var INTERIM = 5;

var BREED_AGE = 100;
var BREED_AGE_TOGGLE = true;

var EXTREME_GENE_TOGGLE = false;
var RANDOM_OR_QUEUE_TOGGLE = true;
var SUM_OR_MAX_FITNESS_TOGGLE = true;
var ROLE_GENE_TOGGLE = true;

var MEME_TOGGLE = true;
var MEME_LEARNING = true;
var ELITE_TEACHERS = true;
var RANDOM_NUDGE = true;
var ENVIRONMENT_NUDGE = true;
var SOCIAL_SELECT = false;
var ENVIRONMENT_SELECT = false;

var GENE_LIFE_TOGGLE = true;
var MIN_AGE = 100;
var MIN_CHANCE_TO_DIE = 0.001;
var MAX_CHANCE_TO_DIE = 0.004;

var GENE_BREED_SPEED_TOGGLE = true;
var MAX_LAY_TIME = 100;
var MIN_LAY_TIME = 10;

var GENE_FOOD_CARRY_TOGGLE = true;
var MAX_ANT_FOOD = 10;
var MIN_ANT_FOOD = 1;

var GENE_ENERGY_TOGGLE = true;
var MAX_ENERGY = 500;
var MIN_ENERGY = 50;
var ENERGY_DECAY = 5;

var DEATH_AGE = 0;
var DEATH_HUNGER = 1;

//var EFFECT_TOGGLE = true;

var BREED_TOGGLE = true;

var BREEDER_STANDBY = true;
var STANDBY_THRESHOLD = 0;

var BREEDER_PENALTY_TOGGLE = true;
var BREEDER_PENALTY_AMOUNT = 0;

var FORAGE_WEIGHT = 1;
var BREED_WEIGHT = 5;

var HUNGER_THRESHHOLD = 250;

var EAT_AMOUNT = 1;
var MUTATION_RATE = 0.05;
var MAX_DEVIATION = 0.1;

var OUTBOUND = 0;
var INBOUND = 1;

// larva

var MATURE_TIME = 100;

//tile
var MAX_PHEROMONE = MAX_ENERGY;
var MULT = Math.ceil(MAX_PHEROMONE/10);
var DECAY_RATE = Math.ceil(MAX_PHEROMONE/200);
var MAX_TILE_FOOD = 10000;
var FOOD_ABUNDANCE = 0.01;

var FOOD_REGEN_AMOUNT = 0;
var FOOD_REPLENISH_AMOUNT = 0;
var FOOD_REGEN_RATE = 0;
var FOOD_REPLENISH_RATE = 0;
var SEASON_LENGTH = 0;

var MAX_TOTAL_FOOD = 0;
var FOOD_DENSITY = 0;

var PRINT_RESULTS;
var DOWNLOAD_RESULTS;
var SIMPLE_INFO;
var DRAW_ANT_PORTION;
var DRAW_TILE_ABSTRACT;
var HIGHLIGHT_CLICKS = true;
var GRAPH_SHIFT = 0; //# cycles to shift the graphs by.
var GRAPH_TIME = 360; //# cycles to have in the graphs.
