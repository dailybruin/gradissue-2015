$(document).ready(function(){

//==========Add names to thumbnail overlay=======
  $(".thumb").mouseover(function ()
  {
     var str=$(this).context.hash;
     var name=str.substring(1);
     var div =$(this).context.children[1];
     if(div.innerHTML=="")
        div.innerHTML+=name;
  });

//=========Change Hash================
    $('.article').hide();
    $(function(){
        // Bind the event.
        $(window).hashchange( function(){
            // Alerts every time the hash changes!
 
            
            if (location.hash == "") {
                $('.article').hide();
                $('#Andrew').show();
                $('#descriptor').show();
            } else {
                $('.article').hide();
                  $('#descriptor').show();
                $(location.hash).show();
                // pause Christyana's audio if switching to another column
                $("audio")[0].pause(); 
            }
        });

        // Trigger the event (useful on page load).
        $(window).hashchange();

    });;
})


