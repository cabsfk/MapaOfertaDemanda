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
    getLayerUPM(parseInt($("#selecEstudio").val()), parseInt($("#selecMineral").val()));
 
    if (filterOferta.features.length>0) {
        addOferta(filterOferta);
    } else {
        addOferta(glo.pointTemp);
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
    CargaOfertaDemanda();
};


/*
function resetMapa() {
    $("#panel_superDerecho").hide();
    if (glo.layerStyle != "") {
        glo.lyrMate.resetStyle(glo.layerStyle);
    }
}
$("#closePanelDem").click(function () {
    resetMapa();
});



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
*/

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
    if( glo.varMapeo=='ProAct_sum'){
        titulo = 'Información relacionada con la oferta identificada por el estudio por ' + $('#selecEscala  option:selected').text();
    } else if (glo.varMapeo == 'capInst_sum') {
        titulo = 'Información relacionada con la oferta Instalada identificada por el estudio por ' + $('#selecEscala  option:selected').text();
    }
    var subtitulo = '';
    subtitulo = $("#selecMineral   option:selected").text() + "<br>Año " + parseInt(glo.Anio);
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
        
    var textlabel = '<center><b>OFERTA</b></center>' +
        '<h6>' + nombre + '</h6>';
    var htmlmapeo;
    if (glo.varMapeo == 'ProAct_sum') {
        htmlmapeo = '<small class="text-muted">Produccion:</small> ' +
             numeral(feature.properties["ProAct_sum"]).format('0,0') + ' ' + glo.UniMate;
    } else {
        htmlmapeo = '<small class="text-muted">Oferta Instalada:</small> ' +
                 numeral(feature.properties["capInst_sum"]).format('0,0') + ' ' + glo.UniMate;
    }
    textlabel = textlabel + htmlmapeo;
    layer.bindLabel( textlabel,{ 'noHide': true });
}
function styleDptoOfer(feature) {
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
function getIDMunDpt(filterOferta) {
    var idMun = [],idDepto=[],idMunDpto=[];
    //console.log(filterOferta);
    $.each(filterOferta.features, function (index, value) {
       // console.log(value.properties.DPTOMUN);
        if (value.properties.DPTOMUN !== undefined) {
            value.properties.ID_DEPARTAMENTO = value.properties.DPTOMUN.substr(0, 2);
            value.properties.ID_MUNICIPIO = value.properties.DPTOMUN.substr(2, 3);
            idMun.push(value.properties.ID_DEPARTAMENTO + value.properties.ID_MUNICIPIO);
            idDepto.push(value.properties.ID_DEPARTAMENTO);
        }else{
            value.properties.DPTOMUN = '00000';
            value.properties.ID_DEPARTAMENTO = '00';
            value.properties.ID_DEPARTAMENTO = '000';
        }   
    });
    //console.log(filterOferta);
    
    var UniIdMun = idMun.unique();
    var UniIdDeto = idDepto.unique();
    idMunDpto = [UniIdDeto,UniIdMun];
    return idMunDpto;
}



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

function calEstadisticasMun(polygons, points, vec,filtro) {
    var arraymun = [];
    glo.listDtoMun = '';
    $("#DivListaCiudad").empty().append('<div id="ListaCiudad"><ul class="chat"></ul></div></div>');
    $.each(vec, function (index, value) {
        var filterOferta = turf.filter(points, filtro[0], value);
        //if (value == '66') { console.log(filterOferta);}
        var aggregated = turf.aggregate(glo.extend, filterOferta, glo.aggregations);
        var filter = turf.filter(polygons, filtro[1], value);
        filter.features[0].properties.capInst_sum = aggregated.features[0].properties.capInst_sum
        filter.features[0].properties.point_count = aggregated.features[0].properties.point_count
        filter.features[0].properties.ProAct_sum = aggregated.features[0].properties.ProAct_sum
        filter.features[0].properties.PreVen_avg = aggregated.features[0].properties.PreVen_avg
        filter.features[0].properties.numEmp_sum = aggregated.features[0].properties.numEmp_sum
        filter.features[0].properties.Num_UPM = aggregated.features[0].properties.Num_UPM
        filter.features[0].properties.CosPro_avg = aggregated.features[0].properties.CosPro_avg
        filter.features[0].properties.CosAgua_sum = aggregated.features[0].properties.CosAgua_sum
        filter.features[0].properties.ConEnergia_sum = aggregated.features[0].properties.ConEnergia_sum
        filter.features[0].properties.AreaInter_sum = aggregated.features[0].properties.AreaInter_sum
        
        arraymun.push(JSON.parse(JSON.stringify(filter.features[0])));
        //console.log(filter.features[0]);
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
            glo.breaks = turf.jenks(removeAggregated,  glo.varMapeo, 5);
        } else {
            glo.breaks = turf.jenks(removeAggregated,  glo.varMapeo, removeAggregated.features.length - 1);
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

    $.each(fc.features, function (index, value) {
        if (isNaN(value.properties.CosPro_avg)) {
            value.properties.CosPro_avg = 0;
            value.properties.PreVen_avg = 0;
        }
    });
    ///console.log(fc);
    return fc;
}

function calCentroid(geojson) {
    var features = [], tmp;
    var ProAct_sum = [], numEmp_sum = [], Num_UPM = [], CosPro_avg = [], CosAgua_sum = [], ConEnergia_sum = [],AreaInter_sum=[];
    
    for (i = 0; i < geojson.features.length; i++) {
        tmp = turf.centroid(geojson.features[i]);
        tmp.properties = JSON.parse(JSON.stringify(geojson.features[i].properties));
        ProAct_sum.push(geojson.features[i].properties.ProAct_sum);
        numEmp_sum.push(geojson.features[i].properties.numEmp_sum);
        Num_UPM.push(geojson.features[i].properties.Num_UPM);
        CosPro_avg.push(geojson.features[i].properties.CosPro_avg);
        CosAgua_sum.push(geojson.features[i].properties.CosAgua_sum);
        ConEnergia_sum.push(geojson.features[i].properties.ConEnergia_sum);
        AreaInter_sum.push(geojson.features[i].properties.AreaInter_sum);
        
        //tmp.properties.Nombre = getMunDto(geojson.features[i].properties.DEMANDANTE_DEPARTAMENTO, geojson.features[i].properties.DEMANDANTE_MUNICIPIO)
        features.push(tmp);
    }
    $('#selecBubles').empty();
    
    $('#selecBubles').append('<option value="" selected>Ninguna </option>');
    ProAct_sum = ProAct_sum.unique();
    glo.bubleMax = [];
    if (ProAct_sum.max()!= 0){ 
        $('#selecBubles').append('<option value="ProAct_sum">Oferta</option>');
        glo.bubleMax["ProAct_sum"] = ProAct_sum.max();
    }
    
    numEmp_sum = numEmp_sum.unique();    
    if (numEmp_sum.max() != 0) {
        $('#selecBubles').append('<option value="numEmp_sum">Numero de empleados </option>');
        glo.bubleMax["numEmp_sum"] = numEmp_sum.max();
    }

    Num_UPM = Num_UPM.unique();
  
    if (Num_UPM.max() != 0) {
        $('#selecBubles').append('<option value="Num_UPM">Numero de UPM </option>');
        glo.bubleMax["Num_UPM"] = Num_UPM.max();
        console.log(glo.bubleMax["Num_UPM"]);
    }
    CosPro_avg = CosPro_avg.unique();    
    if (CosPro_avg.max() != 0) {
        $('#selecBubles').append('<option value="CosPro_avg">Costo Prome. exploracion [$/' + glo.UniMate + ' año]  </option>');
        glo.bubleMax["CosPro_avg"] = CosPro_avg.max();
    }

    CosAgua_sum = CosAgua_sum.unique();    
    if (CosAgua_sum.max() != 0) {
        $('#selecBubles').append('<option value="CosAgua_sum">Consumo de agua [M3/año]</option>');
        glo.bubleMax["CosAgua_sum"] = CosAgua_sum.max();
    }

    ConEnergia_sum = ConEnergia_sum.unique();
    if (ConEnergia_sum.max() != 0) {
        $('#selecBubles').append('<option value="ConEnergia_sum">Consumo energia electrica[kWH/año] </option>');
        glo.bubleMax["ConEnergia_sum"] = ConEnergia_sum.max();
    }
    

    AreaInter_sum = AreaInter_sum.unique();
    if (AreaInter_sum.max() != 0) {
        $('#selecBubles').append('<option value="AreaInter_sum">Area Intervenida[has2/año] </option>');
        glo.bubleMax["AreaInter_sum"] = AreaInter_sum.max();
    }
    Arraycentroid = turf.featurecollection(features);
    return Arraycentroid;
}

function calRadio(Arraycentroid) {
    var Buble = $('#selecBubles').val();
    glo.maxDataCircle = glo.bubleMax[Buble];
    
    if (glo.uniBuble != '') {
        glo.uniBuble = '[' + glo.uniBuble + ']';
    }
    
    $("#tituloBubbles").empty().append(glo.uniNombre);
    $("#uniBubbles").empty().append(glo.uniBuble);
    $("#valuemin").empty().append('1 ' );
    $("#valuemax").empty().append(numeral(glo.maxDataCircle).format('0,0'));
    var pixel = 20;
    for (i = 0; i < Arraycentroid.features.length; i++) {
        Arraycentroid.features[i].properties.RADIO = ((Arraycentroid.features[i].properties[Buble] * pixel) / glo.maxDataCircle);
    }
    return Arraycentroid;
}


function styleCircle(feature) {
    return {
        radius: feature.properties.RADIO,
        fillColor: "rgba(8,41,138,0.5)",
        color: "white",
        weight: 2,
        opacity: 1,
        fillOpacity: 1
    };
}

function addCentroid(Arraycentroid) {

    if (map.hasLayer(glo.lyrMate)) {
        map.removeLayer(glo.lyrMate);
    }

    glo.lyrMate = L.geoJson(Arraycentroid, {
        
        style: styleCircle,
        pointToLayer: function (feature, latlng) {
            var circle = L.circleMarker(latlng, styleCircle);
            console.log(feature);
            var nombre='';
            if (feature.properties.MPIO_CCNCT == undefined) {
                nombre = feature.properties["NOMBRE"];
            } else {
                nombre = feature.properties.MPIO_CNMBR;
            }

            var textlabel = '<center><b><h5>' + nombre + '</h5></b></center>' +
                '<small>' + glo.uniNombre + '</small>: ' +
                numeral(feature.properties[$('#selecBubles').val()]).format('0,0') + ' ' + glo.uniBuble+
                '<br><small class="text-muted">Identificado(a,os,as)por el estudio.</small>';
            circle.bindLabel(textlabel, { 'noHide': false });
            return circle;
        }
    });
    glo.lyrMate.addTo(map).bringToFront();

   
}
function generateBubble() {
    if ($('#selecBubles').val() != '') {
        glo.Arraycentroid = calRadio(glo.Arraycentroid);
        addCentroid(glo.Arraycentroid)
        $('#LegendDemanda').show();
    } else {
        if (map.hasLayer(glo.lyrMate)) {
            map.removeLayer(glo.lyrMate);
        }
        $('#LegendDemanda').hide();
    }
}
$("#selecBubles").change(function () {
    var str = $('#selecBubles option:selected').text();
    if (str.indexOf("[") > 0) {
        var n1 = str.indexOf("[");
        var n2 = str.indexOf("]");
        var tmpUniMate = str.split('[');
        if (n1 > 0) {
            glo.uniNombre = tmpUniMate[0];
            tmpUniMate = tmpUniMate[1].split(']');
            glo.uniBuble=  tmpUniMate[0];
        } else {
            glo.uniNombre = tmpUniMate[0];
            glo.uniBuble=  tmpUniMate[1];
        }
    }else{
        glo.uniBuble = '';
        glo.uniNombre = str;
    }
    
    if (glo.uniNombre == 'Oferta') {
        glo.uniBuble = glo.UniMate;
    }
    generateBubble();
});
function addOferta(filterOferta) {
    var aggregados = '';
    if (map.hasLayer(glo.lyrBaseMunDpto)) {
        map.removeLayer(glo.lyrBaseMunDpto);
    }
    if ($("#selecEscala").val() == "Municipio") {
        var idMunDpt = getIDMunDpt(filterOferta);
        var idMun = idMunDpt[1];
        glo.lyrBaseMunDpto = L.geoJson(glo.jsonMun, {
            style: stylePoly
        }).addTo(map);
        aggregados = calEstadisticasMun(glo.jsonMun, filterOferta, idMun, ['DPTOMUN', 'MPIO_CCNCT']);
        glo.Arraycentroid = calCentroid(aggregados);
        generateBubble();
    } else if ($("#selecEscala").val() == "Departamento") {
        var idMunDpt = getIDMunDpt(filterOferta);
        var idDpto = idMunDpt[0];
        glo.lyrBaseMunDpto = L.geoJson(glo.jsonDto, {
            style: stylePoly
        }).addTo(map);
        //console.log(filterOferta);
        aggregados = calEstadisticasMun(glo.jsonDto, filterOferta, idDpto, ['ID_DEPARTAMENTO', 'CODIGO_DEP']);
        glo.Arraycentroid = calCentroid(aggregados);
        generateBubble();
    }
    setParametroGrafica(aggregados);
    
    if (map.hasLayer(glo.lyrOferta)) {
        map.removeLayer(glo.lyrOferta);
    }
    
    glo.lyrOferta = L.geoJson(aggregados, {
        onEachFeature: onEachOferta,
        style: styleDptoOfer
    });

    glo.lyrOferta.addTo(map).bringToBack();

    if (map.hasLayer(glo.lyrBaseMunDpto)) {
        glo.lyrBaseMunDpto.bringToBack();
    }
}
