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


