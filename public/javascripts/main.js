var currentData = {};

$(document).ready(function() {

    prepareCanvas();
    prepareDraft();

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

        var imgURL = "https://d3obiipglq02d0.cloudfront.net/" + selected.s3url + ".png";

        currentData[id] = { "imgURL": imgURL, "name": selected.text, "s3url": selected.s3url };

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

function loadPlayer(s3url, id) {
    // Fetch the preselected item, and add to the control
    var playerSelect = $('.search-entity[data-id="' + id + '"]');
    $.ajax({
        type: 'GET',
        url: '/api/player/p/' + s3url
    }).then(function (data) {

        var option = new Option(data.name, data.id, true, true);
        playerSelect.append(option).trigger('change');

        var imgURL = "https://d3obiipglq02d0.cloudfront.net/" + s3url + ".png";

        currentData[id] = { "name": data.name, "imgURL": imgURL, "s3url": s3url };

        playerSelect.parent().siblings('.search-selected').html(data.name);



        updateCanvas();
    });
}

function optionData(data, container) {
    $(data.element).attr("data-s3url", data.s3url);
    $(data.element).attr("data-pos", data.pos);
    return data.text;
}

function template(data, container) {
    if (data.text && data.s3url) {
        var pImg = '<div class="column is-one-third"><img crossorigin="anonymous" class="player-img" src="https://d3obiipglq02d0.cloudfront.net/' + data.s3url + '.png"/></div>';
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

            console.log(imgURL);
            var img = $('<img id="dynamic">'); 
            img.attr('src', imgURL);
            console.log(img);
            $('#test').after(img);

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

function updateTitle(newTitle) {
    var canvas = document.getElementById("canvas1");
    var ctx = canvas.getContext("2d");
    // Write the Title
    if (newTitle !== '') {
        ctx.fillStyle = "#444";
        ctx.fillRect(0, 0, 200, 20);
        ctx.font = "12px Fira Sans";
        ctx.fillStyle = "#f0f600";
        ctx.textAlign = "left";
        ctx.fillText(newTitle, 10, 15);
    } else {
        updateCanvas();
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

function prepareDraft() {
    var positions = $(".position-label");
    var draftPositions = $(".draft-pos");
    for (var i = 0; i < 11; i++) {
        var newPos = currentFormation[i];
        var destX = newPos.cx + 30;
        var destY = newPos.cy + 30;
        var posName = newPos.pos;

        $(draftPositions[i]).css({
            "left": destX,
            "top": destY,
            "background-color": circleColors[posName]
        }).html(posName);
    }
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
    $positionDiv.find('.search-entity').val("").trigger("change");
});


/********************
**  SAVE/LOAD CONFIG
********************/
function saveConfig() {
    let saveData = { title: $('#formation-title').val(), formation: $("#formationSelect").val() };
    for (let p in currentData) {
        let player = currentData[p];
        saveData[p] = {name: player.name, id: player.s3url};
    }
    return JSON.stringify(saveData);
}

function loadConfig(loadData) {
    $('#formation-title').val(loadData.title).trigger("change");
    $("#formationSelect").val(loadData.formation).trigger("change");

    for (let i=0; i<11; i++) {
        if (loadData[i]) {
            let p = loadData[i];
            loadPlayer(p.id, i);
        }
    }
}


/********************
**  EVENT LISTENERS
********************/
$('#loadFormation').on("click",function() {
    let loadData = JSON.parse($('#formationDataHolder').val());
    loadConfig(loadData);
    $('.modal').toggleClass('is-active');
    $('html').toggleClass('is-clipped');
});

$('#saveFormation').on("click",function() {
    let save = saveConfig();
    this.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(save);
    let fileName = "createFormation__" + $('#formation-title').val().substring(0,32);
    this.download = fileName.replace(/[^\w]/gi, "_") + ".txt";
});

$('.toggleModal').on("click",function(){
    $('.modal').toggleClass('is-active');
    $('html').toggleClass('is-clipped');
});

$("#download").on("click", function() {
    var canvas = document.getElementById("canvas1");
    var ctx = canvas.getContext("2d");

    var finalCanvas = document.getElementById("finalCanvas");
    var fctx = finalCanvas.getContext("2d");
    fctx.clearRect(0, 0, finalCanvas.width, finalCanvas.height);
    fctx.resetTransform();
    fctx.webkitImageSmoothingEnabled = false;
    fctx.mozImageSmoothingEnabled = false;
    fctx.imageSmoothingEnabled = false;
    fctx.scale(2, 2);
    fctx.drawImage(canvas, 0, 0);

    this.href = finalCanvas.toDataURL();
    var d = new Date();
    var dateString = d.toLocaleString().replace(/[^\w\s]/gi, '_');
    this.download = $('#formation-title').val() || "formation_" + dateString;
});

$('#formation-title').change(function() {
    updateTitle($(this).val());
})



