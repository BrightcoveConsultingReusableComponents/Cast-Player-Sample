$( document ).ready(function() {

//changes the progress bar color
var progressColor = null;

/*rgb(255, 0, 91)*/

//changes the background color
var backgroundColor = null;

//changes the background image cover
var myBackgroundUrl = 'css/assets/bcback.png';

//changes the logo image cover
var myLogoUrl = null;

/*'css/assets/bcback.png'*/
/*'css/assets/chromecast-logo.png'*/

//progress bar color
if(progressColor){
$('.player .progressBar').css("background-color", progressColor);
}

//body background color
if(backgroundColor){
$('body').css("background-color", backgroundColor)
}

//background image cover
if(myBackgroundUrl){
$('.player .background').css("background-image", "url("+myBackgroundUrl+")");  
}

//logo
if(myLogoUrl){
$('.player .logo').css("background-image", "url("+myLogoUrl+")"); 
}


});