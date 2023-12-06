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


let lastValue = null;
let empty = true;

$("#villageSearch").on('paste', function(e) {
	$(e.target).keyup();
  });
  
  $("#villageSearch").keyup(function() {
	let name = $('#villageSearch').val();
	if (name == "" || name.length < 3) {
	  $("#villagestb").html("");
  $(".villagetb").hide();
	  empty = true;
	}else{
	  if(name == lastValue && empty == false){
	   return; 
	  }else{
		  lastValue = name;   
		  empty = false;
	  }
	  
	  $.ajax({
		type: "POST",
		url: "api/searchVillages",
		data: {
		  village: name
		},
		dataType: 'json',
		success: function(data) {
		  if(data.code == 2) {
			$(".villagestb").show().html("No villages found");
		  $(".villagetb").hide();
		  }
		  else {
			let builder = '';
			data.data.forEach((element, key) => {
				builder += `<tr>`
				builder += `<td>${key+1}</td>`
				builder += `<td><a href="./village/${element.uuid}">${element.name}</a></td>`
				builder += `<td><img src="https://crafatar.com/avatars/${element.owner_uuid}?size=25&amp;overlay"> <a href="../player/${element.owner_uuid}"> ${element.owner}</a></td>`
				builder += `<td>${element.claims.toLocaleString()}</td>`
				builder += `<td>${element.members.toLocaleString()}</td>`
				builder += `<td>${element.assistants.toLocaleString()}</td>`
				builder += `</tr>`;
			});
  
	  $(".villagestb").hide();
	  $(".villagetb").show();
			$(".village").html(builder).show();
		  }
		}
	  });
	}
  });
  
 
if($(".fetchChat").length) {

	setInterval(
		function () {
			    loadChat();
		}, 10000);

}

function loadChat() {



	$.ajax({
		url: 'https://api.retromc.org/api/v1/server/chat?startUnixTime=0',
		type: 'GET',
		dataType: 'json',
		success: function(response) {
				 
		let result = ''; 
		
		if(response.messages) {
		
		result += '<div class="row">';
		response.messages.forEach(e => {
		
	
			result += `<div class="col-md-12"><span data-toggle="tooltip" title="${moment.unix(e.timestamp).fromNow()}"><img src="https://minotar.net/helm/${e.username}/25.png" alt="${e.username}"></span> <a href="../player/${e.uuid}" id="display">${ motdtocolor(e.display_name)}</a>: ${e.message}</div>`
		
		})
		result += '</div>';
		result += `<br>`;
		}
		else {
		result += '<div class="col-md-12"><p class="text-danger">No users chatting.</p></div>';
		}

		$(".fetchChat").html(result);
	}
})
}

function loadPlayerModel() {


$.ajax({
url: `../api/user_villages?uuid=${$("#q_uuid").text()}`,
type: 'GET',
dataType: 'json',
success: function(response) {
if(response.status) {

if(response.data.owner.length != 0) {
let o = [];
response.data.owner.forEach(l => {
o.push(`<a href="../village/${l.village_uuid}">${l.village}</a>`);
});
$("#owned").html(o.join(', '));
$(".owns").show();
}

if(response.data.assistant.length != 0) {
let a = [];
response.data.assistant.forEach(k => {
a.push(`<a href="../village/${k.village_uuid}">${k.village}</a>`);
});
$("#assistant").html(a.join(", "));
$(".asst").show();
}


if(response.data.member != 0) {
let a = [];
response.data.member.forEach(k => {
a.push(`<a href="../village/${k.village_uuid}">${k.village}</a>`);
});
$("#member").html(a.join(", "));
$(".mem").show();
}
$(".villages").show();
}
}

});

$.ajax({
url: `../api/online?username=${$("#q_username").text()}`,
type: 'GET',

dataType: 'json',
success: function(response) {
$('#status').show();
if(response.online) {
$(".status-result").html('<span class="badge badge-pill badge-success"> </span></span>');
$(".coords").show();
$("#x").text(response.x);
$("#y").text(response.y);
$("#z").text(response.z);
} 
}
});


$.ajax({
	url: '../api/bans?uuid=' + $("#q_uuid").text(),
	type: 'GET',
	dataType: 'json',
	success: function(response) {
	if(response.totalPunishments != 0) {
	$(".bans").show();
	if(response.banned) {
	$(".banned").prop({"id": "is_banned", "title":"This user has this color because they have been banned from the server."});
	$(".banned").attr({"data-toggle": "banned", "data-placement": "left"});
	$('[data-toggle="banned"]').tooltip();   
	}
	
	$(".modal-title").text("Bans");
	$(".own").show();
	$("#total-bans").text(response.totalPunishments);
	let result = '';
	result += '<table class="table table-borderless table-sm">';
	result += `<thead><tr><th></th><th>Admin</th><th>Reason</th><th>Pardoned</th><th>evidence</th></tr></thead><tbody>`;
	
	response.bans.forEach(ban => {
	let e = [];
	
	if(ban.evidence.length != 0) {
	ban.evidence.forEach(evidence => {
		if(evidence.url) {
	e.push(`<a href="` + evidence.url.replace(/{{site\.baseurl}}/g, "https://bans.johnymuffin.com") + ` target="_blank" rel="noopener">view</a>`);
		}
	});
	}
	else {
	e.push("no evidence available");
	}
	result += `<tr><td><img src="https://crafatar.com/avatars/${ban.admin[1]}?size=25&overlay"></td><td><a href="../player/${ban.admin[1]}">${ban.admin[0]}</a></td><td>${ban.reason}</td><td>${ban.pardoned}</td><td>${e.join(", ")}</td></tr>`;
	});
	result += '</tbody></table>';            
	$(".modal-body").html(result)
	$(".ban-list").show();
	}
	}
	});
	

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
		url: `../api/leaderboard`,
		method: "GET",
		data: {
			type: $(this).val()
		},
		success: function(response) {
		
			$(".type").text(response.name)
			let builder = '';
			response.data.forEach((val, key) => {
				builder += `<tr>`;
				builder += `<td class="text-center">${key+1}</td>`;
				builder += `<td><img src="https://crafatar.com/avatars/${val.uuid}?size=28&overlay">&emsp;<a href="./player/${val.uuid}">${val.username}</a></td>`;
				if(response.type == 'playTime') {
				builder += `<td>${moment.duration(val[response.type],"seconds").format('hh')} hours</td>`;
				}
				else {
				builder += `<td>${val[response.type].toLocaleString()}</td>`;
				}
				builder += `</tr>`;
			});

			$(".data").html(builder);

		$(".lb").show();
		}
	  });
});


function loadServer() {
$.ajax({
url: '../api/server',
type: 'GET',
dataType: 'json',
success: function(response) {

$("#cnt").text(response.cnt != 0 ? response.cnt : 'no');
 

let result = ''; 

if(response.players) {

result += '<div class="row">';
response.online.forEach(e => {

	result += `<div class="col-md-6"><span data-toggle="tooltip" title="x: ${Math.floor(e.coords.x)}, y: ${Math.floor(e.coords.y)}, z: ${Math.floor(e.coords.z)}, world: ${e.coords.world}"><img src="https://minotar.net/helm/${e.username}/25.png" alt="${e[0]}"></span> <a href="player/${e.uuid}" id="display">${ motdtocolor(e.display)}</a></div>`

})
result += '</div>';
result += `<br>`;
}
else {
result += '<div class="col-md-12"><p class="text-danger">No users online.</p></div>';
}
$(".fetchServers").html(result);

  $('[data-toggle="tooltip"]').tooltip(); 
new Chart("myChart", {
type: "line",
data: {
labels: response.timestamps,
datasets: [{
fill: false,
lineTension: 0,
backgroundColor: "rgb(44, 207, 97)",
borderColor: "rgba(44, 207, 97,0.7)",
data: response.players
}]
},
options: {
legend: {display: false},
scales: {
xAxes: [{
gridLines: {
display:false
},
ticks: {
display: false
}
}],

yAxes: [{
gridLines: {
display:false
},
ticks: {
display: false
}
}]
}
}
});

}
});
}


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
