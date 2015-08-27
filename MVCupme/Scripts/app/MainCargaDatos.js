


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
    controlcapas();
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

function calCentroid(geojson) {
    var features = [],tmp;
    var arrayAnio = [];
    
    for (i = 0; i < geojson.features.length; i++) {
        tmp = turf.centroid(geojson.features[i]);
        tmp.properties = JSON.parse(JSON.stringify(geojson.features[i].properties));
        arrayAnio.push(geojson.features[i].properties.ANIO_REGISTRO);
        
        tmp.properties.Nombre = getMunDto(geojson.features[i].properties.DEMANDANTE_DEPARTAMENTO, geojson.features[i].properties.DEMANDANTE_MUNICIPIO)
        features.push(tmp);
    }
    glo.Anio = arrayAnio.unique();
   
   
    
    Arraycentroid = turf.featurecollection(features);
    addAnios();
    return Arraycentroid;
}




function VerLegend() {
    glo.addlegend = true;
    legend.addTo(map);
    $("#valuemin").empty().append('1 ' + glo.UniMate);
    $("#valuemax").empty().append(numeral(glo.maxDataCircle).format('0,0') + ' ' + glo.UniMate);
    $("#UniOferta").empty().append('[' + glo.UniMate + ']');
    if (glo.Anio != 0) {
        $('#LegendDemanda').show();
    } else {
        $('#LegendDemanda').hide();
    }
}

function controlcapas() {
    if (glo.lyrControl != '') {
        map.removeControl(glo.lyrControl);
    }
    var overlayMaps;
    if (glo.Anio != 0) {
        overlayMaps = {
            "Demanda": glo.lyrMate,
            "Oferta": glo.lyrOferta
        };
    } else {
        overlayMaps = {
            "Oferta": glo.lyrOferta
        };
    }

    glo.lyrControl = L.control.layers({}, overlayMaps);
    map.addControl(glo.lyrControl);
}


function CargaOfertaDemanda() {
    waitingDialog.show();
    
    
    var queryDemanda = L.esri.Tasks.query({
        url: config.dominio + config.urlHostDataMA + 'MapServer/' + config.ep_demandas
    });

    var Estudio=$("#selecEstudio").val();

    queryDemanda.where("1=1 and FK_ID_ESTUDIO=" + Estudio).returnGeometry(true).run(function (error, fCDemanda) {
        //console.log(fCDemanda);
        glo.Arraycentroid = calCentroid(fCDemanda);
        var i = 0;
        //console.log('Ingreso Demanda');


        var queryOferta = L.esri.Tasks.query({
            url: config.dominio + config.urlHostDataMA + 'MapServer/' + config.EP_OFERTA
        });
        queryOferta.where("1='1' and FK_ID_ESTUDIO=" + Estudio).returnGeometry(true).run(function (error, fCOferta) {
            //console.log(fCOferta);
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
            

            glo.Materiales = arrayMi.unique();
            //console.log(glo.Materiales);
            var tmpUniMate = glo.textMineral[glo.Materiales[0]].split('[');
            tmpUniMate = tmpUniMate[1].split(']');
            glo.UniMate = tmpUniMate[0];
            //console.log("Unidad mate " + glo.UniMate);
            $("#selecMineral").empty();
            $("#selecMineral").append('<option value="' + glo.Materiales[0] + '" selected>' + glo.textMineral[glo.Materiales[0]] + '</option>');

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
                var filterDemanda = turf.filter(glo.Arraycentroid, 'MINERAL', $("#selecMineral").val());
                //console.log(filterDemanda);
                addCentroid(filterDemanda);
                var filterOferta = turf.filter(glo.ArrayOfertas, 'FK_ID_MINERAL', parseInt(glo.Materiales[0]));
                addOferta(filterOferta);
                VerLegend();

                waitingDialog.hide();
            });
        });
    });
}


function getDeptoSimp() {
    
    var queryDeptSimpli = L.esri.Tasks.query({
        url: config.dominio + config.urlHostDataMA + 'MapServer/' + config.DPTO_GEN
    });

    queryDeptSimpli.fields(['CODIGO_DEP', 'NOMBRE'])
           .orderBy(['CODIGO_DEP']);
    queryDeptSimpli.where("1=1").run(function (error, geojson) {
        glo.jsonDto = geojson;
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
            CargaOfertaDemanda();
            

        });
     });
}



getDeptoSimp();

$("#BuscarMapa").click(function () {
    //console.log("Busco");
    legend.removeFrom(map);
    getFondosData();
});