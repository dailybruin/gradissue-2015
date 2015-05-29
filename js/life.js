$(document).ready(function(){
    url = "https://spreadsheets.google.com/feeds/list/1JFFjBvaO_PAs3d0jFWYmgXnh3A00MSeg3G4G1qYC46w/od6/public/values?alt=json"
	$.getJSON(url, function(json){
		var data = clean_google_sheet_json(json);
		var events = _.filter(data, function(datum) {return datum.type === "event" && datum.category === "ucla-events"} );
		var nobels = _.filter(data, function(datum) {return datum.id === "nobel" });
		// $("#submit-button").click(function(){
		// 	clear_page();
			add_ucla_event_cards(events);
			add_nobel_card(nobels);
		// })
	});
});


function add_nobel_card(nobels) {
	var data = {
		'singlestat': nobels.length,
		'pretext': 'UCLA Faculty and Alumni have won',
		'posttext': nobels.length === 1 ? 'Nobel Prize' : 'Nobel Prizes'
	}
	var card_html = compile_template_to_html("#single-number-template", data);
	console.log(card_html);
	$("#ucla-events-left").append(card_html);

}

function add_ucla_event_cards(events) {
	for (var i = 0; i < events.length; i++) {
		var card_html = compile_template_to_html("#event-card-template", events[i]);
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