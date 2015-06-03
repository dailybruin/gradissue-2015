var selection_to_datestring = {
	'fall2009': '9/1/2009',
	'fall2010': '9/1/2010',
	'fall2011': '9/1/2011',
	'fall2012': '9/1/2012',
	'fall2013': '9/1/2013',
	'fall2014': '9/1/2014',
};

card_ids = []

$(document).ready(function(){

	// if url has ?start=fall2009, selection will equal fall2009
	var selection = window.location.search.split('=')[1];
	$(".category-header").hide();
	// check to see that we have a valid selection
	if (selection in selection_to_datestring) {
		$(".category-header").fadeIn(200);
		
		// fix selection in dropdown
		document.getElementsByName('start')[0].value = selection;

	    url = "https://spreadsheets.google.com/feeds/list/1JFFjBvaO_PAs3d0jFWYmgXnh3A00MSeg3G4G1qYC46w/od6/public/values?alt=json"
		$.getJSON(url, function(json){

			var data = clean_google_sheet_json(json);

			// filters out data points that are older than selected date
			data = _.filter(data, function(datum) {
				var timestamp = Date.parse(datum.date);
				var now = new Date();
				return timestamp >= Date.parse(selection_to_datestring[selection]) && timestamp <= Date.parse(now);
			});

			var events = _.filter(data, function(datum) {return datum.type === "event" && datum.category === "ucla-events"} );
			var nobels = _.filter(data, function(datum) {return datum.id === "nobel"; });
			var championships = _.filter(data, function(datum) {return datum.id === "championships"; });            
			var construction_events = _.filter(data, function(datum) {return datum.id === "construction"; });
			var costs = _.filter(data, function(datum) {return datum.id === "cost-in-state" || datum.id === "cost-out-of-state";});
			add_cost_card(costs);
			add_construction_card(construction_events);
			if (nobels.length > 0)
				add_nobel_card(nobels);
			if (championships.length > 0)
				add_championships_card(championships);                
			add_ucla_event_cards(events);
			
			// if mobile, cards need to fade in a different order (vertical first)
			// if on desktop, cards need to fade in horizontally
			if (!window.mobilecheck())
				card_ids = get_card_ids_by_column("ucla-events");
			fade_in_cards(card_ids);



		});
	}


});




function add_construction_card(events) {
	//console.log(events);
	var events_by_year = _.groupBy(events, function (event) {
		var d = new Date(event.date);
		return d.getFullYear();
	});
	var chart_labels = _.keys(events_by_year);

	// populate chart data
	var chart_data = [];
	for (var i = 0; i < chart_labels.length; i++) {
		var year_sum = 0;
		var year = chart_labels[i];
		var year_data = events_by_year[year];
		for (var j = 0; j < year_data.length; j++) {
			year_sum += parseInt(year_data[j].data);
		}
		chart_data.push(year_sum);
	}

	var template_data = {
		'id' : 'construction',
		'pretext' : 'UCLA has spent',
		'singlestat' : "$" + addCommas(sum(chart_data)),
		'posttext' : 'on finished construction and renovation projects.'
	}

	var card_html = compile_template_to_html("#chart-template", template_data);
	$("#ucla-events-left").append(card_html);

	var ctx = document.getElementById("construction-chart").getContext("2d");
	var bar_data = {
		labels: chart_labels,
		datasets: [ {
			data: chart_data,
            fillColor: "rgba(151,187,205,0.5)",
            strokeColor: "rgba(151,187,205,0.8)",
            highlightFill: "rgba(151,187,205,0.75)",
            highlightStroke: "rgba(151,187,205,1)",
			}
		]
	};

	var bar_options = {
		responsive: true,
		tooltipTemplate: "$<%= addCommas(value) %>",
		scaleLabel: "<%= (value / 1000000000) %> billion",
	}

	var bar_chart = new Chart(ctx).Bar(bar_data, bar_options);
	

	//console.log(template_data);
	//console.log(chart_data);
	//console.log(chart_labels);
	//console.log(events_by_year);
	$("#construction").hide();
	card_ids.push("#construction");
}

function add_cost_card(costs) {
	var costs_by_year = _.groupBy(costs, function (event) {
		var d = new Date(event.date);
		var num_year = parseInt(d.getFullYear());
		var next_year = num_year + 1 - 2000;
		return d.getFullYear() + "-" + next_year;
	});
	var chart_labels = _.keys(costs_by_year);
	var chart_data = [];
	console.log(costs_by_year);
	var chart_labels = _.keys(costs_by_year);
	var in_state_on = [];
	var out_state_on = [];
	var in_state_off = [];
	var out_state_off = [];

	for (var i = 0; i < chart_labels.length; i++) {
		in_state_on.push(parseInt(costs_by_year[chart_labels[i]][0].data));
		in_state_off.push(parseInt(costs_by_year[chart_labels[i]][0].data2));		
		out_state_on.push(parseInt(costs_by_year[chart_labels[i]][1].data));
		out_state_off.push(parseInt(costs_by_year[chart_labels[i]][1].data2));		
	}


	var in_state_diff = _.last(in_state_on) / _.first(in_state_on);
	var out_state_diff = _.last(out_state_on) / _.first(out_state_on);
	var template_data = {
		'id' : 'costs',
		'pretext' : 'Cost of tuition and living has gone up by',
		'singlestat' :  (in_state_diff*100-100).toFixed(2) + "%",
		'toggle': true,
		'canvasheight': 'height="300px"'
		//'posttext' : 'on finished construction and renovation projects.'
	}

	var card_html = compile_template_to_html("#chart-template", template_data);
	$("#ucla-events-left").append(card_html);

	var ctx = document.getElementById("costs-chart").getContext("2d");
	var bar_data = {
		labels: chart_labels,
		datasets: [ {
			data: in_state_on,
			label: "On campus",
            fillColor: "rgba(220,220,220,0.5)",
            strokeColor: "rgba(220,220,220,0.8)",
            highlightFill: "rgba(220,220,220,0.75)",
            highlightStroke: "rgba(220,220,220,1)",
			},
			{
			data: in_state_off,
			label: "Off campus",
            fillColor: "rgba(151,187,205,0.5)",
            strokeColor: "rgba(151,187,205,0.8)",
            highlightFill: "rgba(151,187,205,0.75)",
            highlightStroke: "rgba(151,187,205,1)",
			}
		]
	};


	var bar_options = {
		responsive: true,
		tooltipTemplate: "$<%= addCommas(value) %>",
		multiTooltipTemplate: "<%= datasetLabel %>: $<%= addCommas(value) %> ",
		scaleOverride: true,
		scaleSteps: 3,
		scaleStepWidth: 20000,
		scaleLabel: "$<%= addCommas(value) %>"
	}

	var bar_chart = new Chart(ctx).Bar(bar_data, bar_options);
	$("#costs").hide();
	console.log(bar_chart);
	card_ids.push("#costs");

	$("#radio-in-state, #radio-out-state").change(function () {
		console.log(this.value);
		switch(this.value) {
			case "in": 
				for (var i = 0; i < in_state_on.length; i++) {
					bar_chart.datasets[0].bars[i].value = in_state_on[i];
					bar_chart.datasets[1].bars[i].value = in_state_off[i];
				}
				$("#costs > .chart-number").html((in_state_diff*100-100).toFixed(2) + "%");
				break;
			case "out":
				for (var i = 0; i < in_state_on.length; i++) {
					bar_chart.datasets[0].bars[i].value = out_state_on[i];
					bar_chart.datasets[1].bars[i].value = out_state_off[i];
				}
				$("#costs > .chart-number").html((out_state_diff*100-100).toFixed(2) + "%");
				break;
		}
		bar_chart.update();
		console.log(bar_chart.datasets[0].bars);
	});

}

function add_nobel_card(nobels) {
	var data = {
		'id': 'nobel',
		'singlestat': nobels.length,
		'pretext': 'UCLA Faculty and Alumni have won',
		'imageurl' : 'http://dailybruin.com/images/2015/05/nobel.png',
		'posttext': nobels.length === 1 ? 'Nobel Prize' : 'Nobel Prizes'
	}
	var card_html = compile_template_to_html("#single-number-template", data);
	//console.log(card_html);
	$("#ucla-events-left").append(card_html);
	card_ids.push("#nobel");

}

function add_championships_card(championships) {
	var data = {
		'id': 'championships',
		'singlestat': championships.length,
		'pretext': 'UCLA has won won',
		'imageurl' : 'http://dailybruin.com/images/2014/10/trophy-376x640.png',
		'posttext': championships.length === 1 ? 'NCAA Championship' : 'NCAA Championships'
	}
	var card_html = compile_template_to_html("#single-number-template", data);
	$("#ucla-events-left").append(card_html);
	card_ids.push("#nobel");

}

function add_ucla_event_cards(events) {
	for (var i = 0; i < events.length; i++) {
		var card_html = compile_template_to_html("#event-card-template", events[i]);
		card_ids.push("#" + events[i].id);
		switch (i % 3) {
			case 0: 		
				$("#ucla-events-left").append(card_html);
				break;
			case 1: 
				$("#ucla-events-mid").append(card_html);
				break;
			case 2:
				$("#ucla-events-right").append(card_html);
				break;
		}
	}
}

function sum(iterable) {
	var total = 0;
	for (var i = 0; i < iterable.length; i++) {
		total += iterable[i];
	}
	return total;
}

function addCommas(nStr)
{
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

function fade_in_cards(card_ids) {
	console.log(card_ids);
	$(card_ids.join(", ")).hide();
	for (var i = 0; i < card_ids.length; i++) {
		$(card_ids[i]).delay(i*500).fadeIn(500);
	}
}

function get_card_ids_by_column(main_div_id) {
	card_ids = []
	var left_div_id = "#" + main_div_id + "-left";
	var mid_div_id = "#" + main_div_id + "-mid";
	var right_div_id = "#" + main_div_id + "-right";

	var num_left_children = $(left_div_id).children().length;
	var num_mid_children = $(mid_div_id).children().length;
	var num_right_children = $(right_div_id).children().length;
	
	var max_children = _.max([num_left_children, num_right_children, num_mid_children]);
	for (var i = 0; i < max_children; i++) {
		console.log($(left_div_id).children()[i]);
		if ($(left_div_id).children()[i])
			card_ids.push("#" + $(left_div_id).children()[i].id);
		if ($(mid_div_id).children()[i])
			card_ids.push("#" + $(mid_div_id).children()[i].id);
		if ($(right_div_id).children()[i])
			card_ids.push("#" + $(right_div_id).children()[i].id);
	}
	return card_ids;
}

window.mobilecheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}
