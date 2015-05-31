var selection_to_datestring = {
	'fall2009': '9/1/2009',
	'fall2010': '9/1/2010',
	'fall2011': '9/1/2011',
	'fall2012': '9/1/2012',
	'fall2013': '9/1/2013',
	'fall2014': '9/1/2014',
};


$(document).ready(function(){

	var selection = window.location.search;
	if (selection) {
		selection = selection.split('=')[1];
		document.getElementsByName('start')[0].value = selection;

	    url = "https://spreadsheets.google.com/feeds/list/1JFFjBvaO_PAs3d0jFWYmgXnh3A00MSeg3G4G1qYC46w/od6/public/values?alt=json"
		$.getJSON(url, function(json){

			//var selection = "fall2009";
			var data = clean_google_sheet_json(json);

			// filters out data points that are older than selected date
			data = _.filter(data, function(datum) {
				var timestamp = Date.parse(datum.date);
				var now = new Date();
				return timestamp >= Date.parse(selection_to_datestring[selection]) && timestamp <= Date.parse(now);
			});
			var events = _.filter(data, function(datum) {return datum.type === "event" && datum.category === "ucla-events"} );
			var nobels = _.filter(data, function(datum) {return datum.id === "nobel"; });
			var construction_events = _.filter(data, function(datum) {return datum.id === "construction"; });
			// $("#submit-button").click(function(){
			// 	clear_page();
			add_construction_card(construction_events);

			if (nobels.length > 0)
				add_nobel_card(nobels);
			add_ucla_event_cards(events);
			// })
			//console.log(card_ids);
			var card_ids = get_card_ids_by_column("ucla-events");
			add_cards(card_ids);
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
		// http://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-money-in-javascript
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
	//card_ids.push("#construction");
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
	//card_ids.push("#nobel");

}

function add_ucla_event_cards(events) {
	for (var i = 0; i < events.length; i++) {
		var card_html = compile_template_to_html("#event-card-template", events[i]);
		//card_ids.push("#" + events[i].id);
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

function clear_page() {
	$("#ucla-events-left").html("");
	$("#ucla-events-mid").html("");
	$("#ucla-events-right").html("");

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

function add_cards(card_ids) {
	console.log(card_ids);
	$(card_ids.join(", ")).hide();
	for (var i = 0; i < card_ids.length; i++) {
		$(card_ids[i]).delay(i*500).fadeIn(500);
	}
	// for (var i = 0; i < card_ids.length; i++) {
	// 	// setTimeout(function () {
	// 		$(card_ids[i]).hide();
	// 		$(card_ids[i]).fadeIn(2000);
	// 	// }, 1000);
	// }
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
