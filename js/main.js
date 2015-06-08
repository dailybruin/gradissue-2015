var sectionName; var section = []; var masterarray = [];

var dsthtml;
var dashsidebartemplate;
var dbthtml;
var dashbodytemplate;

Handlebars.registerHelper("formatBodyText", function(t) {
	t = t.trim();
	var re = new RegExp('[\r\n]+', 'g');
    return (t.length>0?'<p>'+t.replace(re,'</p><p>')+'</p>':null);
});

function back() {
	$('#dashboard').hide(); 
	$('#sections-container').show();

	$.fn.fullpage.setMouseWheelScrolling(true);
    $.fn.fullpage.setAllowScrolling(true);
    $.fn.fullpage.setKeyboardScrolling(true);
    $('#fp-nav').show();
}

function changeStory(item) {

	var name = $(item).find("h4").text();
	if (name == "LA Summer Preview 2015") {
		window.open("http://graphics.dailybriun.com/gradissue-2015/summer-la/index.html");
	} else {
		var prev = $('.dashboard-active');
		prev.find(">:nth-child(2)").css('width','100%');
		prev.find(">:nth-child(1)").css('width','0%');

		$('.dashboard-item').removeClass('dashboard-active');
		$(item).addClass('dashboard-active');

		var i = (item.id).replace(/index-/,''); 

		$("#dashboard-content").html(dashbodytemplate(section[i]));

		var currentwidth = $(window).width();

		if (currentwidth < 641) {
			$('.top-bar, [data-topbar]').css('height', '').removeClass('expanded');
			$('#dashboard-container').parent().hide();
		}
	};
}

function getSection(name) {
	var buffer = [];
	for (var i = 0; i < masterarray.length; i++) {
		if (masterarray[i].section == name) {
			buffer.push(masterarray[i]);
		};
	};
	return buffer;
};

function switchSection(name) {
	sectionName = name;
	if (name == 'a&amp;e') {
		name = 'ae';
	}
	
	section = getSection(name);

	$(".right li.active").removeClass("active");

	if (name == "a&amp;e") {
		$(".right .ae").addClass("active");
	} else {
		$(".right ." + name).addClass("active");
	}

	$("#dashboard-container").html(dashsidebartemplate({stories: section}));

	$("#dashboard-content").html(dashbodytemplate(section[0]));
	var item = $('.dashboard-item')[0]; 
	$(item).addClass('dashboard-active');

	$('.dashboard-item').on('click', function() {
		changeStory(this);
	});

	$('.dashboard-item').mouseover(function() {

		if (! $(this).hasClass('dashboard-active')) {
			$(this).find(">:nth-child(2)").css('width','90%');
			$(this).find(">:nth-child(1)").css('width','10%');
		}
	});
	$('.dashboard-item').mouseout(function() {
		if (! $(this).hasClass('dashboard-active')) {

			$(this).find(">:nth-child(2)").css('width','100%');
			$(this).find(">:nth-child(1)").css('width','0%');
		}
	});


};



Handlebars.registerHelper("debug", function(optionalValue) {
  console.log("Current Context");
  console.log("====================");
  console.log(this);
 
  if (optionalValue) {
    console.log("Value");
    console.log("====================");
    console.log(optionalValue);
  }
});

$(document).ready(function() {

	$(document).foundation();

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

	// $("#simple3D").simple3D({
	// 	moveX:3, // 1 - 5
	// 	moveY:3, // 1 - 5
	// 	bgImage:true, // use background image mode
	// 	targetAll:true,
	// 	reverseX: true,
	// 	reverseY: true
	// });

	var winheight = $(window).height().toString() + 'px';
	var scrollheight = ($(window).height() - 45).toString() + 'px';

	$('#dashboard-container').slimScroll({
      height: scrollheight,
      allowPageScroll: false,
      distance: '-10px', 
      railOpacity: '0.1',
      color: 'lightgrey'
  	});

	$('#dashboard-content').slimScroll({
      height: scrollheight,
      allowPageScroll: false,
      distance: '-10px', 
      alwaysVisible: true,
      railVisible: false
  	});


	if ($(window).width() < 641) {
			$('#sections-container').slimScroll({
		      height: winheight,
		      allowPageScroll: false,
		      distance: '-10px', 
		      alwaysVisible: true,
		      railVisible: false
		  	});

		};
  	

	dsthtml = $("#dash-sidebar-template").html();
	dashsidebartemplate = Handlebars.compile(dsthtml);
	dbthtml = $("#dash-body-template").html();
	dashbodytemplate = Handlebars.compile(dbthtml);

	$(".toggle-topbar a").on('click', function() {
		$('#dashboard-container').parent().show();
	});

	var masterurl = "https://spreadsheets.google.com/feeds/list/1i5ecrrYy3IYiiabc8Hq_rEfxar2dJlKbox2qgpldcWI/default/public/values?alt=json";
	$.getJSON(masterurl, function(data) {
		data = clean_google_sheet_json(data);
		masterarray = data;
		switchSection("news");
		console.log(section);

		$("#dashboard-container").html(dashsidebartemplate({stories: section}));
		$("#dashboard-content").html(dashbodytemplate(section[0]));

		var item = $('.dashboard-item')[0]; 
		$(item).addClass('dashboard-active');

		$('.dashboard-item').on('click', function() {
			changeStory(this);
		});


		$('.item').on('click', function() {
			secname = $(this).find("h3").html().toLowerCase();

			if (secname == 'opinion') {
				window.open("http://graphics.dailybruin.com/gradissue-2015/30-columns/index.html");
			} else {
				switchSection(secname);

				$('#sections-container').hide();
				$('#dashboard').show(); 

				$.fn.fullpage.setMouseWheelScrolling(false);
	    		$.fn.fullpage.setAllowScrolling(false);
	    		$.fn.fullpage.setKeyboardScrolling(false);
	    		$('#fp-nav').hide();
    		};

		});

		$(".right li").on('click', function() {
			secname = $(this).find("a").html().toLowerCase();
			if (secname == 'opinion') {
				window.open("http://graphics.dailybruin.com/gradissue-2015/30-columns/index.html");
			} else {
				switchSection(secname);
			}
		});



		// $('.back').on('click', function() {
		// 	$('#dashboard').hide(); 
		// 	$('sections-container').show();

		// });
	});	


//	console.log(masterarray);
//	section = getSection("news", masterarray);
	$('#fullpage').fullpage({
		anchors: ['first', 'second', 'third'],
	  // sectionsColor: ['#C63D0F', '#1BBC9B', '#7E8F7C'],
	  navigation: true,
	  navigationPosition: 'right',
	  // navigationTooltips: ['First', 'Second', 'Third', 'Fourth'],
	  onLeave: function(index, nextIndex, direction){

	    //after leaving section 2
	    if(index == 1 && direction =='down'){
	    	$('#banner > h1').velocity({ opacity: 0 }, { display: "none" });
	    	// $("#simple3D").velocity({ opacity: 0 });
	    }

	    if(index == 2 && direction =='up'){
	    	$('#banner > h1').velocity({ opacity: 1 }, { display: "block" });
	    	// $('#simple3D').velocity({ opacity: 1 });
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
