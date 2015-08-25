/***************
DEMANDA
****************/

function getParametroFilter() {
    legend.removeFrom(map);
    var filterOferta = turf.filter(glo.ArrayOfertas, 'FK_ID_MINERAL', parseInt($("#selecMineral").val()));
    $.each(glo.ArrayRestric, function (index, value) {
        filterOferta = turf.remove(filterOferta, value, 1);
    });
    //console.log(filterOferta);

 
    if (filterOferta.features.length>0) {
        addOferta(filterOferta);
    } else {
        addOferta(glo.pointTemp);
    }
    VerLegend();
}

$("#selecMineral").change(function () {
    var filteredDemanda = turf.filter(glo.Arraycentroid, 'MINERAL', $("#selecMineral").val());
    resetMapa();
    addCentroid(filteredDemanda);
    getParametroFilter();
});

$("#selecEscala").change(function () {
    getParametroFilter();    
});


function calRadio(Arraycentroid) {
    //console.log(glo.DEMANDA_ANIO);
    var gmax = turf.max(glo.extend, Arraycentroid, 'DEMANDA_ANIO_' + glo.DEMANDA_ANIO, 'max');
    glo.maxDataCircle = gmax.features[0].properties.max;
    $("#valuemin").empty().append('1 ' + glo.UniMate);
    $("#valuemax").empty().append(numeral(glo.maxDataCircle).format('0,0') + ' ' + glo.UniMate);
    var pixel = 20;
    var Dem = turf.filter(glo.ArrayOfertasMun, 'FK_ID_MINERAL', parseInt($("#selecMineral").val()));
    for (i = 0; i < Arraycentroid.features.length; i++) {
        Arraycentroid.features[i].properties.RADIO = ((Arraycentroid.features[i].properties["DEMANDA_ANIO_" + glo.DEMANDA_ANIO] * pixel) / glo.maxDataCircle);
        var DemDep = turf.filter(Dem, 'FK_ID_DEPARTAMENTO', Arraycentroid.features[i].properties.DEMANDANTE_DEPARTAMENTO);
        if (DemDep.features.length > 0) {
            var DemMun = turf.filter(DemDep, 'FK_ID_MUNICIPIO', Arraycentroid.features[i].properties.DEMANDANTE_MUNICIPIO);
            if (DemMun.features.length > 0) {
                Arraycentroid.features[i].properties.ProMun = DemMun.features[0].properties.PRODUCCION;
            } else {
                Arraycentroid.features[i].properties.ProMun = 0;
            }
        } else {
            Arraycentroid.features[i].properties.ProMun = 0;
        }
        
    }
    //console.log(Arraycentroid);
    return Arraycentroid;
}
function styleCircle(feature) {
    var color;
    if (feature.properties.ProMun > feature.properties["DEMANDA_ANIO_" + glo.DEMANDA_ANIO]) {
        color = "rgb(82,168,131)"
    } else {color = "red" }
    return {
        radius: feature.properties.RADIO,
        fillColor: color,
        color: "white",
        weight: 2,
        opacity: 1,
        fillOpacity: 1
    };
}

function resetMapa() {
    $("#panel_superDerecho").hide();
    if (glo.layerStyle != "") {
        glo.lyrMate.resetStyle(glo.layerStyle);
    }
}
$("#closePanelDem").click(function () {
    resetMapa();
});

function BarsDemanda(properties) {
    var Num = parseInt(properties.ANIO_REGISTRO);
    $('#containerDemanda').highcharts({
        chart: {
            height: 300,
            marginTop: 60,
            type: 'column'
        },
        title: {
            text: 'Demanda Proyectada'  
        },
        subtitle: {
            text: properties.Nombre
        },
        credits: {
            text: 'Mineria-UPME',
            href: 'http://www.upme.gov.co'
        },
        xAxis: {
            type: 'category',
            labels: {
                rotation: -45,
                style: {
                    fontSize: '9px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: ''
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            formatter: function () {
                return 'Demanda en ' + this.key + ':<br> <b>' +numeral(this.y).format('0,0')+ ' </b>';
            }
        },
        plotOptions: {
            column: {
                grouping: true,
                shadow: true,
                borderWidth: 0,
                pointPadding: 0,
                pointPlacement: -0.2

            }
        },
        series: [{
            name: 'Demanda',
            data: [
                [Num, properties.DEMANDA_ANIO_0],
                [Num + 1, properties.DEMANDA_ANIO_1],
                [Num + 2, properties.DEMANDA_ANIO_2],
                [Num + 3, properties.DEMANDA_ANIO_3],
                [Num + 4, properties.DEMANDA_ANIO_4],
                [Num + 5, properties.DEMANDA_ANIO_5],
                [Num + 6, properties.DEMANDA_ANIO_6],
                [Num + 7, properties.DEMANDA_ANIO_7],
                [Num + 8, properties.DEMANDA_ANIO_8],
                [Num + 9, properties.DEMANDA_ANIO_9]
                
            ],
            dataLabels: {
                enabled: false/*,
                rotation: -90,
                color: '#FFFFFF',
                align: 'right',
                y: 10, // 10 pixels down from the top
                formatter: function () {
                    return numeral(this.y).format('0,0');
                },
                style: {
                    fontSize: '10px',
                    fontFamily: 'Verdana, sans-serif'
                }*/
            }
        }], 
         exporting: {
            filename: 'Demanda-Proyectada'
        }
    });

}


function clickToFeature(e) {
    
    if (glo.layerStyle != "") {
        glo.lyrMate.resetStyle(glo.layerStyle);
    }
    var feature = e.target.feature;
    glo.layerStyle = e.target;
    var color;
    if (feature.properties.ProMun > feature.properties["DEMANDA_ANIO_" + glo.DEMANDA_ANIO]) {
        color = "rgb(82,168,131)"
    } else { color = "red" }
    glo.layerStyle.setStyle({
        radius: feature.properties.RADIO,
        fillColor: color,
        color: "#00BFFF",
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9
    });
    $("#panel_superDerecho").show();
    BarsDemanda(feature.properties);
    if (!L.Browser.ie && !L.Browser.opera) {
        glo.layerStyle.bringToFront();
    }
}

function graficarDemandaMun(nomGraficaDemanda, dataGraficaDemanda, dataGraficaProduccion) {
    $('#GraficaDemanda').highcharts({
        chart: {
            type: 'bar'
        },
        title: {
            text: 'Demanda'
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            categories: nomGraficaDemanda,
            title: {
                text: null
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Cantidad',
                align: 'high'
            },
            labels: {
                overflow: 'justify'
            }
        },
        /*tooltip: {
            valueSuffix: ' millions'
        },*/
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: false
                }
            }
        },
        credits: {
            enabled: false
        },
        series: [{
            name: 'Demanda',
            data: dataGraficaDemanda
        }, {
            name: 'Produccion',
            data:dataGraficaProduccion
        }
        ]
    });
};

function addCentroid(Arraycentroid) {
    
    Arraycentroid=calRadio(Arraycentroid);
    if (map.hasLayer(glo.lyrMate)) {
        map.removeLayer(glo.lyrMate);
    }
    var dataGraficaDemanda = [], nomGraficaDemanda = [],dataGraficaProduccion = [];
    if (map.hasLayer(glo.lyrMate)) {
        map.removeLayer(glo.lyrMate);
    }
    glo.lyrMate = L.geoJson(Arraycentroid, {
        onEachFeature: function (feature, layer) {
            layer.on({
                click: clickToFeature
            });
        },
        style: styleCircle,
        pointToLayer: function (feature, latlng) {
            //console.log(feature.properties.RADIO);
            var circle = L.circleMarker(latlng, styleCircle);
            var textlabel = '<center><b>DEMANDA</b></center>' +
                '<h6>' + feature.properties["Nombre"] + '</h6>' +
                '<small class="text-muted">Cantidad Demandada:</small> '+numeral(feature.properties["DEMANDA_ANIO_" + glo.DEMANDA_ANIO]).format('0,0') + ' ' + glo.UniMate +
                '<br><small class="text-muted">Cantidad Producida:</small> '+numeral(feature.properties.ProMun).format('0,0') + ' ' + glo.UniMate ;
            dataGraficaDemanda.push(feature.properties["DEMANDA_ANIO_" + glo.DEMANDA_ANIO]);
            dataGraficaProduccion.push(feature.properties.ProMun);
            nomGraficaDemanda.push(feature.properties["Nombre"]);
            circle.bindLabel(textlabel, { 'noHide': false });

            return circle
        }
    });
    glo.lyrMate.addTo(map).bringToFront();

    graficarDemandaMun(nomGraficaDemanda, dataGraficaDemanda, dataGraficaProduccion);
    controlcapas();
}


/*************************
OFERTA
**************************/

function onEachOferta(feature, layer) {

    var nombre;
    //console.log(feature);
    if ($("#selecEscala").val() == "Municipio") {
        nombre = feature.properties.MPIO_CNMBR+ ' - '+getDto(feature.properties.DPTO_CCDGO);
    } else if ($("#selecEscala").val() == "Departamento") {
        nombre = feature.properties.NOMBRE;
    }
    var textProme ='';
    if (feature.properties["CosPro_avg"]>0) {
        textProme='<br><small class="text-muted">Costo de Produccion Promedio:</small> ' +
         numeral(feature.properties["CosPro_avg"]).format('0,0') + ' $/' + glo.UniMate +
        '<br><small class="text-muted">Precio Venta Promedio:</small> ' +
                 numeral(feature.properties["PreVen_avg"]).format('0,0') + ' $/' + glo.UniMate;
    }
        
    var textlabel = '<center><b>OFERTA</b></center>'+
        '<h6>' + nombre + '</h6>' +
        '<small class="text-muted">Produccion Actual:</small> ' +
             numeral(feature.properties["ProAct_sum"]).format('0,0') + ' ' + glo.UniMate+
        '<br><small class="text-muted">Numero Empleados:</small> ' +
         numeral(feature.properties["numEmp_sum"]).format('0,0')+
        textProme+
        '<br><small class="text-muted">Cantidad UPM:</small> ' +
                 numeral(feature.properties["point_count"]).format('0,0');


    layer.bindLabel( textlabel,{ 'noHide': true });
}
function styleDptoOfer(feature) {
    return {
        weight: 1.5,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.8,
        fillColor: getColor(feature.properties.ProAct_sum),
    };
};
function styleMun(feature) {
    return {
        weight: 1.5,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.5,
        fillColor: 'white',
    };
};
function getIDMun(filterOferta) {
    var idMun = [];
    $.each(filterOferta.features, function (index, value) {
        idMun.push(value.properties.ID_DEPARTAMENTO + value.properties.ID_MUNICIPIO);
    });
    
    var UniIdMun=idMun.unique();
    return UniIdMun;
}

function getJsonMunFil(idMun) {
    var arraymun=[];
    $.each(idMun, function (index, value) {
        var filterOferta = turf.filter(glo.jsonMun, 'MPIO_CCNCT', value);
        arraymun.push(JSON.parse(JSON.stringify(filterOferta.features[0])));
    });
    var fc = turf.featurecollection(arraymun);
    return fc;
}
function calEstadisticas(polygons, points) {
    var aggregated = turf.aggregate(polygons, points, glo.aggregations);
    var removeAggregated = turf.remove(aggregated, 'ProAct_sum', 0);
    if (removeAggregated.features.length > 0) {
        //console.log(removeAggregated);
        if (removeAggregated.features.length > 5) {
            glo.breaks = turf.jenks(removeAggregated, 'ProAct_sum', 5);
        } else {
            glo.breaks = turf.jenks(removeAggregated, 'ProAct_sum', removeAggregated.features.length-1);
        }
        
        /*console.log(' glo.breaks');
        console.log(glo.breaks);*/
        if (glo.breaks != null) {
            glo.breaks[0] = 0;
        } else {
            glo.breaks = [];
            glo.breaks.push(0);
        }
        
    } else {
        glo.breaks = [];
        glo.breaks.push(0);
    }

    $.each(aggregated.features, function (index, value) {
        if (isNaN(value.properties.CosPro_avg)) {
            value.properties.CosPro_avg = 0;
            value.properties.PreVen_avg = 0;
        }
    });
    return aggregated;
}

function addOferta(filterOferta) {
    var aggregados = '';
    if (map.hasLayer(glo.lyrMunicipio)) {
        map.removeLayer(glo.lyrMunicipio);
    }
    if ($("#selecEscala").val() == "Municipio") {
        var idMun = getIDMun(filterOferta); 
        glo.jsonMunFil = getJsonMunFil(idMun);
        
        glo.lyrMunicipio = L.geoJson(glo.jsonMun, {
            style: styleMun
        }).addTo(map);
        aggregados = calEstadisticas(glo.jsonMunFil, filterOferta);
    } else if ($("#selecEscala").val() == "Departamento") {
        aggregados = calEstadisticas(glo.jsonDto, filterOferta);
    }
    
    
    if (map.hasLayer(glo.lyrOferta)) {
        map.removeLayer(glo.lyrOferta);
    }
    
    glo.lyrOferta = L.geoJson(aggregados, {
        onEachFeature: onEachOferta,
        style: styleDptoOfer
    });

    glo.lyrOferta.addTo(map).bringToBack();

    if (map.hasLayer(glo.lyrMunicipio)) {
        glo.lyrMunicipio.bringToBack();
    }
    controlcapas();
}

map.on('overlayadd', function (eventLayer) {
    // Switch to the Population legend...
    
    if (eventLayer.name === 'Demanda') {
        glo.lyrMate.bringToFront();
       // $('#LegendDemanda').show();        
    }
    if (eventLayer.name === 'Oferta' ) {
        glo.lyrMate.bringToFront();
        //$('#LegendOferta').show();        
    }
});
map.on('overlayremove', function (eventLayer) {
    // Switch to the Population legend...

    if (eventLayer.name === 'Demanda') {
        //$('#LegendDemanda').hide();        
    }
    if (eventLayer.name === 'Oferta') {
       // $('#LegendOferta').hide();
        
    }
});