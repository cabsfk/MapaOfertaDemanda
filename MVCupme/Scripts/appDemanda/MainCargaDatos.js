


function selctAnio(i) {
    $(".time").removeClass('btn-default');
    $(".time").addClass('btn-primary');
    $("#time" + i).removeClass('btn-primary');
    $("#time" + i).addClass('btn-default');
    $("#time" + i).text();
    glo.DEMANDA_ANIO = i;
    getParametroFilter();
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
    waitingDialog.hide();
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


function dataanio(geojson) {
    var features = [],tmp;
    var arrayAnio = [];
    
    for (i = 0; i < geojson.features.length; i++) {
        arrayAnio.push(geojson.features[i].properties.ANIO_REGISTRO);
        geojson.features[i].properties.Nombre = getMunDto(geojson.features[i].properties.DEMANDANTE_DEPARTAMENTO, geojson.features[i].properties.DEMANDANTE_MUNICIPIO)
        geojson.features[i].properties.DPTOMUN = geojson.features[i].properties.DEMANDANTE_DEPARTAMENTO + geojson.features[i].properties.DEMANDANTE_MUNICIPIO
        features.push(geojson.features[i]);
    }
    glo.Anio = arrayAnio.unique();
    console.log(glo.Anio);
    Arraycentroid = turf.featurecollection(features);
    addAnios();
    return Arraycentroid;
}

function CargaOfertaDemanda() {

    console.log('Ingresa a la carga');
    clearBusqueda();
    var Estudio = $("#selecEstudio").val();
        var queryDemanda = L.esri.Tasks.query({
            url: config.dominio + config.urlHostDataMA + 'MapServer/' + config.ep_demandas
        });
        queryDemanda.where("1='1' and FK_ID_ESTUDIO=" + Estudio).returnGeometry(false).run(function (error, fCDemanda) {
            waitingDialog.hide();
            $('#infoOferta').empty();
            if (fCDemanda.features.length > 0) {
                var i = 0, estudio = [];
                var arrayMi = [];
                $.each(fCDemanda.features, function (index, value) {
                    estudio.push(value.properties.FK_ID_ESTUDIO);
                    arrayMi.push(value.properties.MINERAL);
                    i++;
                });
                glo.Materiales = arrayMi.unique();
                if (glo.Materiales.length > 0) {
                    getUniMate(glo.Materiales[0]);
                }
                

                
                $('#selecMineral').empty();
                $("#selecMineral").append('<option value="' + parseInt(glo.Materiales[0]) + '" selected>' + glo.textMineral[glo.Materiales[0]] + '</option>');
                $('#tituloMineral').empty().append(glo.textMineral[glo.Materiales[0]]);
                $('#tituloEstudio').empty().append(glo.listEstudio[Estudio]);
                glo.Anio = glo.listEstudioAnio[Estudio];
                for (i = 1; i < glo.Materiales.length; i++) {
                    $("#selecMineral").append('<option value="' + parseInt(glo.Materiales[i]) + '" >' + glo.textMineral[glo.Materiales[i]] + '</option>');
                }
                waitingDialog.hide();
                glo.ArrayDemanda = fCDemanda;
                glo.ArrayDemanda = dataanio(glo.ArrayDemanda);
                var filterDemanda = turf.filter(glo.ArrayDemanda, 'MINERAL', glo.Materiales[0]);
                glo.DEMANDA_ANIO = 0;
                addDemanda(filterDemanda);
                VerLegend();
                $('#LegendDemanda').hide();
                waitingDialog.hide();
            } 
           
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
        var queryDemandaDist= L.esri.Tasks.query({
            url: config.dominio + config.urlHostDataMA + 'MapServer/' + config.ep_demandas
        }).fields(['FK_ID_ESTUDIO']).where("1=1").returnGeometry(false).orderBy('FK_ID_ESTUDIO');
        queryDemandaDist.params.returnDistinctValues = true;
        queryDemandaDist.run(function (error, jsonEstudios) {

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

  

    $('#limpiarBusquedaEstudios').click(function () {
        $('#searchEstudio').focus().val('');

        var e = jQuery.Event("change");
        $('#searchEstudio').trigger(e);

    });



getDeptoSimp();
