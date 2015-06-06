$(document).foundation();

$(document).ready(function() {

  $('#fullpage').fullpage({
  	anchors: ['firstPage', 'secondPage', '3rdPage'],
    // sectionsColor: ['#C63D0F', '#1BBC9B', '#7E8F7C'],
    navigation: true,
    navigationPosition: 'right',
    navigationTooltips: ['First', 'Second', 'Third'],
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