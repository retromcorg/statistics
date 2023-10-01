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
if (checkWebGLSupport()) {
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
else {
$("#skin_container").hide();
   $("#playerImg").attr({
	           "src": `https://visage.surgeplay.com/full/250/${$("#q_uuid").text()}`
	       }).show();
}
}

$("#searchForm").on("submit", function(event){
    event.preventDefault();
    window.location = `../player/${$("#search").val()}`;
});
    

$("#leaderboard").change(function(event) {
	event.preventDefault();
	$.ajax({
		url: `https://j-stats.xyz/api/leaderboard`,
		method: "GET",
		data: {
			type: $(this).val()
		},
		success: function(response) {
		
			$("th.type").text(response.name)
			let builder = '';
			response.data.forEach((val, key) => {
				builder += `<tr>`;
				builder += `<td>${key+1}</td>`;
				builder += `<td><img src="https://crafatar.com/avatars/${val.uuid}?size=128&overlay"></td>`;
				builder += `<td><a href="./player/${val.uuid}">${val.username}</a></td>`;
				builder += `<td>${val[$(this).val()]}</td>`;
				builder += `</tr>`;
			});

			$("tbody.data").append(builder);

		  console.log("Success:", response);
		},
		error: function(xhr, status, error) {
		  console.error("Error:", error);
		}
	  });
});

function checkWebGLSupport() {
	    if (window.WebGLRenderingContext) {
		        const canvas = document.createElement("canvas");
		        const context = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

		        if (context && context instanceof WebGLRenderingContext) {
				        return true;
				    } else {
					            return false;
					        }
		        } else {
				    return false;
				    }
	    }
