$(document).ready(function() {

    prepareCanvas("canvas1");
    prepareCanvas("cleanCanvas");

    $(".search-entity").select2({
        ajax: {
            url: "/search",
            dataType: "json",
            delay: 250,
            data: function(params) {
                return { q: params.term };
            },
            processResults: function(data) {
                return { results: data };
            },
            cache: true
        },
        placeholder: "Search for a player...",
        escapeMarkup: function(m) { return m; }, // let our custom formatter work
        allowClear: true,
        minimumInputLength: 4,
        templateResult: template,
        templateSelection: optionData
    });


    $(".search-entity").on("select2:select", function(e) {
        var selected = e.params.data;
        console.log(selected);

        var imgURL = "https://s3.eu-west-2.amazonaws.com/players-whidev/" + selected.s3url + ".png";
        var selName = '<span class="player-name sel-name"><strong>' + selected.text + '</strong></span>';
        var selImg = '<img class="player-img sel-img" id="sel-img"  src="' + imgURL + '"/>';
        var selDetails = '<span class="player-details">' + selected.pos + '</span>';
        //$("#selected").append(selName + selImg + selDetails);

        var canvas = document.getElementById("canvas1");
        var ctx = canvas.getContext("2d");
        var destX = parseInt(this.dataset.cx);
        var destY = parseInt(this.dataset.cy);

        var imageObj = new Image();
        imageObj.src = imgURL;
        imageObj.onload = drawCanvasImage(ctx, imageObj, destX, destY);  
        
        ctx.fillStyle = "#444";
        ctx.fillRect(destX + 10, destY + 100, 80, 20);
        ctx.font = "14px arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(selected.text.split(" ").splice(-1), destX + 50, destY + 115);
    });

    $(".search-entity").on("select2:unselect", function(e) {
        var selected = e.params.data;
        var canvas = document.getElementById("canvas1");
        var source = document.getElementById("cleanCanvas");
        var ctx = canvas.getContext("2d");
        var destX = parseInt(this.dataset.cx);
        var destY = parseInt(this.dataset.cy);
        ctx.drawImage(source, destX, destY, 100, 120, destX, destY, 100, 120);
    });

    $("#formationSelect").change(function() {
        currentFormation = formations[$(this).val()];
        setFormation(currentFormation, "canvas1");
        setFormation(currentFormation, "cleanCanvas");
    });
});

function optionData(data, container) {
    $(data.element).attr("data-s3url", data.s3url);
    $(data.element).attr("data-pos", data.pos);
    return data.text;
}

function template(data, container) {
    if (data.text && data.s3url) {
        var pImg = '<img class="player-img" src="https://s3.eu-west-2.amazonaws.com/players-whidev/' + data.s3url + '.png"/>';
        var pName = '<span class="player-name"><strong>' + data.text + '</strong></span>';
        var pDetails = '<span class="player-details">' + data.club + ' , ' + data.age + ' , ' + data.pos + '</span>';
        return pImg + pName + pDetails;
    }
}


function setFormation(f, canvasId) {
    var selects = $(".search-entity");
    var positions = $(".position");

    var canvas = document.getElementById(canvasId);
    var ctx = canvas.getContext("2d");

    // Reset Canvas.
    ctx.clearRect(0,0,canvas.width,canvas.height);
    prepareCanvas(canvasId);

    for (var i = 0; i < 11; i++) {
        var newPos = currentFormation[i];
        var sel = selects[i];

        var destX = newPos.cx;
        var destY = newPos.cy;
        var posName = newPos.pos;

        //  If the select2 select has a value and we are on the visible canvas1, draw an image, else a simple circle.
        if ($(sel).val() !== "" && canvasId === "canvas1" ) {
            var data = $(sel).select2("data")[0];

            // Draw the image to the new newPosition
            var imgURL = "https://s3.eu-west-2.amazonaws.com/players-whidev/" + data.s3url + ".png";
            var imageObj = new Image();
            
            imageObj.src = imgURL;
            imageObj.onload = drawCanvasImage(ctx, imageObj, destX, destY); 
            
            ctx.fillStyle = "#444";
            ctx.fillRect(destX + 10, destY + 100, 80, 20);
            ctx.font = "14px arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(data.text.split(" ").splice(-1), destX + 50, destY + 115);
        } else {
            drawPositionCircle(ctx, posName, destX, destY);
        }

        // Set the new attributes for each position.
        sel.setAttribute("data-id", i);
        sel.setAttribute("data-cx", destX);
        sel.setAttribute("data-cy", destY);
        $(positions[i]).css("background-color", circleColors[posName]).html(posName);
    }
}

var drawCanvasImage = function(ctx, imageObj, destX, destY) {
    return function() {
         ctx.drawImage(imageObj, destX, destY, 100, 100);
    }
}

function drawPositionCircle(ctx, posName, destX, destY) {
    ctx.beginPath();
    ctx.arc(destX + 50, destY + 50, 20, 0, 2 * Math.PI, false);
    ctx.fillStyle = circleColors[posName];
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.font = "bold 14px system-ui";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(posName.toUpperCase(), destX + 50, destY + 55);
    ctx.closePath();
}

function prepareCanvas(canvasId) {
    var canvas = document.getElementById(canvasId);
    var ctx = canvas.getContext("2d");
    var padd = 30;
    var w = canvas.width; //500
    var h = canvas.height; //700

    // -- START DRAWING THE FIELD --
    ctx.fillStyle = "#52AC5B";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "white";
    ctx.beginPath();

    // -- Outer Lines --
    ctx.moveTo(padd, padd);
    ctx.lineTo(w - padd, padd);
    ctx.lineTo(w - padd, h - padd);
    ctx.lineTo(padd, h - padd);
    ctx.lineTo(padd, padd);

    // -- Top Goal Post --
    ctx.moveTo(220, padd);
    ctx.lineTo(220, padd - padd / 2);
    ctx.lineTo(280, padd - padd / 2);
    ctx.lineTo(280, padd);

    // -- Bot Goal Post --
    ctx.moveTo(220, h - padd);
    ctx.lineTo(220, h - padd + padd / 2);
    ctx.lineTo(280, h - padd + padd / 2);
    ctx.lineTo(280, h - padd);

    // -- Top Penalty Area --
    ctx.moveTo(125, padd);
    ctx.lineTo(125, padd + 100);
    ctx.lineTo(375, padd + 100);
    ctx.lineTo(375, padd);
    ctx.moveTo(200, padd);
    ctx.lineTo(200, padd + 35);
    ctx.lineTo(300, padd + 35);
    ctx.lineTo(300, padd);

    // -- Bot Penalty Area --
    ctx.moveTo(125, h - padd);
    ctx.lineTo(125, h - padd - 100);
    ctx.lineTo(375, h - padd - 100);
    ctx.lineTo(375, h - padd);
    ctx.moveTo(200, h - padd);
    ctx.lineTo(200, h - padd - 35);
    ctx.lineTo(300, h - padd - 35);
    ctx.lineTo(300, h - padd);

    // -- Middle Line --
    ctx.moveTo(padd, h / 2);
    ctx.lineTo(w - padd, h / 2);

    // -- Circles and semi-circles --
    ctx.moveTo(200, padd + 100);
    ctx.quadraticCurveTo(w / 2, padd + 135, 300, padd + 100)
    ctx.moveTo(200, h - padd - 100);
    ctx.quadraticCurveTo(w / 2, h - padd - 135, 300, h - padd - 100)
    ctx.moveTo(w / 2, h / 2);
    ctx.arc(w / 2, h / 2, 60, 0, Math.PI * 2, true);

    // -- Corner quarter-circles --
    ctx.moveTo(padd, padd);
    ctx.arc(padd, padd, 8, 0, Math.PI / 2, false);
    ctx.moveTo(w - padd, padd);
    ctx.arc(w - padd, padd, 8, Math.PI / 2, Math.PI, false);
    ctx.moveTo(w - padd, h - padd);
    ctx.arc(w - padd, h - padd, 8, Math.PI, Math.PI * 1.5, false);
    ctx.moveTo(padd, padd);
    ctx.arc(padd, h - padd, 8, Math.PI * 1.5, 0, false);

    ctx.moveTo(0, 0);
    ctx.closePath();
    ctx.lineWidth = 3;
    ctx.stroke();
    // -- END DRAWING THE FIELD --

    // -- START DRAWING THE POSITION CIRCLES --
    var selects = $(".search-entity");
    var positions = $(".position");
    for (var i = 0; i < 11; i++) {
        var sel = selects[i];
        var newPos = currentFormation[i];
        var destX = newPos.cx;
        var destY = newPos.cy;
        var posName = newPos.pos;

        drawPositionCircle(ctx, posName, destX, destY);

        // Set the new attributes for each newPosition
        sel.setAttribute("data-id", i);
        sel.setAttribute("data-cx", destX);
        sel.setAttribute("data-cy", destY);
        $(positions[i]).css("background-color", circleColors[posName]).html(posName);
    }
    // -- END DRAWING THE POSITION CIRCLES --

}

$('#image').click(function() {
    var imgURL = $('.sel-img').attr("src");

    var canvas = document.getElementById("canvas1");
    var context = canvas.getContext("2d");
    var destX = 0;
    var destY = 0;
    var imageObj = new Image();

    imageObj.onload = function() {
        context.drawImage(imageObj, destX, destY);
    };
    imageObj.src = imgURL;

});

$('#convert').click(function() { convert(); });

function convert() {
    var DOMURL = self.URL || self.webkitURL || self;
    var svgString = new XMLSerializer().serializeToString(document.querySelector('#squad'));

    var svgStringForWebkit = "data:image/svg+xml," + svgString;
    var canvas1 = document.getElementById("canvas1");
    var ctx = canvas1.getContext("2d");

    var img1 = new Image();
    img1.src = svgStringForWebkit;

    img1.onload = function() {
        ctx.drawImage(img1, 0, 0, canvas1.width, canvas1.height);
    };

    var messi = new Image();
    messi.onload = function() {
        ctx.drawImage(messi, 10, 20, canvas1.width, canvas1.height);
    };
    messi.src = document.getElementById('sel-img');



    var dataURL = canvas1.toDataURL("image/png");

    $('#canvas1').show();
    $('#squad').hide();
}