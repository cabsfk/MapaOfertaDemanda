//#main-slider
var Nombrepagina = "";
$(window).load(function () {
    var pagina = document.URL.split("/");
    Nombrepagina = pagina[pagina.length - 1];
    Nombrepagina=Nombrepagina.replace("#", "");
    
    if (Nombrepagina != "") {
        $("#Pgn" + Nombrepagina).addClass('active');
    }else {
        $("#PgnIndex" ).addClass('active');
    }
    
});


