$(document).ready(function(){

    $('#slideup').click(function(){
        $('#slideblock').slideToggle("slow");
    });

    $(".countryblock").click(function(){
        window.location.href="/country_"+$(this).attr("id");
    });

    $(".showproffersbtn").click(function(){
        
        
        $("#proffersAppend"+$(this).attr("id").replace(/\D/gi,'')).slideToggle("slow");
    });

    $(".profferblock").click(function(){
        window.location.href="/proffer_"+$(this).attr("id");
    });

    setTimeout(function(){

       
        var count = 1;
       
        while(typeof $("#proffersAppend"+count).html()!=='undefined')
        {
            if($("#proffersAppend"+count).html().replace(/\s/gi,'')=="")
            {
                $("#btn"+count).css('display', 'none');
                $("#status"+count).html("Нет свободных номеров").css('color','red');
            }
            else
            {
                $("#status"+count).html("Есть свободные номера").css('color','green');
            }
            count++;
        }

    },0);
});