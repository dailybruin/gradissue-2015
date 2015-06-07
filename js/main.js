var sectionName; var section = []; var masterarray = [];

$(document).foundation();

var dsthtml;
var dashsidebartemplate;
var dbthtml;
var dashbodytemplate;

Handlebars.registerHelper("formatBodyText", function(t) {
	t = t.trim();
    return (t.length>0?'<p>'+t.replace(/[\r\n]+/,'</p><p>')+'</p>':null);
});

function changeStory(item) {
	$('.dashboard-item').removeClass('dashboard-active')
	$(item).addClass('dashboard-active');
}

function getSection(name, arr) {
	var buffer = [];
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].section == name) {
			buffer.push(arr[i]);
		};
	};
	return buffer;
};

$(document).ready(function() {
	$('.slick').slick({
	  centerMode: true,
	  centerPadding: '60px',
	  slidesToShow: 3,
	  responsive: [
	    {
	      breakpoint: 768,
	      settings: {
	        arrows: false,
	        centerMode: true,
	        centerPadding: '40px',
	        slidesToShow: 3
	      }
	    },
	    {
	      breakpoint: 480,
	      settings: {
	        arrows: false,
	        centerMode: true,
	        centerPadding: '40px',
	        slidesToShow: 1
	      }
	    }
	  ]
	});





	$("#simple3D").simple3D({
		moveX:3, // 1 - 5
		moveY:3, // 1 - 5
		bgImage:true, // use background image mode
		targetAll:true,
		reverseX: true,
		reverseY: true
	});

	$('#dashboard-container').slimScroll({
      height: '700px',
      allowPageScroll: false,
      distance: '10px', 
      railOpacity: '0.1',
      color: 'lightgrey'
  });

	$('#dashboard-content').slimScroll({
      height: '700px',
      allowPageScroll: false,
      distance: '-10px', 
      alwaysVisible: true,
      railVisible: false
  });



	dsthtml = $("#dash-sidebar-template").html();
	dashsidebartemplate = Handlebars.compile(dsthtml);
	dbthtml = $("#dash-body-template").html();
	dashbodytemplate = Handlebars.compile(dbthtml);


	var masterurl = "https://spreadsheets.google.com/feeds/list/1i5ecrrYy3IYiiabc8Hq_rEfxar2dJlKbox2qgpldcWI/default/public/values?alt=json";
	$.getJSON(masterurl, function(data) {
		data = clean_google_sheet_json(data);

		console.log(data);
		var html = dashsidebartemplate({stories: data});
		var html2 = dashbodytemplate(data[0]);
		$("#dashboard-container").html(html);
		$("#dashboard-content").html(html2);

		var item = $('.dashboard-item')[0]; 
		changeStory(item);

		$('.dashboard-item').on('click', function() {
			changeStory(this);
		});
	});	


//	console.log(masterarray);
//	section = getSection("news", masterarray);
	$('#fullpage').fullpage({
		anchors: ['first', 'second', 'third', 'fourth'],
	  // sectionsColor: ['#C63D0F', '#1BBC9B', '#7E8F7C'],
	  navigation: true,
	  navigationPosition: 'right',
	  // navigationTooltips: ['First', 'Second', 'Third', 'Fourth'],
	  onLeave: function(index, nextIndex, direction){

	    //after leaving section 2
	    if(index == 1 && direction =='down'){
	    	$('#banner > h1').velocity({ opacity: 0 }, { display: "none" });
	    	$("#simple3D").velocity({ opacity: 0 });
	    }

	    if(index == 2 && direction =='up'){
	    	$('#banner > h1').velocity({ opacity: 1 }, { display: "block" });
	    	$('#simple3D').velocity({ opacity: 1 });
	    }

	  }
	});


	


  
});



function clean_google_sheet_json(data){
	var formatted_json = [];
	var elem = {};
	var real_keyname = '';
	$.each(data.feed.entry, function(i, entry) {
		elem = {};
		$.each(entry, function(key, value){
			// fields that were in the spreadsheet start with gsx$
			if (key.indexOf("gsx$") == 0) 
			{
				// get everything after gsx$
				real_keyname = key.substring(4); 
				elem[real_keyname] = value['$t'];
			}
		});
		formatted_json.push(elem);
	});
	return formatted_json;
}
