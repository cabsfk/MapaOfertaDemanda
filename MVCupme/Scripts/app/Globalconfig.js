
//Servicios Informacion Fondos.\\

var config = {
    dominio: "http://arcgis.simec.gov.co:6080", //Dominio del arcgis server  "http://localhost:6080" //http://arcgis.simec.gov.co:6080
    urlHostDataMA: "/arcgis/rest/services/UPME_MI/UPME_MI_Oferta_Demanda/",
    urlHostDP: "/arcgis/rest/services/UPME_BC/UPME_BC_Sitios_UPME_Division_Politica/",
    DPTO_GEN: "0",
    MPIO_GEN: "1",
    ep_demandas: "2",
    EP_OFERTA: "3",
    EP_ESTUDIOS: "5",
    EP_MINERALES: "6",
    EP_OFERTA_MUN: "7"

}




var glo = {
    Anio: 0,
    DEMANDA_ANIO:0,
    Materiales: [],
    Arraycentroid: '',
    ArrayOfertas: '',
    ArrayOfertasMun: '',
    lyrControl:'',
    lyrMate: '',
    lyrOferta: '',
    lyrBaseMunDpto:'',
    extend: {
        "type": "FeatureCollection",
        "features": [
          {   "type": "Feature",
              "properties": {},
              "geometry": {
                  "type": "Polygon",
                  "coordinates": [[
                    [-80, -4.5],
                    [-80, 13],
                    [-65, 13],
                    [-65, -4.5],
                    [-80, -4.5]
                  ]]
              }
          }]
    },
    breaks:'',
    textMineral: "",
    listEstudio: "",
    jsonMun: "",
    jsonMunFil: "",
    jsonDto:"",
    layerStyle: "",
    UniMate: "",
    maxDataCircle: '',
    ArrayRestric: [],
    pointTemp : {
        "type": "FeatureCollection",
        "features": [
          {
              "type": "Feature",
              "properties": {
                  NUMERO_EMPLEADOS: 0,
                  COSTO_PRODUCCION: 0,
                  PRODUCCION_ACTUAL: 0,
                  PRECIO_VENTA: 0
              },
              "geometry": {
                  "type": "Point",
                  "coordinates": [-73.75768672, 4.0477121]
              }
          }]
    },
    addlegend:false,
    aggregations:[
          {
              aggregation: 'sum',
              inField: 'NUMERO_EMPLEADOS',
              outField: 'numEmp_sum'
          },
          {
              aggregation: 'average',
              inField: 'COSTO_PRODUCCION',
              outField: 'CosPro_avg'
          },
          {
              aggregation: 'sum',
              inField: 'PRODUCCION_ACTUAL',
              outField: 'ProAct_sum'
          },
          {
              aggregation: 'average',
              inField: 'PRECIO_VENTA',
              outField: 'PreVen_avg'
          },
          {
              aggregation: 'count',
              inField: '',
              outField: 'point_count'
          }
    ]
}

/***********************************
 // CONFIGURACION DE MAPA
 ***********************************/
var southWest = L.latLng(-15, -90),
    northEast = L.latLng(30, -60),
    bounds = L.latLngBounds(southWest, northEast);

var map = L.map('map', {
    center: [4.12521648, -74.5020],
    zoom: 5,
    minZoom: 5,
    maxZoom:11,
    maxBounds: bounds,
    zoomControl: false
});

new L.Control.Zoom({ position: 'topright' }).addTo(map);

/*********************************
//CONFIGURACION DE FORMATO
**********************************/
var legend = L.control({ position: 'bottomright' });
var pagina = document.URL.split("/");
var Nombrepagina = pagina[pagina.length - 1];
Nombrepagina = Nombrepagina.replace("#", "");
var prefijo = "";
if (Nombrepagina == "") {
    prefijo = "./";
}else{
    prefijo = "../";
}

function getColor(d) {
    return d >= glo.breaks[5] ? '#FC4E2A' :
            d >= glo.breaks[4] ? '#FD8D3C' :
            d >= glo.breaks[3] ? '#FEB24C' :
            d >= glo.breaks[2] ? '#FED976' :
            d >= glo.breaks[1] ? '#FFEDA0' :
              'rgba(255,255,255,0.8)';
}


legend.onAdd = function (map) {
  
    var div = L.DomUtil.create('div', 'info legend');
       
    div.innerHTML +=
        '<div id="LegendDemanda"><svg height="140" width="160" >' +
        '<rect x="1" y="1" width="160" height="140" fill="rgba(220,220,220,0.3)" />'+
        '<text x="45" y="15" fill="black"  font-weight = "bold">Demanda</text>'+
            '<rect x="40" y="26"  width="15" height="15" style="fill:red" />'+
            '<text x="65" y="40" fill="black"  >Déficit</text>'+
            '<rect x="40" y="46"  width="15" height="15" style="fill:rgb(82,168,131)" />'+
            '<text x="65" y="59" fill="black"  >Superávit</text>'+
            '<circle cx="20" cy="90" r="5" stroke="white" stroke-width="3"  fill="rgb(220,220,220)" />'+
            '<circle cx="40" cy="90" r="10" stroke="white" stroke-width="3" fill="rgb(220,220,220)" />'+
            '<circle cx="70" cy="90" r="15" stroke="white" stroke-width="3" fill="rgb(220,220,220)" />'+
            '<circle cx="115" cy="90" r="20" stroke="white" stroke-width="3" fill="rgb(220,220,220)" />'+
            '<text x="0" y="130" fill="black" id="valuemin">1</text>'+
            '<text x="68" y="130" fill="black" id="valuemax"></text>'+
            '</svg><hr></div>';

     labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
     div.innerHTML += '<div id="LegendOferta"><center><b>Oferta <span id="UniOferta"></span></b></center>';

     for (var i = 0; i < glo.breaks.length; i++) {
         if (i == 0) {
             div.innerHTML +=
             '<i style="background:' + getColor(glo.breaks[i] + 1) + '"></i> ' +
             numeral(glo.breaks[i]).format('0,0') + '&ndash;' + '<br>';
         } else if (i ==(glo.breaks.length - 1)) {
             div.innerHTML +=
            '<i style="background:' + getColor(glo.breaks[i] + 1) + '"></i> ' +  numeral(glo.breaks[i]).format('0,0') + ' +';

         } else {
             div.innerHTML +=
             '<i style="background:' + getColor(glo.breaks[i] + 1) + '"></i> ' +
             numeral(glo.breaks[i]).format('0,0') + (numeral(glo.breaks[i + 1]).format('0,0') ? '&ndash;' + numeral(glo.breaks[i + 1]).format('0,0') + '<br>' : '+');
         }

     }
     div.innerHTML += '</div><center><b>Convenciones</b></center>';

     div.innerHTML += '<i ><img src="images/leyend/municipioSelecionado.png"  height="17px"></i>Municipio Seleccionado<br>';
     return div;
    
};

$("#BtnMonstrarConven").click(function () {
    if ($(".legend").is(":visible")) {
        $(".legend").hide("slow", function () {
            $("#textlegend").empty().append("Mostrar");
        });
    } else {
        $(".legend").show("slow", function () {
            $("#textlegend").empty().append("Ocultar");
        });
    }
    
});


Array.prototype.unique = function (a) {
    return function () { return this.filter(a) }
}(function (a, b, c) {
    return c.indexOf(a, b + 1) < 0
});



/*********************************
//CAPAS BASE 
**********************************/

// Activacion de carousel
$('.carousel').carousel({
    interval: 7000
});

var OpenMapSurfer_Roads =  L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}', {
	type: 'map',
	ext: 'jpg',
	attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	subdomains: '1234'
});

var LyrBase = L.esri.basemapLayer('Imagery').addTo(map);;
var LyrLabels;

function setBasemap(basemap) {
    if (map.hasLayer(LyrBase)) {
        map.removeLayer(LyrBase);
    }
    if (basemap != "OSM") {
        LyrBase = L.esri.basemapLayer(basemap);
    } else {
        LyrBase = OpenMapSurfer_Roads;
    }
    map.addLayer(LyrBase);
    $(".esri-leaflet-logo").hide();
    $(".leaflet-control-attribution").hide();
}

$("#BaseESRIStreets, #BaseESRISatellite, #BaseESRITopo, #BaseOSM").click(function () {
    setBasemap($(this).attr('value'));
})

$(".esri-leaflet-logo").hide();
$(".leaflet-control-attribution").hide();

var osm2 =  L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}', {
	type: 'map',
	ext: 'jpg',
	attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	subdomains: '1234'
});

var miniMap = new L.Control.MiniMap(osm2, { toggleDisplay: true, width: 190, height: 90, zoomLevelOffset: -6 });

//miniMap.addTo(map);

var promptIcon = ['glyphicon-fullscreen'];
var hoverText = ['Extensión Total'];
var functions = [function () {
    map.setView([4.12521648, -74.5020], 5);
}];


$(function () {
    for (i = 0; i < promptIcon.length ; i++) {
        var funk = 'L.easyButton(\'' + promptIcon[i] + '\', <br/>              ' + functions[i] + ',<br/>             \'' + hoverText[i] + '\'<br/>            )'
        $('#para' + i).append('<pre>' + funk + '</pre>')
        explaination = $('<p>').attr({ 'style': 'text-align:right;' }).append('This created the <i class="' + promptIcon[i] + (promptIcon[i].lastIndexOf('fa', 0) === 0 ? ' fa fa-lg' : ' glyphicon') + '"></i> button.')
        $('#para' + i).append(explaination)
        L.easyButton(promptIcon[i], functions[i], hoverText[i])
    } (i);
});


$('#date_ini').datetimepicker({
    format: 'DD/MM/YYYY',
    locale: 'es',
    defaultDate: '01/01/' + moment().format('YYYY')
});
$('#date_fin').datetimepicker({
    format: 'DD/MM/YYYY',
    locale: 'es',
    defaultDate: moment()
});

$("#panel_superDerecho").hide();

waitingDialog.show();


var query_Mineral = L.esri.Tasks.query({
    url: config.dominio + config.urlHostDataMA + 'MapServer/'+config.EP_MINERALES
});

query_Mineral.where("1='1'").returnGeometry(false).run(function (error, featureCollection) {
    var data = [];
    $.each(featureCollection.features.reverse(), function (index, value) {
        data[value.properties.ID_MINERAL ] = value.properties.NOMBRE ;
    });
    glo.textMineral = data;
});



var query_Estudio = L.esri.Tasks.query({
    url: config.dominio + config.urlHostDataMA + 'MapServer/' + config.EP_ESTUDIOS
});

query_Estudio.where("1='1'").returnGeometry(false).run(function (error, featureCollection) {
    var data = [];
   // $("#selecEstudio").append('<option value="" > </option>');
    $.each(featureCollection.features.reverse(), function (index, value) {
        data[value.properties.ID_ESTUDIO] = value.properties.NOMBRE + ' ( ' + value.properties.ANIO + ' ) ';
        $("#selecEstudio").append('<option value="' + value.properties.ID_ESTUDIO + '" >' + value.properties.ID_ESTUDIO + '. ' + value.properties.NOMBRE.substring(0, 150) + '... ( ' + value.properties.ANIO + ' ) ' + '</option>');
    });
    $("#selecEstudio").val((featureCollection.features.length));
    glo.listEstudio = data;
});





$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    var idnewtab = ($(e.target).attr('href'));
    $(idnewtab + "Color").addClass("text-primary");

    var idoldtab = ($(e.relatedTarget).attr('href'));
    $(idoldtab + "Color").removeClass("text-primary");

});

$(function () {
    $('[data-toggle="tooltip"]').tooltip();
    $("#SelctRestricciones").multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        selectAllText: 'Todos',
        enableCaseInsensitiveFiltering: true,
        dropRight: false,
        buttonWidth: '250px',
        
        filterPlaceholder: 'Buscar...',
        buttonText: function (options, select) {
            
            glo.ArrayRestric = [];
            if (options.length === 0) {
                if (glo.ArrayOfertas != '') {
                    getParametroFilter();
                }
                
                return 'No hay Seleccionados';
            }
            else {
                var labels = [];
                options.each(function () {
                    console.log($(this).attr('value'));
                    glo.ArrayRestric.push($(this).attr('value'));
                    if ($(this).attr('label') !== undefined) {
                        labels.push($(this).attr('label'));
                    }
                    else {
                        labels.push($(this).html());
                    }
                });
                getParametroFilter();
                return labels.join(', ') + '';
            }
        }
    });
 });
