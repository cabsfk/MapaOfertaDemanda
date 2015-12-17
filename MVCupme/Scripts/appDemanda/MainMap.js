/***************
DEMANDA
****************/

function getParametroFilter() {
    legend.removeFrom(map);
    var filterDemanda = turf.filter(glo.ArrayDemanda, 'MINERAL', $("#selecMineral").val());
    
 
    if (filterDemanda.features.length > 0) {
        addDemanda(filterDemanda);
    } else {
        addDemanda(glo.pointTemp);
    }
    VerLegend();
}

$("#selecMineral").change(function () {
    getUniMate($("#selecMineral").val());
    $('#tituloMineral').empty().append(glo.textMineral[$("#selecMineral").val()]);
    getParametroFilter();
});

$("#selecEscala").change(function () {
    getParametroFilter();    
});

function selecEstudiochange() {
    if (glo.addlegend == true) {
        legend.removeFrom(map);
    }
    glo.Anio = 0;
    waitingDialog.show();
    CargaOfertaDemanda();
    
};



function setParametroGrafica(geojson) {
    var nombre = '';
    if (geojson.features[0].properties.MPIO_CCNCT == undefined) {
        nombre = "NOMBRE";
    } else {
        nombre = "MPIO_CNMBR";
    }    
    var dataGraficaOferta = [], nomGraficaOferta = [];
    var data = [];
    for (i = 0; i < geojson.features.length; i++) {
        data.push( { 'name': geojson.features[i].properties[nombre], 'item': geojson.features[i].properties[glo.varMapeo]});
    }
    data = sortByKey(data, 'item');
    for (i = 0; i < data.length; i++) {
        dataGraficaOferta.push(data[i].item);
        nomGraficaOferta.push(data[i].name);
    }
    var titulo = '';
    titulo = 'Información relacionada con la Demanda  identificada por el estudio por ' + $('#selecEscala  option:selected').text();
    
    var subtitulo = '';
    subtitulo = $("#selecMineral   option:selected").text() + "<br>Año " + parseInt($("#time" + glo.DEMANDA_ANIO).text());
    graficarOferta(dataGraficaOferta, nomGraficaOferta, titulo, subtitulo);
}
function graficarOferta(dataGraficaOferta, nomGraficaOferta,titulo,subtitulo) {
    $('#GraficaGlobal').empty();
      $('#GraficaGlobal').highcharts({
            chart: {
                type: 'bar',
                height: 30 * dataGraficaOferta.length+180
            },
            title: {
                text: ''
            },
            subtitle: {
                text: titulo+"<br>"+subtitulo
            },
            xAxis: {
                categories: nomGraficaOferta.reverse(),
                title: {
                    text: null
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: '',
                    align: ''
                },
                labels: {
                    overflow: 'justify'
                }
            },tooltip: {
                pointFormat: '<b>{point.y} ' + glo.UniMate + '</b>',
            }				
            ,
            plotOptions: {
                    bar:
						{
						    allowPointSelect: true,
						    cursor: 'pointer',
						    dataLabels: {
						        enabled: false,
						    }
						, showInLegend: false
						}
                
            },
            credits: {
                text: 'Mineria-UPME',
                href: 'http://www.upme.gov.co'
            },
            series: [{
                name:'-',
                data: dataGraficaOferta.reverse(),
                color: '#044D91'
            }
            ],
            exporting: {
                filename: 'Demanda por Sitio'
            }
        });
    
};



function onEach(feature, layer) {

    var nombre;
  
    if (feature.properties.MPIO_CCNCT == undefined) {
        nombre = feature.properties["NOMBRE"];
    } else {
        nombre = feature.properties.MPIO_CNMBR;
    }

    var textlabel = '<center><b><h5>' + nombre + '</h5></b></center>' +
        '<small>Demanda:</small>: ' +
        numeral(feature.properties[glo.varMapeo]).format('0,0') + ' ' + glo.UniMate+
        '<br><small class="text-muted">Identificado(a,os,as)por el estudio.</small>';
    layer.bindLabel(textlabel, { 'noHide': true });
}
function styleDptoMun(feature) {
    return {
        weight: 1.7,
        color: 'rgba(255,255,255,0.3)',
        dashArray: '3',
        fillOpacity: 0.8,
        fillColor: getColor(feature.properties[glo.varMapeo]),
    };
};
function stylePoly(feature) {
    return {
        weight: 1.2,
        color: 'white',
        fillOpacity: 0.4,
        fillColor: 'white',
    };
};




function clicklistaDptoMun(IdDptoMun,escala,nombre) {
    $('#ListaCiudad .clearfix').removeClass('active');
    $('#DptoMun' + IdDptoMun).addClass('active');
    console.log(IdDptoMun);
    console.log(escala);
    if (escala == 'Dpto') {
        var json = getDtoGeo(IdDptoMun);
        selAlfMun(json);
    } else {
        var value = [IdDptoMun];
        var json = getJsonMunFil(value);
        //console.log(json);
        selAlfMun(json);
    }
    $('#searchCiudad').val(nombre);


}
function ListBusquedaMunDpto(fc) {
    var active = '';
    if (glo.listDtoMun == '') {
        active = '';
    }

    if(fc.properties.MPIO_CCNCT==undefined){
        glo.listDtoMun =
        glo.listDtoMun + '<li class="left">' +
        '<div id="DptoMun' + fc.properties.CODIGO_DEP +
            '" class="clearfix ' + active + '" onclick="clicklistaDptoMun(\'' + fc.properties.CODIGO_DEP + '\',\'Dpto\',\''+fc.properties.NOMBRE+'\')">' +
                '<h5>' +fc.properties.NOMBRE
                + '</h5>' +
            '</div>' +
        '</li>';

    }else{
        glo.listDtoMun =
        glo.listDtoMun + '<li class="left">' +
        '<div id="DptoMun' + fc.properties.MPIO_CCNCT +
            '" class="clearfix ' + active + '" onclick="clicklistaDptoMun(\'' + fc.properties.MPIO_CCNCT + '\',\'Mun\',\'' + fc.properties.MPIO_CNMBR + '\')">' +
                '<h5>' + fc.properties.MPIO_CNMBR
                + '</h5>' +
            '</div>' +
        '</li>';
    }
    
}




function getIDMunDpt(filterOferta) {
    var idMun = [], idDepto = [], idMunDpto = [];
    //console.log(filterOferta);
    $.each(filterOferta.features, function (index, value) {
        idMun.push(value.properties.DEMANDANTE_DEPARTAMENTO + value.properties.DEMANDANTE_MUNICIPIO);
        idDepto.push(value.properties.DEMANDANTE_DEPARTAMENTO);
        value.properties.DPTOMUN = value.properties.DEMANDANTE_DEPARTAMENTO + value.properties.DEMANDANTE_MUNICIPIO;
    });

    var UniIdMun = idMun.unique();
    var UniIdDeto = idDepto.unique();
    //console.log(UniIdMun);
    //console.log(UniIdDeto);
    idMunDpto = [UniIdDeto, UniIdMun];
    return idMunDpto;
}

function sumCampo(fc, campo) {
    var sum_Campo = 0;
    for (var i = 0; i < fc.features.length; i++) {
        sum_Campo = sum_Campo + fc.features[i].properties[campo];

    }
    return sum_Campo;
}
function calEstadisticasMun(polygons, points, vec, filtro) {
    var arraymun = [];
    glo.listDtoMun = '';
    $("#DivListaCiudad").empty().append('<div id="ListaCiudad"><ul class="chat"></ul></div></div>');
    $.each(vec, function (index, value) {
        var filterDemanda = turf.filter(points, filtro[0], value);
        var filter = turf.filter(polygons, filtro[1], value);
        filter.features[0].properties.Demanda = sumCampo(filterDemanda, "DEMANDA_ANIO_" + glo.DEMANDA_ANIO);
        arraymun.push(filter.features[0]);
        ListBusquedaMunDpto(filter.features[0]);
    });


    var fc = turf.featurecollection(arraymun);

    $("#ListaCiudad .chat").empty().prepend(glo.listDtoMun).searchable({
        searchField: '#searchCiudad',
        selector: 'li',
        childSelector: '.clearfix',
        show: function (elem) {
            elem.slideDown(100);
        },
        hide: function (elem) {
            elem.slideUp(100);
        }
    });;

    var removeAggregated = turf.remove(fc, glo.varMapeo, 0);

    if (removeAggregated.features.length > 0) {
        //console.log(removeAggregated);
        if (removeAggregated.features.length > 5) {
            glo.breaks = turf.jenks(removeAggregated, glo.varMapeo, 5);
        } else {
            glo.breaks = turf.jenks(removeAggregated, glo.varMapeo, removeAggregated.features.length - 1);
        }
        glo.breaks = glo.breaks.unique();
        if (glo.breaks != null) {
            if (glo.breaks[0] != 0) {
                glo.breaks.unshift(0);
            }
        } else {
            glo.breaks = [];
            glo.breaks.push(0);
        }

    } else {
        glo.breaks = [];
        glo.breaks.push(0);
    }

    ///console.log(fc);
    return fc;
}
function addDemanda(filterDemanda) {
    var aggregados = '';
    if (map.hasLayer(glo.lyrBaseMunDpto)) {
        map.removeLayer(glo.lyrBaseMunDpto);
    }

    if ($("#selecEscala").val() == "Municipio") {
        var idMunDpt = getIDMunDpt(filterDemanda);
        var idMun = idMunDpt[1];
        glo.lyrBaseMunDpto = L.geoJson(glo.jsonMun, {
            style: stylePoly
        }).addTo(map);
        aggregados = calEstadisticasMun(glo.jsonMun, filterDemanda, idMun, ['DPTOMUN', 'MPIO_CCNCT']);
        
    } else if ($("#selecEscala").val() == "Departamento") {
        var idMunDpt = getIDMunDpt(filterDemanda);
        var idDpto = idMunDpt[0];
        glo.lyrBaseMunDpto = L.geoJson(glo.jsonDto, {
            style: stylePoly
        }).addTo(map);
        aggregados = calEstadisticasMun(glo.jsonDto, filterDemanda, idDpto, ['DEMANDANTE_DEPARTAMENTO', 'CODIGO_DEP']);
        
    }
    console.log(aggregados)
    setParametroGrafica(aggregados);
    
    if (map.hasLayer(glo.lyrOferta)) {
        map.removeLayer(glo.lyrOferta);
    }
    


    glo.lyrOferta = L.geoJson(aggregados, {
        onEachFeature: onEach,
        style: styleDptoMun
    });

    glo.lyrOferta.addTo(map).bringToBack();
    waitingDialog.hide();
    if (map.hasLayer(glo.lyrBaseMunDpto)) {
        glo.lyrBaseMunDpto.bringToBack();
    }
}
