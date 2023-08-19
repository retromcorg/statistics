$('.copybtn').tooltip({
trigger: 'click',
placement: 'bottom'
});

function setTooltip(message, btn) {
$(btn).tooltip('hide')
.attr('data-original-title', message)
.tooltip('show');
}

function hideTooltip(btn) {
setTimeout(function() {
$(btn).tooltip('hide');
}, 1000);
}


$('[data-toggle="tooltip"]').tooltip();   

var clipboard = new ClipboardJS('.copybtn');

clipboard.on('success', function(e) {
setTooltip('Copied!', '.copybtn');
hideTooltip(e.trigger, '.copybtn');
});


function loadPlayerModel() {
let skinViewer = new skinview3d.SkinViewer({
    canvas: document.getElementById("skin_container"),
    skin: `https://minotar.net/skin/${$("#q_uuid").text()}`
});

skinViewer.width = 350;
skinViewer.height = 350;
skinViewer.controls.enableZoom = false
skinViewer.zoom = 0.8;
skinViewer.fov = 85;
skinViewer.animation = new skinview3d.WalkingAnimation();
skinViewer.animation.headBobbing = false;
skinViewer.animation.speed = 0.5;

}

$("#searchForm").on("submit", function(event){
    event.preventDefault();
    window.location = `../player/${$("#search").val()}`;
});
    