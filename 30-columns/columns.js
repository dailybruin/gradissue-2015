$(document).ready(function(){

    
    $('.article').hide();
    
    $(function(){
        // Bind the event.
        $(window).hashchange( function(){
            // Alerts every time the hash changes!
            console.log( location.hash );
            
            if (location.hash == "") {
                $('.article').hide();
                $('#descriptor').show();
            } else {
                $('#descriptor').hide();
                $('.article').hide();
                $(location.hash).show();
            }
        });

        // Trigger the event (useful on page load).
        $(window).hashchange();

    });;
})

function stickIt() {
  var orgElementPos = $('.original').offset();
  orgElementTop = orgElementPos.top;               

  if ($(window).scrollTop() >= (orgElementTop)) {
    orgElement = $('.original');
    coordsOrgElement = orgElement.offset();
    leftOrgElement = coordsOrgElement.left;  
    widthOrgElement = orgElement.css('width');
    $('.cloned').css('left',leftOrgElement+'px').css('top',0).css('width',widthOrgElement).show();
    $('.original').css('visibility','hidden');
  } else {
    $('.cloned').hide();
    $('.original').css('visibility','visible');
  }
}
