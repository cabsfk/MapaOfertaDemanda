


function selctAnio(i) {
    $(".time").removeClass('btn-default');
    $(".time").addClass('btn-primary');
    $("#time" + i).removeClass('btn-primary');
    $("#time" + i).addClass('btn-default');
    $("#time" + i).text();
    glo.DEMANDA_ANIO = i;
    var filtered = turf.filter(glo.Arraycentroid, 'MINERAL', $("#selecMineral").val());
    addCentroid(filtered);
    resetMapa();
   // controlcapas();
}

function addAnios() {
    $("#anios").empty();
    if (glo.Anio != 0) {
        for (i = 0; i < 10; i++) {
            if (i == 0) {
                $("#anios").append('<button id="time' +
                    i + '" type="button" class="time btn btn-default btn-sm " onClick="selctAnio(' +
                    i + ');">' + (parseInt(glo.Anio) + i) + '</button>');
            } else {
                $("#anios").append('<button id="time' +
                    i + '" type="button" class="time btn btn-primary btn-sm " onClick="selctAnio(' +
                    i + ');">' + (parseInt(glo.Anio) + i) + '</button>');
            }
        }
    }
    
}
function getDtoGeo(Dpto) {

    var filDpto = turf.filter(glo.jsonDto, 'CODIGO_DEP', Dpto);
    if (filDpto.features.length > 0) {
        return filDpto;
    } else {
        return "Revise cod Dept";
    }

}


function getDto(Dpto) {
    
    var filDpto = turf.filter(glo.jsonDto, 'CODIGO_DEP', Dpto);
    if (filDpto.features.length > 0) {
        return filDpto.features[0].properties.NOMBRE;
    } else {
        return "Revise cod Dept";
    }
    
}

function getMunDto(Dpto, Mun) {
    
    var filDpto = turf.filter(glo.jsonDto, 'CODIGO_DEP', Dpto);
    var textMun = Dpto + Mun;
    var filMpio = turf.filter(glo.jsonMun, 'MPIO_CCNCT', textMun);
    return filMpio.features[0].properties.MPIO_CNMBR +', '+ filDpto.features[0].properties.NOMBRE;
}


function getJsonMunFil(idMun) {
    var arraymun = [];
    $.each(idMun, function (index, value) {
        var filterOferta = turf.filter(glo.jsonMun, 'MPIO_CCNCT', value);
        arraymun.push(JSON.parse(JSON.stringify(filterOferta.features[0])));
    });
    var fc = turf.featurecollection(arraymun);
    return fc;
}


function VerLegend() {
    glo.addlegend = true;
    legend.addTo(map);
    $("#UniOferta").empty().append('[' + glo.UniMate + ']');
    if ($('#selecBubles').val() == "") {
        $('#LegendDemanda').hide();
    } else {
        $('#LegendDemanda').show();
    }
}


function getUniMate(idUni) {
    var str = glo.textMineral[idUni];
    var n1 = str.indexOf("[");
    var n2 = str.indexOf("]");
    
    if(n1>0){
        var tmpUniMate = str.split('[');
        if (n1 > 0) {
            tmpUniMate = tmpUniMate[1].split(']');
            glo.UniMate = tmpUniMate[0];
        } else {
            glo.UniMate = tmpUniMate[1];
        }
        
    } else {
        glo.UniMate = '';
    }
    
}
function selctAnioCapacidad(i) {
    $(".time").removeClass('btn-default');
    $(".time").addClass('btn-primary');
    $("#time" + i).removeClass('btn-primary');
    $("#time" + i).addClass('btn-default');
    $("#time" + i).text();

    if (i == 'Oferta') {
        glo.varMapeo='ProAct_sum';
    } else {
        glo.varMapeo = 'capInst_sum';
    }
        
    console.log(glo.varMapeo);
    
    //addCentroid(filteredDemanda);
    getParametroFilter();
    //resetMapa();
    // controlcapas();
}

function addAnioCapacidad() {
    $("#anios").empty();
    
    $("#anios").append(
        '<button id="timeOferta" type="button" class="time btn btn-default btn-sm " onClick="selctAnioCapacidad(\'Oferta\');"> PRODUCCION ' + (parseInt(glo.Anio)) + '</button>'
    );
    $("#anios").append(
        '<button id="timeCapacidad" type="button" class="time btn btn-primary btn-sm " onClick="selctAnioCapacidad(\'Capacidad\');">OFERTA INSTALADA ' + (parseInt(glo.Anio)) + '</button>'
    );     

}
function CargaOfertaDemanda() {
    waitingDialog.show();
    
    var Estudio = $("#selecEstudio").val();
        var queryOferta = L.esri.Tasks.query({
            url: config.dominio + config.urlHostDataMA + 'MapServer/' + config.EP_OFERTA
        });
        queryOferta.where("1='1' and FK_ID_ESTUDIO=" + Estudio).returnGeometry(true).run(function (error, fCOferta) {
            
            $('#infoOferta').empty();
            if (fCOferta.features.length > 0) {
                var i = 0, estudio = [];
                var arrayMi = [];
                $.each(fCOferta.features, function (index, value) {
                    estudio.push(value.properties.FK_ID_ESTUDIO);
                    if (value.properties.LONGITUD < -60) {
                        fCOferta.features[i].geometry = {
                            "type": "Point",
                            "coordinates": [value.properties.LONGITUD, value.properties.LATITUD]
                        }
                    } else {
                        fCOferta.features[i].geometry = {
                            "type": "Point",
                            "coordinates": [value.properties.LATITUD, value.properties.LONGITUD]
                        }
                    }
                    arrayMi.push(value.properties.FK_ID_MINERAL);

                    i++;
                });
               
                fCOferta = turf.tag(fCOferta, glo.jsonMun, 'MPIO_CCNCT', 'DPTOMUN');
               
                glo.Materiales = arrayMi.unique();
                if (glo.Materiales.length > 0) {
                    getUniMate(glo.Materiales[0]);
                }
                

                
                $('#selecMineral').empty();
                $("#selecMineral").append('<option value="' + glo.Materiales[0] + '" selected>' + glo.textMineral[glo.Materiales[0]] + '</option>');
                $('#tituloMineral').empty().append(glo.textMineral[glo.Materiales[0]]);
                $('#tituloEstudio').empty().append(glo.listEstudio[Estudio]);
                glo.Anio = glo.listEstudioAnio[Estudio];
                for (i = 1; i < glo.Materiales.length; i++) {
                    $("#selecMineral").append('<option value="' + glo.Materiales[i] + '" >' + glo.textMineral[glo.Materiales[i]] + '</option>');
                }
                //console.log('Materiales' );
                //console.log(glo.Materiales[0]);
                glo.ArrayOfertas = fCOferta;
                var queryOfertaMun = L.esri.Tasks.query({
                    url: config.dominio + config.urlHostDataMA + 'MapServer/' + config.EP_OFERTA_MUN
                });
                queryOfertaMun.where("1='1' and FK_ID_ESTUDIO=" + Estudio).returnGeometry(false).run(function (error, fCOfertaMun) {
                    glo.ArrayOfertasMun = fCOfertaMun;
                    addAnioCapacidad();
                    var filterOferta = turf.filter(glo.ArrayOfertas, 'FK_ID_MINERAL', parseInt(glo.Materiales[0]));
                    addOferta(filterOferta);
                    VerLegend();
                    $('#LegendDemanda').hide();
                    waitingDialog.hide();
                });
                getLayerUPM(Estudio, glo.Materiales[0]);
            } else {
                $('#infoOferta').empty().append('No hay datos de OFERTA');
                waitingDialog.hide();
            }
           
        });
    
}
function getLayerUPM(Estudio,material){
    var queryUPM = L.esri.Tasks.query({
        url: config.dominio + config.urlHostDataMA + 'MapServer/' + config.EP_OFERTA
    });
    //
    queryUPM.where("1='1' and FK_ID_ESTUDIO=" + Estudio + ' and FK_ID_MINERAL=' + material).run(function (error, geojson) {
        var lyrUPM = L.geoJson(geojson, {
            pointToLayer: function (feature, latlng) {
                var upm;
                upm = L.marker(latlng, glo.IconUPM).bindLabel(feature.properties.NOMBRE_UPM, { noHide: false, offset: [20, -45] });
                htmlpopup =
                 '<div class="panel panel-primary">' +
                     '<div class="panel-heading">Unidad de Producción Minera</div>' +
                         '<div class="popupstyle">' +
                             '<button class="btn btn-primary pull-right btn-xs " data-toggle="tooltip" data-placement="left" title="Acercar" type="button" type="button" onclick="zoomCP(\'' + latlng.lng + '\',\'' + latlng.lat + '\')">' +
                                 '<span class="glyphicon glyphicon-zoom-in" aria-hidden="true"></span>' +
                             '</button>' +
                             '<h5><strong  class="primary-font">' + feature.properties.NOMBRE_UPM + '</strong><br>' +
                             //+ feature.properties.MPIO_CNMBR + ', ' + feature.properties.DPTO_CNMBR + '.<hr>' +
                             
                             '<small>Mineral:</small> ' + glo.textMineral[feature.properties.FK_ID_MINERAL] + '<br>' +
                             '<small>Estudio:</small> ' + glo.listEstudio[feature.properties.FK_ID_ESTUDIO] + '<br>' +
                             '<small>Peajes:</small> ' +numeral(feature.properties.NUMERO_PEAJES).format('0,0') + '<br>' +
                             '<small>NUmero de Vehiculos:</small> ' + numeral(feature.properties.NUMERO_VEHICULOS).format('0,0') + ' <br>' +
                             '<small>Numero Empleados:</small> ' + numeral(feature.properties.NUMERO_EMPLEADOS).format('0,0') + ' <br>' +
                             '<small>Empleados Hombres :</small> ' + numeral(feature.properties.NUMERO_EMPLEADOS_HOMBRES).format('0,0') + '<br>' +
                             '<small>Empleados Mujeres:</small> ' + numeral(feature.properties.NUMERO_EMPLEADOS_MUJERES).format('0,0') + ' <br>' +
                             '<small>Costo de Produccion [$/'+glo.UniMate+']: </small> ' + numeral(feature.properties.COSTO_PRODUCCION).format('0,0') + ' <br>' +
                             '<small>Area Intervenida:</small> ' + numeral(feature.properties.AREA_INTERVENIDA).format('0,0') + '<br>' +
                             '<small>Consumo de Agua:</small> ' + numeral(feature.properties.CONSUMO_AGUA ).format('0,0') + '<br>' +
                             '<small>Consumo de Energia:</small> ' + numeral(feature.properties.CONSUMO_ENERGIA).format('0,0') + '<br>' +
                             '<small>Produccion Actual [' + glo.UniMate + ']: </small> ' + numeral(feature.properties.PRODUCCION_ACTUAL).format('0,0') + '<br>' +
                             '<small>Capacidad Instalada:</small> ' + numeral(feature.properties.CAPACIDAD_INSTALADA).format('0,0') + '<br>' +
                             '<small>Precio de Venta [$/' + glo.UniMate + ']: </small>' + numeral(feature.properties.PRECIO_VENTA).format('0,0') + '<br>' +
                             '<small>Titulo Minero:</small> ' + numeral(feature.properties.TITULO_MINERIO).format('0,0') + '<br>' +
                             '<small>Restriccion Ambiental:</small> ' + numeral(feature.properties.RESTRICCION_AMBIENTAL).format('0,0') + '<br>' +
                             '<small>Restriccion Social:</small> ' + numeral(feature.properties.RESTRICCION_SOCIAL).format('0,0') + '<br>' +
                         '</div>' +
                     '</div>' +
                 '</div>';
                upm.bindPopup(htmlpopup);
                return upm;
            }
        });
        glo.markersUPM.clearLayers();
        glo.markersUPM.addLayer(lyrUPM);
    });
}


function getDeptoSimp() {
    var queryMunSimpli = L.esri.Tasks.query({
        url: config.dominio + config.urlHostDataMA + 'MapServer/' + config.MPIO_GEN
    });

    queryMunSimpli
      .returnGeometry(true)
      .fields(['DPTO_CCDGO', 'MPIO_CCDGO', 'MPIO_CCNCT', 'MPIO_CNMBR'])
      .orderBy(['MPIO_CCNCT']);
    queryMunSimpli.where("1=1").run(function (error, geojson) {
        glo.jsonMun = geojson;
        waitingDialog.hide();
        var queryOfertaDist= L.esri.Tasks.query({
            url: config.dominio + config.urlHostDataMA + 'MapServer/' + config.EP_OFERTA
        }).fields(['FK_ID_ESTUDIO']).where("1=1").returnGeometry(false).orderBy('FK_ID_ESTUDIO');
        queryOfertaDist.params.returnDistinctValues = true;
        queryOfertaDist.run(function (error, jsonEstudios) {
            
            $.each(jsonEstudios.features, function (index, value) {
                //console.log(glo.arrayHtmlEst[value.properties.FK_ID_ESTUDIO]);
                $("#ListaEstudios .chat").prepend(glo.arrayHtmlEst[value.properties.FK_ID_ESTUDIO]);
            });            
            
            $('#ListaEstudios').searchable({
                searchField: '#searchEstudio',
                selector: 'li',
                childSelector: '.clearfix',
                show: function (elem) {
                    elem.slideDown(100);
                },
                hide: function (elem) {
                    elem.slideUp(100);
                }
            });
            
            styleEstudio(glo.idEstudioIni);           
            CargaOfertaDemanda();
            
        });
    });
    var queryDeptSimpli = L.esri.Tasks.query({
        url: config.dominio + config.urlHostDataMA + 'MapServer/' + config.DPTO_GEN
    });

    queryDeptSimpli.fields(['CODIGO_DEP', 'NOMBRE'])
           .orderBy(['CODIGO_DEP']);
    queryDeptSimpli.where("1=1").run(function (error, geojson) {
        glo.jsonDto = geojson;

    });
    
}
    
$("#IdUPM").on("click", function () {
    if ($("#IdUPM").is(':checked')) {
        map.addLayer(glo.markersUPM);
    } else {
        map.removeLayer(glo.markersUPM);
    }
});
$('#limpiarBusquedaEstudios').click(function () {
    $('#searchEstudio').focus().val('');
    
    var e = jQuery.Event("change");
    $('#searchEstudio').trigger(e);
    
});
  



getDeptoSimp();
