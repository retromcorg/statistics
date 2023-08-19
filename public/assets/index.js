
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