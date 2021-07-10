var socket = io.connect("http://76.28.146.35:8888");
var context;
var RUN = 2000;
var xDelta = 1;
var height = 400;
var width = 1000;

socket.on("connect", function() {
    console.log("connected on output");
});

function rgb(r, g, b) {
    return "rgb(" + r + "," + g + "," + b + ")";
};

document.addEventListener("DOMContentLoaded", function(event) { 

    context = document.getElementById("chart").getContext("2d");
    context.fillStyle = "#eeeeee";
    context.fillRect(0, 0, width, height);
    context.fillRect(0, 450, width, height);
    context.fillRect(0, 900, width, height);
    context.fillRect(0, 1350, width, height);
    context.fillRect(0, 1800, width, height);

    document.getElementById("queryButton").addEventListener("click", function (e) {
        var query = document.getElementById("runToQuery").value;
        //if (query[0] == 's') {
        //    RUN = 2000;
        //} else {
        //    RUN = 4000;
        //}
        if (query !== "" && query !== null) {
                socket.emit("loadAnts", {run: query, mode: "runs2021"});
        } else {
            console.log("Query Empty");
        }
    }, false);
});

socket.on("loadAnts", function(e) {
    var finishedOnlyToggle = document.getElementById("finishedOnlyToggle").checked;
    var prematureOnlyToggle = document.getElementById("prematureOnlyToggle").checked;
    var array = e.slice(0, 200);
    var completed = [];
    var premature = [];
    for (var i = 0; i < array.length; i++) {
        if (array[i].ants.length >= RUN-1) {
            completed.push(array[i]);
        } else {
            premature.push(array[i]);
        }
    }
    
    console.log("finish percent: " + (Math.round(completed.length/array.length*width)/10));
    if (finishedOnlyToggle) {
        parseData(completed);
    } else if (prematureOnlyToggle) {
        parseData(premature);
    } else {
        parseData(array);
    }
});

function parseData(data) {	
    var arrAnt = [];
    var arrFood = [];
    var arrLarva = [];
    var arrFoodPeriod = [];
    var arrLarvaPeriod = [];

    for (var i = 0; i < RUN; i++) {
        arrAnt.push(0);
        arrFood.push(0);
        arrLarva.push(0);
        arrFoodPeriod.push(0);
        arrLarvaPeriod.push(0);
    }

    var maxAnt = 0;
    var maxFood = 0;
    var maxLarva = 0;
    var maxFoodPeriod = 0;
    var maxLarvaPeriod = 0;

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].ants.length; j++) {
            arrAnt[j] += data[i].ants[j];
            arrFood[j] += data[i].food[j];
            arrLarva[j] += data[i].larva[j];
            //arrFoodPeriod[j] += data[i].foragePeriod[j]/data.length;
            //arrLarvaPeriod[j] += data[i].larvaPeriod[j]/data.length;
        }
    }

    for (var i = 0; i < arrAnt.length; i++) {
        if (arrAnt[i] > maxAnt) {
            maxAnt = arrAnt[i];
        }
        if (arrFood[i] > maxFood) {
            maxFood = arrFood[i];
        }
        if (arrLarva[i] > maxLarva) {
            maxLarva = arrLarva[i];
        }
        //if (arrFoodPeriod[i] > maxFoodPeriod) {
        //    maxFoodPeriod = arrFoodPeriod[i];
        //}
        //if (arrLarvaPeriod[i] > maxLarvaPeriod) {
        //    maxLarvaPeriod = arrLarvaPeriod[i];
        //}
    }
    
    var histogramRole = [];
    var histogramForage = [];

    for (var i = 0; i < RUN; i++) {
        var slice = [];
        var slice2 = [];
        for (var j = 0; j < 20; j++) {
            slice.push(0);
            slice2.push(0);
        }
        histogramRole.push(slice);
        histogramForage.push(slice2);
    }
   
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < RUN; j++) {
            for (var k = 0; k < 20; k++) {
                if (data[i].roleHistogram[j] !== undefined && data[i].memeHistogram[j] !== undefined) {
                    histogramRole[j][k] += data[i].roleHistogram[j][k];
                    histogramForage[j][k] += data[i].memeHistogram[j][k];
                }            
            }
        }
    }

    var obj = {
        ant: arrAnt,
        food: arrFood,
        larva: arrLarva,
        //foodPeriod: arrFoodPeriod,
        //larvaPeriod: arrLarvaPeriod,
        maxAnt: maxAnt,
        maxFood: maxFood,
        maxLarva: maxLarva,
        //maxFoodPeriod: maxFoodPeriod,
        //maxLarvaPeriod: maxLarvaPeriod,
        histogramRole: histogramRole,
        histogramForage: histogramForage
    };
    
    console.log(obj);
    console.log(data);
    drawData(obj, context);
    var str = formatRole(obj);
    //download(document.getElementById("runToQuery").value, str);
    str = formatForage(obj);
    //download(document.getElementById("runToQuery").value+"-f", str);
}

function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    pom.click();
}

function formatRole(obj) {
    var str = "";
    for (var i = 0; i < RUN; i++) {
        str += obj.histogramRole[i] + "\n";
    }

    return str;
}

function formatForage(obj) {
    var str = "";
    for (var i = 0; i < RUN; i++) {
        str += obj.histogramForage[i] + "\n";
    }

    return str;
}

function drawData(obj, ctx) {
    ctx.clearRect(0, 0, 1400, 3200);
    ctx.textAlign = "start";
    var maxAnt = obj.maxAnt + obj.maxAnt * 0.05;
    var maxFood = obj.maxFood + obj.maxFood * 0.05;
    var maxLarva = obj.maxLarva + obj.maxLarva * 0.05;
    //var maxFoodPeriod = obj.maxFoodPeriod + obj.maxFoodPeriod * 0.05;
    //var maxLarvaPeriod = obj.maxLarvaPeriod + obj.maxLarvaPeriod * 0.05;

    ctx.fillStyle = "#eeeeee";
    ctx.fillRect(0, 0, width, height);
    ctx.fillRect(0, 450, width, height);
    ctx.fillRect(0, 900, width, height);
    ctx.fillRect(0, 1350, width, height);
    ctx.fillRect(0, 1800, width, height);
    ctx.fillRect(0, 2250, width, height);
    ctx.fillRect(0, 2700, width, height);

    var antColor = "#000000";

    var initAnt = 0;
    var initFood = 450;
    var initLarva = 900;
    //var initFoodPeriod = 1350;
    //var initLarvaPeriod = 1800;
    var initHistogramRole = 2250;
    var initHistogramForage = 2700;

    drawGraph(ctx, antColor, initAnt, obj.ant, maxAnt);
    drawGraph(ctx, antColor, initFood, obj.food, maxFood);
    drawGraph(ctx, antColor, initLarva, obj.larva, maxLarva);
    //drawGraph(ctx, antColor, initFoodPeriod, obj.foodPeriod, maxFoodPeriod);
    //drawGraph(ctx, antColor, initLarvaPeriod, obj.larvaPeriod, maxLarvaPeriod);
    drawHistogram(ctx, initHistogramRole, obj.histogramRole, obj.ant);
    drawHistogram(ctx, initHistogramForage, obj.histogramForage, obj.ant);
    label(ctx);
}

function drawGraph(ctx, color, start, obj, maxVal) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    var initAnt = height + start - Math.floor(obj[0]/maxVal*height);
    ctx.moveTo(0,initAnt);
    for (var i = RUN/width; i < RUN; i += RUN/width) {
        var yPos = height + start - Math.floor(obj[i]/maxVal*height);
        ctx.lineTo(i/(RUN/width), yPos);
    }
    ctx.stroke();
    ctx.closePath();

    ctx.fillStyle = "#000000";
    ctx.fillText(Math.ceil(maxVal), 1010, start+10);
    ctx.fillText(Math.ceil(3*maxVal/4), 1010, start+110);
    ctx.fillText(Math.ceil(2*maxVal/4), 1010, start+210);
    ctx.fillText(Math.ceil(maxVal/4), 1010, start+310);
    ctx.fillText(width, 500, start+410);
    ctx.fillText(2000, width, start+410);
}

function drawHistogram(ctx, start, obj, counts, label) {
    for (var i = 0; i < RUN; i++) {
        for (var j = 0; j < 20; j++) {
            fill(ctx, obj[i][j]/counts[i], start, i, 19 - j);
        }
    }
    ctx.fillStyle = "Black";
    ctx.fillText(label, width / 2 - 30, start + height + 10);
}

function fill(ctx, color, start, x, y) {
    var base = 16;
    var c = color * (base - 1) + 1;
    c = 511 - Math.floor(Math.log(c) / Math.log(base) * 512);
    if (c > 255) {
        c = c - 256;
        ctx.fillStyle = rgb(c, c, 255);
    }
    else {
        //c = 255 - c;
        ctx.fillStyle = rgb(0, 0, c);
    }

    ctx.fillRect(x * xDelta,
		            start + (y * height / 20),
				    xDelta,
					height / 20);

}

function label(ctx) {
    ctx.fillStyle = "#000000";
    ctx.fillText("Forager", 1010, 2260);
    ctx.fillText("Breeder", 1010, 2640);
    ctx.fillText("Explorer", 1010, 2710);
    ctx.fillText("Exploiter", 1010, 3090);
    ctx.textAlign = "center";
    ctx.fillText("Ants", 500, 430);
    ctx.fillText("Food", 500, 880);
    ctx.fillText("Larvae", 500, 1330);
    //ctx.fillText("Food per Period", 500, 1780);
    //ctx.fillText("Larvae per Period", 500, 2230);
    ctx.fillText("Breeder vs Forager", 500, 2680);
    ctx.fillText("Exploiter vs Explorer", 500, 3130);
}