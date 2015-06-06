$(document).foundation();

$(document).ready(function() {
	$("#simple3D").simple3D({
		moveX:3, // 1 - 5
		moveY:3, // 1 - 5
		bgImage:true, // use background image mode
		targetAll:true,
		reverseX: true,
		reverseY: true
	});


  $('#fullpage').fullpage({
  	anchors: ['first', 'second', 'third', 'fourth'],
    // sectionsColor: ['#C63D0F', '#1BBC9B', '#7E8F7C'],
    navigation: true,
    navigationPosition: 'right',
    navigationTooltips: ['First', 'Second', 'Third', 'Fourth'],
    onLeave: function(index, nextIndex, direction){

      //after leaving section 2
      if(index == 1 && direction =='down'){
      	$('#banner > h1').velocity({ opacity: 0 }, { display: "none" });
      }

      if(index == 2 && direction =='up'){
      	$('#banner > h1').velocity({ opacity: 1 }, { display: "block" });
      }

    }
  });
});