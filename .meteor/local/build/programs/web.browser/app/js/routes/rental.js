/**
 * Created by njanjanam on 12/05/2018.
 */

$(document).ready(function(){
    $('.scroll-menu-div').hide();
    try{
        jQuery("html,body").animate({scrollTop: 0}, 50);
    }catch(e){
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    }
    $(window).on("scroll", function() {
        var scrollPercent = 100 * $(window).scrollTop() / ($(document).height() - $(window).height());
        if(scrollPercent > 10){
            $('.scroll-menu-div').fadeIn();
            $(".scroll-menu-div").addClass('fixed-header');
        }
        else{
            $('.scroll-menu-div').hide();
            $(".scroll-menu-div").removeClass("fixed-header");

        }
    });
    $('.scroll1').click(function (e) {
        e.preventDefault();
        $('html,body').animate({scrollTop: $(this.hash).offset().top - 85}, 1000)

        $('.scroll1').removeClass('active');
        $(this).addClass('active');

    });
    setTimeout(fixImgSize,1000)
    setTimeout(fixImgSize,2000)
    setTimeout(fixImgSize,3000)
});
function createCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}
function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0 ; i < ca.length ; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {
    createCookie(name,"",-1);
}
function fixImgSize(){
    setTimeout(function(){
        $('#imagessection .item img').width('100%')
        var w = $('#imagessection .item img').first().width()
        var h = w / 1.33;
        if (h > 250) $('#imagessection .item img').height(w / 1.33)
        setTimeout(function () {
            $('#imagessection .item img').width('100%')
            var w = $('#imagessection .item img').first().width()
            var h = w / 1.33;
            if (h > 250) $('#imagessection .item img').height()
        }, 1000)
    },1000)
}