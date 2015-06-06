DEBUG = true;

if (!DEBUG) {
	console.log = function () {};
}

var selection_to_datestring = {
	'fall2009': '9/1/2009',
	'fall2010': '9/1/2010',
	'fall2011': '9/1/2011',
	'fall2012': '9/1/2012',
	'fall2013': '9/1/2013',
	'fall2014': '9/1/2014',
};

var selection_to_quarters_attended = {
	'fall2009': 18,
	'fall2010': 15,
	'fall2011': 12,
	'fall2012': 9,
	'fall2013': 6,
	'fall2014': 3,
};

var cards_in_divs = {};

card_ids = [];

$(document).ready(function(){

	// if url has ?start=fall2009, selection will equal fall2009
	// igonre everything after fall2009 (trailing slashes, extraneous query strings, etc)
	var selection = window.location.search.split('=')[1].slice(0, 8);
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
			var pro_athletes = _.filter(data, function(datum) {return datum.id === "pro-athlete"; });
			var usc_football_games = _.filter(data, function(datum) {return datum.id === "usc-football"; });
			var basketball_records = _.filter(data, function(datum) {return datum.id === "basketball"; });
			var construction_events = _.filter(data, function(datum) {return datum.id === "construction"; });
			var football_records = _.filter(data, function(datum) {return datum.id === "football"; });
			var costs = _.filter(data, function(datum) {return datum.id === "cost-in-state" || datum.id === "cost-out-of-state";});
			var movies = _.filter(data, function (datum) { return datum.type === "movie"; });
			var songs = _.filter(data, function(datum) { return datum.type === "song"; });
			add_construction_card(construction_events);
			add_cost_card(costs);
			if (nobels.length > 0)
				add_nobel_card(nobels);
			if (championships.length > 0)
				add_championships_card(championships);
			if (pro_athletes.length > 0)
				add_pro_atheletes_card(pro_athletes);
			if (usc_football_games.length > 0)
				add_usc_football_games_card(usc_football_games);
			if (songs.length > 0)
				add_song_card(songs);
			add_basketball_records_card(basketball_records);
			add_football_records_card(football_records);
			add_ucla_event_cards(events);
			add_movie_card(movies);
			add_study_card(selection);



			// if mobile, cards need to fade in a different order (vertical first)
			// if on desktop, cards need to fade in horizontally
			card_ids = _.filter(card_ids, function(card_id) {return card_id;});
		
			//console.log(card_ids);
			if (window.mobilecheck())
				card_ids = horizontal_to_vertical_order(card_ids);
			$('.flexslider').flexslider({
				controlNav: false
			});			
			fade_in_cards(card_ids);
			//console.log(card_ids);



		});
	}
});



function add_study_card(selection) {
	var template_data = {
		id: 'study',
		question: "How many hours a week do you study?"
	}
	var card_html = compile_template_to_html("#custom-calculator", template_data);
	add_card("ucla-events", card_html, "#study");

	$("#study").click(function() {
		var num = Number.parseFloat($("#study-input").val());
		var text = document.createElement("p");
		var hours_studied = selection_to_quarters_attended[selection] * num * 10;
		$(text).html("You've studied for about " + Math.floor(hours_studied) + " hours");
		$("#study-content").html(text);
	});

}

function add_card(section_div_id, card_html, card_div_id) {
	if (section_div_id in cards_in_divs) {
		cards_in_divs[section_div_id]++;
	}
	else {
		cards_in_divs[section_div_id] = 0;
	}
	//console.log(card_html);
	//console.log("#" + section_div_id + "-left");
	switch (cards_in_divs[section_div_id] % 3) {
		case 0: 		
			$("#" + section_div_id + "-left").append(card_html);
			card_ids.push(card_div_id);
			break;
		case 1: 
			$("#" + section_div_id + "-mid").append(card_html);
			card_ids.push(card_div_id);
			break;
		case 2:
			$("#" + section_div_id + "-right").append(card_html);
			card_ids.push(card_div_id);
			break;
	}
}


function add_song_card(songs) {
	var template_data = {
		'id': 'songs',
		'title': 'These were the songs of the summer',
		'rows': _.sortBy(songs, function(song) {return song.category; }),
	};

	var card_html = compile_template_to_html("#slideshow-template", template_data);
	add_card("ucla-events", card_html, "#songs");
}

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
	add_card("ucla-events", card_html, "#construction");
	//$("#ucla-events-left").append(card_html);

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
	add_card("ucla-events", card_html, "#costs");
	//$("#ucla-events-left").append(card_html);

	var ctx = document.getElementById("costs-chart").getContext("2d");
	var bar_data = {
		labels: chart_labels,
		datasets: [ {
			data: in_state_on,
			label: "On campus",
            fillColor: "rgba(151,187,205,0.5)",
            strokeColor: "rgba(151,187,205,0.8)",
            highlightFill: "rgba(151,187,205,0.75)",
            highlightStroke: "rgba(151,187,205,1)",
			},
			{
			data: in_state_off,
			label: "Off campus",
            fillColor: "rgba(220,220,220,0.5)",
            strokeColor: "rgba(220,220,220,0.8)",
            highlightFill: "rgba(220,220,220,0.75)",
            highlightStroke: "rgba(220,220,220,1)",
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
	//card_ids.push("#costs");

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
		'posttext': nobels.length === 1 ? 'Nobel Prize' : 'Nobel Prizes',
		'rows': nobels
	}
	var card_html = compile_template_to_html("#single-number-template", data);
	//console.log(card_html);
	add_card("ucla-events", card_html, "#nobel");
	$('.tooltip-' + data.id).tooltipster();
	// $("#ucla-events-left").append(card_html);
	//card_ids.push("#nobel");

}

function add_championships_card(championships) {
	var data = {
		'id': 'championships',
		'singlestat': championships.length,
		'pretext': 'UCLA has won',
		'imageurl' : 'http://dailybruin.com/images/2014/10/trophy-376x640.png',
		'posttext': championships.length === 1 ? 'NCAA Championship' : 'NCAA Championships',
		'rows': championships
	}
	var card_html = compile_template_to_html("#single-number-template", data);
	//$("#ucla-events-left").append(card_html);
	add_card("ucla-events", card_html, "#championships");
	$('.tooltip-' + data.id).tooltipster();

	//card_ids.push("#championships");

}

function add_pro_atheletes_card(pro_athletes) {
	var data = {
		'id': 'pro_athletes',
		'singlestat': pro_athletes.length,
		'pretext': 'There have been at least',
		'posttext': 'UCLA athletes who have gone pro.',
		'rows': pro_athletes
	}
	var card_html = compile_template_to_html("#single-number-template-wrap", data);
	add_card("ucla-events", card_html, "#pro_athletes");
	//card_ids.push("#pro_athletes");
	$('.tooltip-' + data.id).tooltipster();
}

function add_usc_football_games_card(usc_football_games) {
	var data = {
		'id': 'usc_football_games',
		'pretext': "UCLA beat USC",
		'singlestat': usc_football_games.length,
		'posttext': usc_football_games.length === 1 ? 'time in football.' : "times in football.",
		'rows': usc_football_games,
		'imageurl' : 'http://dailybruin.com/images/2013/11/80851f22-b618-4a8c-affc-2944b29dfd531-640x427.jpg'
	}
	var card_html = compile_template_to_html("#single-number-template", data);
	add_card("ucla-events", card_html, "#usc_football_games");
	//card_ids.push("#usc_football_games");
	$('.tooltip-' + data.id).tooltipster();
}

function add_basketball_records_card(basketball_records) {
	var records_by_year = _.groupBy(basketball_records, function (record) {
		var d = new Date(record.date);
		var num_year = parseInt(d.getFullYear());
		var next_year = num_year + 1 - 2000;
		return d.getFullYear() + "-" + next_year;
	});
	var chart_labels = _.keys(records_by_year);
	var chart_data = [];
	var wins = [];
	var losses = [];

	for (var i = 0; i < chart_labels.length; i++) {
		wins.push(parseInt(records_by_year[chart_labels[i]][0].data));
		losses.push(parseInt(records_by_year[chart_labels[i]][0].data2));
	}

	var total_wins_num =  _.reduce(wins, function(a, b){ return a + b; }, 0);
	var total_losses_num =  _.reduce(losses, function(a, b){ return a + b; }, 0);
	var template_data = {
		'id' : 'basketball_records',
		'pretext' : "UCLA had a record of",
		'singlestat' :  total_wins_num + "-" + total_losses_num,
		'posttext': "in men's basketball.",
		'canvasheight': 'height="300px"'
	}

	var card_html = compile_template_to_html("#chart-template", template_data);
	add_card("ucla-events", card_html, "#basketball_records");

	var ctx = document.getElementById("basketball_records-chart").getContext("2d");
	var bar_data = {
		labels: chart_labels,
		datasets: [ {
			data: wins,
			label: "Wins",
            fillColor: "rgba(151,187,205,0.5)",
            strokeColor: "rgba(151,187,205,0.8)",
            highlightFill: "rgba(151,187,205,0.75)",
            highlightStroke: "rgba(151,187,205,1)",
			},
			{
			data: losses,
			label: "Losses",
            fillColor: "rgba(220,220,220,0.5)",
            strokeColor: "rgba(220,220,220,0.8)",
            highlightFill: "rgba(220,220,220,0.75)",
            highlightStroke: "rgba(220,220,220,1)",
			}
		]
	};

	var bar_options = {
		responsive: true,
		tooltipTemplate: "<%= addCommas(value) %>",
		multiTooltipTemplate: "<%= datasetLabel %>: <%= addCommas(value) %> ",
		scaleLabel: "<%= addCommas(value) %>"
	}

	var bar_chart = new Chart(ctx).Bar(bar_data, bar_options);
}

function add_football_records_card(football_records) {
	var records_by_year = _.groupBy(football_records, function (record) {
		var d = new Date(record.date);
		var num_year = parseInt(d.getFullYear());
		var next_year = num_year + 1 - 2000;
		return d.getFullYear() + "-" + next_year;
	});
	var chart_labels = _.keys(records_by_year);
	var chart_data = [];
	var wins = [];
	var losses = [];

	for (var i = 0; i < chart_labels.length; i++) {
		wins.push(parseInt(records_by_year[chart_labels[i]][0].data));
		losses.push(parseInt(records_by_year[chart_labels[i]][0].data2));
	}

	var total_wins_num =  _.reduce(wins, function(a, b){ return a + b; }, 0);
	var total_losses_num =  _.reduce(losses, function(a, b){ return a + b; }, 0);
	var template_data = {
		'id' : 'football_records',
		'pretext' : "UCLA had a record of",
		'singlestat' :  total_wins_num + "-" + total_losses_num,
		'posttext': "in men's football.",
		'canvasheight': 'height="300px"'
	}

	var card_html = compile_template_to_html("#chart-template", template_data);
	add_card("ucla-events", card_html, "#football_records");

	var ctx = document.getElementById("football_records-chart").getContext("2d");
	var bar_data = {
		labels: chart_labels,
		datasets: [ {
			data: wins,
			label: "Wins",
            fillColor: "rgba(151,187,205,0.5)",
            strokeColor: "rgba(151,187,205,0.8)",
            highlightFill: "rgba(151,187,205,0.75)",
            highlightStroke: "rgba(151,187,205,1)",
			},
			{
			data: losses,
			label: "Losses",
            fillColor: "rgba(220,220,220,0.5)",
            strokeColor: "rgba(220,220,220,0.8)",
            highlightFill: "rgba(220,220,220,0.75)",
            highlightStroke: "rgba(220,220,220,1)",
			}
		]
	};

	var bar_options = {
		responsive: true,
		tooltipTemplate: "<%= addCommas(value) %>",
		multiTooltipTemplate: "<%= datasetLabel %>: <%= addCommas(value) %> ",
		scaleLabel: "<%= addCommas(value) %>"
	}

	var bar_chart = new Chart(ctx).Bar(bar_data, bar_options);
}

function add_ucla_event_cards(events) {
	for (var i = 0; i < events.length; i++) {
		var card_html = compile_template_to_html("#event-card-template", events[i]);
		//card_ids.push("#" + events[i].id);
		add_card("ucla-events", card_html, "#" + events[i].id);
	}
}

function add_movie_card(movies) {
	// movies = _.groupBy(movies, function (movie) { return movie.category; });
	// console.log(movies);

	movies = _.sortBy(movies, function (movie) { return -movie.data; });


	var template_data = {
		'id': 'movies',
		'title' : "<em>" + movies[0]['title'].replace(/^"(.*)"$/, '$1') + "</em>" + " was the top grossing movie",
		'imgurl': movies[0].imageurl,
		'rows' : movies.slice(0,5),
		'credits' : movies[0]['credits']
	}
	var card_html = compile_template_to_html("#movie-template", template_data);
	add_card("ucla-events", card_html, "#movies");
		//card_ids.push("#movie" + year);

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

	card_ids = [];
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

function horizontal_to_vertical_order(card_ids) {
	card_ids = _.filter(card_ids, function(card_id) {return card_id;});
	new_card_ids = [];
	for (var i = 0; i < 3; i++) {
		for (var j = i; j < card_ids.length; j += 3) {
			new_card_ids.push(card_ids[j]);
		}
	}
	return new_card_ids;
}