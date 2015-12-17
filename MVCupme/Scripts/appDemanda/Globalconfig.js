


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
    EP_OFERTA_MUN: "7",
    nota:'Encuentre aquí información relacionada con la Demanda de Minerales de Colombia, proveniente de estudios realizados por la UPME y de información compartida por otras entidades del sector minero.'

}




var glo = {
    Anio: 0,
    DEMANDA_ANIO:0,
    Materiales: [],
    Arraycentroid: '',
    ArrayDemanda: '',
    filterOferta:'',
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
    listEstudio: "",
    listEstudioAnio: "",
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
    aggregations: [
         {
            aggregation: 'sum',
            inField: 'CAPACIDAD_INSTALADA',
            outField: 'capInst_sum'
         },
            {
                aggregation: 'count',
                inField: '',
                outField: 'point_count'
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
              aggregation: 'sum',
              inField: 'NUMERO_EMPLEADOS',
              outField: 'numEmp_sum'
            },
            {
                aggregation: 'count',
                inField: '',
                outField: 'Num_UPM'
            },
            {
                aggregation: 'average',
                inField: 'COSTO_PRODUCCION',
                outField: 'CosPro_avg'
            },
            {
                aggregation: 'sum',
                inField: 'CONSUMO_AGUA',
                outField: 'CosAgua_sum'
            },
            {
                aggregation: 'sum',
                inField: 'CONSUMO_ENERGIA',
                outField: 'ConEnergia_sum'
            }
    ],
    panelOferta:true,
    listDtoMun: '',
    varMapeo: 'Demanda',
    arrayHtmlEst:[],
    bubleMax:[],
    uniBuble:'',
    uniNombre: '',
    idEstudioIni: ''
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
var prefijoUrl = pagina[0] + '/' + pagina[1] + '/' + pagina[2] + '/' + pagina[3];

function getColor(d) {
    return  d >= glo.breaks[6] ? '#BA391F' :
            d >= glo.breaks[5] ? '#FC4E2A' :
            d >= glo.breaks[4] ? '#FD8D3C' :
            d >= glo.breaks[3] ? '#FEB24C' :
            d >= glo.breaks[2] ? '#FED976' :
            d >= glo.breaks[1] ? '#FFF8D2' :
              'rgba(255,255,255,0.8)';
}


legend.onAdd = function (map) {
  
    var div = L.DomUtil.create('div', 'info legend');
  
     labels = [];

    
     div.innerHTML += '<div id="LegendOferta"><center><b>Oferta <span id="UniOferta"></span></b></center>';

     for (var i = 0; i < glo.breaks.length; i++) {
         if (i == 0) {
             div.innerHTML +=
             '<i style="background:' + getColor(glo.breaks[i] + 1) + '"></i><small> ' +
             numeral(glo.breaks[i]).format('0,0') + '&ndash;' + '</small><br>';
         } else if (i ==(glo.breaks.length - 1)) {
             div.innerHTML +=
            '<i style="background:' + getColor(glo.breaks[i] + 1) + '"></i><small> ' + numeral(glo.breaks[i]).format('0,0') + ' +</small><br>';

         } else {
             div.innerHTML +=
             '<i style="background:' + getColor(glo.breaks[i] + 1) + '"></i><small> ' +
             numeral(glo.breaks[i]).format('0,0') + (numeral(glo.breaks[i + 1]).format('0,0') ? '&ndash;' + numeral(glo.breaks[i + 1]).format('0,0') + '<br>' : '+') + '</small>'
             ;
         }

     }
     div.innerHTML += '</div><center><b>Convenciones</b></center>';
     div.innerHTML += '<i ><img src="' + prefijoUrl + '/images/leyend/municipioSelecionado.png"  height="17px"></i><h6>' + $('#selecEscala  option:selected').text() + ' destacado</h6>';
     return div;
};

var mousemove = document.getElementById('mousemove');

map.on('mousemove', function (e) {
    window[e.type].innerHTML = 'Long:' + e.latlng.lng.toFixed(6) + '   Lat:' + e.latlng.lat.toFixed(6);
});
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




$('#PanelOfertaMap,#PanelProyOferta').css('height', ($(window).height() - 50) + 'px');
$('#ListaEstudios').css('max-height', ($(window).height() - 250) + 'px');
map.invalidateSize();
$(window).resize(function () {
    $('#PanelOfertaMap,#PanelProyOferta').css('height', ($(window).height() - 50) + 'px');
    $('#ListaEstudios').css('max-height', ($(window).height() - 250) + 'px');
    map.invalidateSize();
});


Array.prototype.unique = function (a) {
    return function () { return this.filter(a) }
}(function (a, b, c) {
    return c.indexOf(a, b + 1) < 0
});
Array.prototype.max = function () {
    return Math.max.apply(null, this);
};

Array.prototype.min = function () {
    return Math.min.apply(null, this);
};
function sortByKey(array, key) {
    return array.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}
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

var LyrBase = L.esri.basemapLayer('Imagery').addTo(map);
var LyrLabels = L.esri.basemapLayer('ImageryLabels').addTo(map);

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
    if (map.hasLayer(LyrLabels)) {
        map.removeLayer(LyrLabels);
    }

    if (basemap === 'ShadedRelief' || basemap === 'Oceans' || basemap === 'Gray' || basemap === 'DarkGray' || basemap === 'Imagery' || basemap === 'Terrain') {
        LyrLabels = L.esri.basemapLayer(basemap + 'Labels');
        map.addLayer(LyrLabels);
    }
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
$('#BtnOcultarEstudios').click(function () {
    if (glo.panelOferta) {
        $('#PanelProyOferta').css('width', '2%');
        $('#PanelOfertaMap').css('width', '98%');
        $('#PanelOfertaMap').css('left', '2%');
        $('#panelEstudioslist').hide();
        $('#BtnOcultarEstudios').empty().append('<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>');

        
        glo.panelOferta = false;
    } else {
        $('#PanelProyOferta').css('width', '20%');
        $('#PanelOfertaMap').css('width', '80%');
        $('#PanelOfertaMap').css('left', '20%');
        $('#panelEstudioslist').show();
        $('#BtnOcultarEstudios').empty().append('<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>');
        glo.panelOferta = true;
    }
    map.invalidateSize();
});


var query_Estudio = L.esri.Tasks.query({
    url: config.dominio + config.urlHostDataMA + 'MapServer/' + config.EP_ESTUDIOS
});


function styleEstudio(IdEstudio) {
    $('#selecEstudio').val(IdEstudio);
    $('#ListaEstudios .clearfix').removeClass('active');
    $('#Estudio' + IdEstudio).addClass('active');
    $('#tituloEstudio').empty().append(glo.listEstudio[IdEstudio]);
}

function clicklistaestudio(IdEstudio) {
    styleEstudio(IdEstudio);
    selecEstudiochange();
    
}
query_Estudio.where("1='1'").returnGeometry(false).run(function (error, featureCollection) {
    var data = [], data2 = [], active = '';
    // $("#selecEstudio").append('<option value="" > </option>');
   /* $.each(featureCollection.features, function (index, value) {
        if (value.properties.NOMBRE.indexOf('[') >= 0) {
            value.properties.VALIDACION = true;
        } else {
            value.properties.VALIDACION = false;
        }
    });
    featureCollection = turf.filter(featureCollection, 'VALIDACION', true);
    console.log(featureCollection);*/
    $.each(featureCollection.features, function (index, value) {
        data[value.properties.ID_ESTUDIO] = value.properties.NOMBRE + ' ( ' + value.properties.ANIO + ' ) ';
        data2[value.properties.ID_ESTUDIO] = value.properties.ANIO;
        console.log(index);
        if ((featureCollection.features.length) == (index + 1)) {
            glo.idEstudioIni = value.properties.ID_ESTUDIO;
            $("#selecEstudio").append('<option value="' + value.properties.ID_ESTUDIO + '" selected >' + value.properties.ID_ESTUDIO + '. ' + value.properties.NOMBRE.substring(0, 250) + '... ( ' + value.properties.ANIO + ' ) ' + '</option>');
            active = 'active';
            $('#tituloEstudio').empty().append(value.properties.ID_ESTUDIO + '. ' + value.properties.NOMBRE.substring(0, 250) + ' ( ' + value.properties.ANIO + ' ) ');
        } else {
            $("#selecEstudio").append('<option value="' + value.properties.ID_ESTUDIO + '" >' + value.properties.ID_ESTUDIO + '. ' + value.properties.NOMBRE.substring(0, 250) + '... ( ' + value.properties.ANIO + ' ) ' + '</option>');
        }

        glo.arrayHtmlEst[value.properties.ID_ESTUDIO] = '<li class="left">' +
                        '<div id="Estudio' + value.properties.ID_ESTUDIO +
                        '" class="clearfix ' + active + '" onclick="clicklistaestudio(' + value.properties.ID_ESTUDIO + ')">' +
                            '<h6 style="text-align:justify;">' + value.properties.NOMBRE + ' ( ' + value.properties.ANIO + ' ) '
                                    + '</h6>' +
                        '</div>' +
                    '</li>';
        //console.log(glo.arrayHtmlEst[value.properties.ID_ESTUDIO]);
        active = '';
    });

    glo.listEstudio = data;
    glo.listEstudioAnio = data2;
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
        buttonWidth: '280px',
        
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
                    //console.log($(this).attr('value'));
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
BootstrapDialog.show({
    title: 'NOTA ACLARATORIA',
    message: config.nota,
    closable: false,

    buttons: [
      {
        label: 'Entiendo la Aclaración',
        cssClass: 'btn-success',
        action: function (dialogRef) {
            dialogRef.close();
        }
    }]
});


$("#MostrarPanelForm").hide();

$("#OcultarPanelForm").click(function () {
    $("#panel_formulario").hide(200, function () {
        $("#MostrarPanelForm").show(200);
    });
});

$("#MostrarPanelForm").click(function () {
    $("#MostrarPanelForm").hide(200, function () {
        $("#panel_formulario").show(200);
    });
});
