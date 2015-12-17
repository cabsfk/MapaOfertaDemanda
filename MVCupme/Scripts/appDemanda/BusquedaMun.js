
//Definicion de layers

var LyrMunicipio, LyrMunicipio;
var ServiceDaneFind = L.esri.Tasks.find({
    url: config.dominio + config.urlHostDP + 'MapServer'
});

/*
Busqueda Por Municipio!!!
*/
$("#city").autocomplete({
    source: function (request, response) {
        $("#BtnBusquedaMun").empty().append("<span class='glyphicon glyphicon-repeat'></span>").removeClass("btn-default").addClass("btn-warning");
        ServiceDaneFind.layers('0').text(request.term).fields('MPIO_CNMBRSA,MPIO_CNMBR');
        // ServiceDaneFind.params.layerDefs ="1:CLASE='3'";

        ServiceDaneFind.run(function (error, featureCollection, response2) {
            console.log(featureCollection);
            $("#BtnBusquedaMun").empty().append("<span class='glyphicon glyphicon-search'></span>").removeClass("btn-warning").addClass("btn-default");
            response($.map(featureCollection.features, function (el) {
                return {
                    label: el.properties.MPIO_CNMBR + " - " + el.properties.DPTO_CNMBR,
                    value: el.properties.MPIO_CNMBR + " - " + el.properties.DPTO_CNMBR,
                    MPIO: el.properties.MPIO_CCDGO,
                    DPTO: el.properties.DPTO_CCDGO,
                    geojson: el
                };
            }));

        });
    },
    minLength: 3,
    select: function (event, ui) {
        if (map.hasLayer(LyrMunicipio)) {
            map.removeLayer(LyrMunicipio);
        }
        selAlfMun(ui.item.geojson);
    },
    open: function () {
        $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
        $(this).addClass("list-group");
    },
    close: function () {
        $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
    }
}).keypress(function (e) {
    if (e.keyCode === 13) {
        e.preventDefault();
        return false;
    }
}).autocomplete("instance")._renderItem = function (ul, item) {
    ul.addClass("list-group");
    ul.addClass("Ancho");
    return $('<li class="list-group-item ">')
        .append('<small>' + item.label + '</small>' +
                '</li>').appendTo(ul);
};


var selAlfMun = function (json) {
    if (map.hasLayer(LyrMunicipio)) {
        map.removeLayer(LyrMunicipio);
    }
    //console.log(json);

    LyrMunicipio = L.geoJson(json, {
        style: function (feature) {
            return {
                color: '#00FFFC',
                weight: 6,
                opacity: 1,
                fillOpacity: 0.007
            }
        }
    }).addTo(map);
    map.fitBounds(LyrMunicipio.getBounds());
    LyrMunicipio.bringToBack();
}


function LimpiarBusquedaMapa(){
    if (map.hasLayer(LyrMunicipio)) {
        map.removeLayer(LyrMunicipio);
    }

    map.setView([4.12521648, -74.5020], 5);
   
};


function clearBusqueda() {
    LimpiarBusquedaMapa();
    $('#searchCiudad').val('');
    $('#ListaCiudad .clearfix').removeClass('active');
    $('#searchCiudad').focus();
var e = jQuery.Event("change");
    $('#searchCiudad').trigger(e);
}
$("#BtnBusquedaLimpiar").click(function (event) {
    clearBusqueda();
});

$("#BtnLimpiarMun").click(function (event) {
    LimpiarBusquedaMapa();
    $("#city").val("");
    $("#city").focus();
});

