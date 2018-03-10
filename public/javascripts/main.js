var currentData = {};
var currentTitle = "";

$(document).ready(function() {

    prepareCanvas();

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
        minimumInputLength: 4,
        templateResult: template,
        templateSelection: optionData
    });


    $(".search-entity").on("select2:select", function(e) {
        var selected = e.params.data;
        var id = $(this).data('id');

        var imgURL = "https://s3.eu-west-2.amazonaws.com/players-whidev/" + selected.s3url + ".png";

        currentData[id] = { "imgURL": imgURL, "name": selected.text };

        updateCanvas();

        $(this).val('').trigger('change');

        $(this).parent().siblings('.search-selected').html(selected.text);
    });

    $(".search-entity").on("select2:unselect", function(e) {
        var selected = e.params.data;
        var id = $(this).data('id');
        updateCanvas();
        $(this).parent().siblings('.search-selected').html('');
    });

    $("#formationSelect").change(function() {
        currentFormation = formations[$(this).val()];
        updateCanvas();
    });
});

function optionData(data, container) {
    $(data.element).attr("data-s3url", data.s3url);
    $(data.element).attr("data-pos", data.pos);
    return data.text;
}

function template(data, container) {
    if (data.text && data.s3url) {
        var pImg = '<div class="column is-one-third"><img crossorigin="anonymous" class="player-img" src="https://s3.eu-west-2.amazonaws.com/players-whidev/' + data.s3url + '.png"/></div>';
        var pName = '<div class="column"><p class="player-name"><strong>' + data.text + '</strong></p>';
        var pDetails = '<p class="player-details">' + data.club + ' , ' + data.age + ' , ' + data.pos + '</p></div>';
        return '<div class="columns">' + pImg + pName + pDetails + '</div>';
    }
}


function updateCanvas() {
    var selects = $(".search-entity");
    var positions = $(".position-label");

    var canvas = document.getElementById("canvas1");
    var ctx = canvas.getContext("2d");

    // Reset Canvas.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    prepareCanvas();

    // Write the Title
    if (currentTitle !== '') {
        ctx.fillStyle = "#444";
        ctx.fillRect(0, 0, 200, 20);
        ctx.font = "12px Fira Sans";
        ctx.fillStyle = "#f0f600";
        ctx.textAlign = "left";
        ctx.fillText(currentTitle, 10, 15);
    }
    

    for (var i = 0; i < 11; i++) {
        var newPos = currentFormation[i];
        var sel = selects[i];
        var player = currentData[i.toString()];

        var destX = newPos.cx;
        var destY = newPos.cy;
        var posName = newPos.pos;

        //  If the select2 select has a value and we are on the visible canvas1, draw an image, else a simple circle.
        if (player && player.imgURL) {
            // Draw the image to the new newPosition
            var imgURL = player.imgURL + "?crossorigin"
            var imageObj = new Image();

            
            imageObj.crossOrigin = "anonymous";
            imageObj.onload = drawCanvasImage(canvas, ctx, imageObj, destX, destY);

            // .src always after onload event
            imageObj.src = imgURL;

            ctx.fillStyle = "#444";
            ctx.fillRect(destX + 10, destY + 100, 80, 20);
            ctx.font = "14px Fira Sans";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(player.name.split(" ").splice(-1), destX + 50, destY + 115);
        } else {
            drawPositionCircle(ctx, posName, destX, destY, "#fff");
        }

        // Set the new attributes for each position.
        sel.setAttribute("data-id", i);
        sel.setAttribute("data-cx", destX);
        sel.setAttribute("data-cy", destY);
        $(positions[i]).css("background-color", circleColors[posName]).html(posName);
    }
}

var drawCanvasImage = function(canvas, ctx, imageObj, destX, destY) {
    return function() {
        ctx.drawImage(imageObj, destX, destY, 100, 100);
        localStorage.setItem( "savedImageData", canvas.toDataURL("image/png") );
    }
}

function drawPositionCircle(ctx, posName, destX, destY, color) {
    ctx.beginPath();
    ctx.arc(destX + 50, destY + 50, 20, 0, 2 * Math.PI, false);
    ctx.fillStyle = circleColors[posName];
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.font = "bold 14px system-ui";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(posName.toUpperCase(), destX + 50, destY + 55);
    ctx.closePath();
}


function prepareCanvas() {
    var canvas = document.getElementById("canvas1");
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

    ctx.font = "10px arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Created with CreateFormation.com", 410, 695);

    // -- START DRAWING THE POSITION CIRCLES --
    var selects = $(".search-entity");
    var positions = $(".position-label");
    for (var i = 0; i < 11; i++) {
        var sel = selects[i];
        var newPos = currentFormation[i];
        var destX = newPos.cx;
        var destY = newPos.cy;
        var posName = newPos.pos;

        drawPositionCircle(ctx, posName, destX, destY, "#fff");

        // Set the new attributes for each newPosition
        sel.setAttribute("data-id", i);
        sel.setAttribute("data-cx", destX);
        sel.setAttribute("data-cy", destY);
        $(positions[i]).css("background-color", circleColors[posName]).html(posName);
    }
    // -- END DRAWING THE POSITION CIRCLES --

}

$(".position").hover(function() {
    $(this).addClass('highlight');

    var select = $(this).find('.search-entity');
    var id = select.data('id');
    if (!currentData[id]) {
        var destX = parseInt(select.attr('data-cx'));
        var destY = parseInt(select.attr('data-cy'));
        var posName = currentFormation[select.attr('data-id')].pos;
        var canvas = document.getElementById("canvas1");
        var ctx = canvas.getContext("2d");
        drawPositionCircle(ctx, posName, destX, destY, "red");
    }
}, function() {
    $(this).removeClass('highlight');

    var select = $(this).find('.search-entity');
    var id = select.data('id');
    if (!currentData[id]) {
        var destX = parseInt(select.attr('data-cx'));
        var destY = parseInt(select.attr('data-cy'));
        var posName = currentFormation[select.attr('data-id')].pos;
        var canvas = document.getElementById("canvas1");
        var ctx = canvas.getContext("2d");
        drawPositionCircle(ctx, posName, destX, destY, "#fff");
    }
});

$(".remove-player").on("click", function() {
    var $positionDiv = $(this).parent().parent();
    var id = $positionDiv.find('.search-entity').data('id');
    delete currentData[id];

    updateCanvas();

    $positionDiv.find('.search-selected').html("");
});

$("#download").on("click", function() {
    this.href = document.getElementById("canvas1").toDataURL();
    var d = new Date();
    var dateString = d.toLocaleString().replace(/[^\w\s]/gi, '_');
    this.download = currentTitle || "formation_" + dateString;
});

$('#formation-title').change(function() {
    currentTitle = $(this).val();
    updateCanvas();
})


