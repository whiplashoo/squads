var currentData = {};

$(document).ready(function() {

    prepareCanvas();
    updateDraft();

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
        var targetX = parseInt($(this).data('cx'));
        var targetY = parseInt($(this).data('cy'));

        var imgURL = "https://d3obiipglq02d0.cloudfront.net/" + selected.s3url + ".png";
        var playerName = selected.text;

        currentData[id] = { "imgURL": imgURL, "name": playerName, "s3url": selected.s3url };

        upsertImage(id, imgURL, playerName);

        $(this).val('').trigger('change');
        $(this).parent().siblings('.search-selected').html(selected.text);
    });

    $(".search-entity").on("select2:unselect", function(e) {
        var selected = e.params.data;
        var id = $(this).data('id');
        $(this).parent().siblings('.search-selected').html('');
    });

    $("#formationSelect").change(function() {
        currentFormation = formations[$(this).val()];
        updateDraft();
    });
});

function upsertImage(id, imgURL, playerName) {
    var $draftImg;
    var $draftLabel;
    // If there is already an img for this position on the draft
    if ($("#draft-img-" + id).length) {
        $draftImg = $("#draft-img-" + id);
        $draftLabel = $("#draft-label-" + id);
    } else {
        $draftImg = $("<img crossorigin='anonymous' class='draft-img' id='draft-img-" + id + "'/>");
        $draftLabel = $("<span class='draft-label' id='draft-label-" + id + "'></span>");
    }
    $draftImg.attr("src", imgURL); 
    $draftLabel.html(playerName.split(" ").splice(-1));
    
    $("#draft-container-" + id).append([$draftImg, $draftLabel])
    $("#draft-pos-" + id).hide();
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

function updateTitle(newTitle) {
    var $draftTitle;
    if ($("#draft-title").length) {
        $draftTitle = $("#draft-title");
    } else {
        $draftTitle = $("<span id='draft-title'></span>")
        $("#draft").append($draftTitle);
    }
    if (newTitle !== "") {
        $draftTitle.html(newTitle);
    } else {
        $draftTitle.remove();
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

function updateDraft() {
    let draftW = $('#draft').width();
    let draftH = $('#draft').height();
    var positions = $(".position-label");
    var draftContainers = $(".draft-container");
    for (var id = 0; id < 11; id++) {
        var newPos = currentFormation[id];
        var destX = newPos.cx;
        var destY = newPos.cy;
        var posName = newPos.pos;

        $(draftContainers[id]).css({
            "left": destX + "%",
            "top": destY + "%",
        })
        
        if ($("#draft-pos-" + id).length) {
            var $draftPos = $("#draft-pos-" + id);
        } else {
            var $draftPos = $("<div class='draft-pos' id='draft-pos-" + id + "'> </div>");
            $(draftContainers[id]).append($draftPos);
        }
        
        $draftPos.html(posName).css({
            "background-color": circleColors[posName]
        });
    }
}

function prepareCanvas() {
    var canvas = document.getElementById("canvas1");
    var ctx = canvas.getContext("2d");
    var padd = 30;
    var w = canvas.width; //500
    var h = canvas.height; //700
    var selects = $(".search-entity");
    var positions = $(".position-label");
    var title = $("#draft-title").html();

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

    for (var i = 0; i < 11; i++) {
        var newPos = currentFormation[i];
        var sel = selects[i];
        var player = currentData[i.toString()];

        var destX = newPos.cx * w / 100;
        var destY = newPos.cy * h / 100;
        var posName = newPos.pos;

        //  If the select2 select has a value, draw an image, else a simple circle.
        if (player && player.imgURL) {
            var img = document.getElementById("draft-img-" + i);
            ctx.drawImage(img, destX, destY, 100, 100);

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

    if (title) {
        ctx.fillStyle = "#444";
        ctx.fillRect(0, 0, 200, 20);
        ctx.font = "12px Fira Sans";
        ctx.fillStyle = "#f0f600";
        ctx.textAlign = "left";
        ctx.fillText(title, 10, 15);
    }   
    // -- END SETTING SELECTS VALUES --

}

$(".position").hover(function() {
    $(this).addClass('focused');
    var select = $(this).find('.search-entity');
    var id = select.data('id');
    $("#draft-pos-" + id).addClass('focused');
}, function() {
    $(this).removeClass('focused');
    var select = $(this).find('.search-entity');
    var id = select.data('id');
    $("#draft-pos-" + id).removeClass('focused');
});

$(".remove-player").on("click", function() {
    var $positionDiv = $(this).parent().parent();
    var id = $positionDiv.find('.search-entity').data('id');
    delete currentData[id];

    $("#draft-label-" + id).remove();
    $("#draft-img-" + id).remove();
    $("#draft-pos-" + id).show();

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

function loadPlayer(s3url, id) {
    // Fetch the preselected item, and add to the control
    var playerSelect = $('.search-entity[data-id="' + id + '"]');
    $.ajax({
        type: 'GET',
        url: '/api/player/p/' + s3url
    }).then(function (data) {

        var option = new Option(data.name, data.id, true, true);
        playerSelect.append(option).trigger('change');

        var imgURL = "https://d3obiipglq02d0.cloudfront.net/" + s3url + ".png?crossorigin";
        var playerName = data.name;

        currentData[id] = { "name": playerName, "imgURL": imgURL, "s3url": s3url };

        playerSelect.parent().siblings('.search-selected').html(data.name);

        upsertImage(id, imgURL, playerName);
    });
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
    prepareCanvas();
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



