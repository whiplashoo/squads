let playersOnDraft = {};
// #TODO:
// - Drag and drop?

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
        escapeMarkup: function(m) { return m; },
        minimumInputLength: 4,
        templateResult: template,
        templateSelection: optionData
    });

    $(".search-entity").on("select2:select", function(e) {
        const selected = e.params.data;
        const id = $(this).data('id');
        const imgURL = "https://d3obiipglq02d0.cloudfront.net/" + selected.s3url + ".png";
        const playerName = selected.text;

        playersOnDraft[id] = { "imgURL": imgURL, "name": playerName, "s3url": selected.s3url };

        upsertImage(id, imgURL, playerName);

        $(this).val('').trigger('change');
        $(this).parent().siblings('.search-selected').html(selected.text);
    });

    $("#formationSelect").change(function() {
        currentFormation = formations[$(this).val()];
        updateDraft();
    });
});

function upsertImage(id, imgURL, playerName) {
    let $draftImg;
    let $draftLabel;
    // If there is already an img for this position on the draft
    if ($("#draft-img-" + id).length) {
        $draftImg = $("#draft-img-" + id);
        $draftLabel = $("#draft-label-" + id);
    } else {
        $draftImg = $("<img crossorigin='anonymous' class='draft-img' id='draft-img-" + id + "'/>");
        $draftLabel = $("<span class='draft-label' id='draft-label-" + id + "'></span>");
    }
    $draftImg.attr("src", imgURL);

    // Remove the first word from the name (probably the first name)
    if (playerName.split(" ").length !== 1) {
        $draftLabel.html(playerName.split(" ").slice(1).join(" "));
    } else {
        $draftLabel.html(playerName);
    }
    

    $("#draft-container-" + id).append([$draftImg, $draftLabel]);
    $("#draft-pos-" + id).hide();
}

function optionData(data, container) {
    $(data.element).attr("data-s3url", data.s3url);
    $(data.element).attr("data-pos", data.pos);
    return data.text;
}

function template(data, container) {
    if (data.text && data.s3url) {
        const pImg = '<div class="column is-one-third"><img crossorigin="anonymous" class="player-img" src="https://d3obiipglq02d0.cloudfront.net/' + data.s3url + '.png"/></div>';
        const pName = '<div class="column"><p class="player-name"><strong>' + data.text + '</strong></p>';
        const pDetails = '<p class="player-details">' + data.club + ' , ' + data.age + ' , ' + data.pos + '</p></div>';
        return '<div class="columns">' + pImg + pName + pDetails + '</div>';
    }
}

function updateTitle(newTitle) {
    let $draftTitle;
    if ($("#draft-title").length) {
        $draftTitle = $("#draft-title");
    } else {
        $draftTitle = $("<span id='draft-title'></span>");
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
    ctx.arc(destX + 100, destY + 100, 40, 0, 2 * Math.PI, false);
    ctx.fillStyle = circleColors[posName];
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.font = "bold 28px system-ui";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(posName.toUpperCase(), destX + 100, destY + 110);
    ctx.closePath();
}

function updateDraft() {
    const positions = $(".position-label");
    const draftContainers = $(".draft-container");
    for (let id = 0; id < 11; id++) {
        const newPos = currentFormation[id];
        const destX = newPos.cx;
        const destY = newPos.cy;
        const posName = newPos.pos;

        $(draftContainers[id]).css({
            "left": destX + "%",
            "top": destY + "%",
        });
        
        let $draftPos;
        if ($("#draft-pos-" + id).length) {
            $draftPos = $("#draft-pos-" + id);
        } else {
            $draftPos = $("<div class='draft-pos' id='draft-pos-" + id + "'> </div>");
            $(draftContainers[id]).append($draftPos);
        }

        $draftPos.css("background-color", circleColors[posName]).html(posName);
        $(positions[id]).css("background-color", circleColors[posName]).html(posName);
    }
}

function prepareCanvas() {
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    const padd = 60;
    const w = canvas.width; //1000
    const h = canvas.height; //1400
    const selects = $(".search-entity");
    const positions = $(".position-label");
    const title = $("#draft-title").html();

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
    ctx.moveTo(440, padd);
    ctx.lineTo(440, padd - padd / 2);
    ctx.lineTo(560, padd - padd / 2);
    ctx.lineTo(560, padd);

    // -- Bot Goal Post --
    ctx.moveTo(440, h - padd);
    ctx.lineTo(440, h - padd + padd / 2);
    ctx.lineTo(560, h - padd + padd / 2);
    ctx.lineTo(560, h - padd);

    // -- Top Penalty Area --
    ctx.moveTo(250, padd);
    ctx.lineTo(250, padd + 200);
    ctx.lineTo(750, padd + 200);
    ctx.lineTo(750, padd);
    ctx.moveTo(400, padd);
    ctx.lineTo(400, padd + 70);
    ctx.lineTo(600, padd + 70);
    ctx.lineTo(600, padd);

    // -- Bot Penalty Area --
    ctx.moveTo(250, h - padd);
    ctx.lineTo(250, h - padd - 200);
    ctx.lineTo(750, h - padd - 200);
    ctx.lineTo(750, h - padd);
    ctx.moveTo(400, h - padd);
    ctx.lineTo(400, h - padd - 70);
    ctx.lineTo(600, h - padd - 70);
    ctx.lineTo(600, h - padd);

    // -- Middle Line --
    ctx.moveTo(padd, h / 2);
    ctx.lineTo(w - padd, h / 2);

    // -- Circles and semi-circles --
    ctx.moveTo(400, padd + 200);
    ctx.quadraticCurveTo(w / 2, padd + 270, 600, padd + 200);
    ctx.moveTo(400, h - padd - 200);
    ctx.quadraticCurveTo(w / 2, h - padd - 270, 600, h - padd - 200);
    ctx.moveTo(w / 2, h / 2);
    ctx.arc(w / 2, h / 2, 60, 0, Math.PI * 2, true);

    // -- Corner quarter-circles --
    ctx.moveTo(padd, padd);
    ctx.arc(padd, padd, 32, 0, Math.PI / 2, false);
    ctx.moveTo(w - padd, padd);
    ctx.arc(w - padd, padd, 32, Math.PI / 2, Math.PI, false);
    ctx.moveTo(w - padd, h - padd);
    ctx.arc(w - padd, h - padd, 32, Math.PI, Math.PI * 1.5, false);
    ctx.moveTo(padd, padd);
    ctx.arc(padd, h - padd, 32, Math.PI * 1.5, 0, false);

    ctx.moveTo(0, 0);
    ctx.closePath();
    ctx.lineWidth = 6;
    ctx.stroke();
    // -- END DRAWING THE FIELD --

    ctx.font = "20px arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Created with CreateFormation.com", 820, 1390);

    for (let i = 0; i < 11; i++) {
        const newPos = currentFormation[i];
        const sel = selects[i];
        const player = playersOnDraft[i.toString()];

        const destX = newPos.cx * w / 100;
        const destY = newPos.cy * h / 100;
        const posName = newPos.pos;

        //  If the select2 select has a value, draw an image, else a simple circle.
        if (player && player.imgURL) {
            const img = document.getElementById("draft-img-" + i);
            ctx.drawImage(img, destX, destY, 200, 200);

            ctx.fillStyle = "#444";
            ctx.fillRect(destX + 20, destY + 200, 160, 40);
            ctx.font = "28px Fira Sans";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(player.name.split(" ").splice(-1), destX + 100, destY + 230);
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
        ctx.fillRect(0, 0, 400, 40);
        ctx.font = "24px Fira Sans";
        ctx.fillStyle = "#f0f600";
        ctx.textAlign = "left";
        ctx.fillText(title, 20, 30);
    }
}



/********************
**  SAVE/LOAD CONFIG
********************/
function saveConfig() {
    let saveData = { title: $('#formation-title').val(), formation: $("#formationSelect").val() };
    for (let p in playersOnDraft) {
        let player = playersOnDraft[p];
        saveData[p] = {name: player.name, id: player.s3url};
    }
    return JSON.stringify(saveData);
}

function loadConfig(loadData) {
    $("#formation-title").val(loadData.title).trigger("change");
    $("#formationSelect").val(loadData.formation).trigger("change");
    // Initialize players
    $(".remove-player").trigger("click");

    for (let i = 0; i < 11; i++) {
        if (loadData[i]) {
            let p = loadData[i];
            loadPlayer(p.id, i);
        }
    }
}

function loadPlayer(s3url, id) {
    // Fetch the preselected item, and add to the control
    const playerSelect = $('.search-entity[data-id="' + id + '"]');
    $.ajax({
        type: 'GET',
        url: '/api/player/p/' + s3url
    }).then(function (data) {

        const option = new Option(data.name, data.id, true, true);
        playerSelect.append(option).trigger('change');

        const imgURL = "https://d3obiipglq02d0.cloudfront.net/" + s3url + ".png?crossorigin";
        const playerName = data.name;

        playersOnDraft[id] = { "name": playerName, "imgURL": imgURL, "s3url": s3url };

        playerSelect.parent().siblings('.search-selected').html(data.name);

        upsertImage(id, imgURL, playerName);
    });
}

/********************
**  EVENT LISTENERS
********************/
$(".position").hover(function() {
    $(this).addClass('focused');
    const select = $(this).find('.search-entity');
    const id = select.data('id');
    $("#draft-pos-" + id).addClass('focused');
}, function() {
    $(this).removeClass('focused');
    const select = $(this).find('.search-entity');
    const id = select.data('id');
    $("#draft-pos-" + id).removeClass('focused');
});

$(".remove-player").on("click", function() {
    const $positionDiv = $(this).parent().parent();
    const id = $positionDiv.find('.search-entity').data('id');
    delete playersOnDraft[id];

    $("#draft-label-" + id).remove();
    $("#draft-img-" + id).remove();
    $("#draft-pos-" + id).show();

    $positionDiv.find('.search-selected').html("");
    $positionDiv.find('.search-entity').val("").trigger("change");
});

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
    this.href = canvas.toDataURL();
    var d = new Date();
    var dateString = d.toLocaleString().replace(/[^\w\s]/gi, '_');
    this.download = $('#formation-title').val() || "formation_" + dateString;
});

$('#formation-title').change(function() {
    updateTitle($(this).val());
});



