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
