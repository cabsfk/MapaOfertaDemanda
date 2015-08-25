
$('#dateOperacion,#EditdateOperacion,#ActdateOperacion').popover({
    html: true,
    content: '<div class="panel panel-default"> <div class="panel-body"><p><small>' +
                'Si el <strong>Estado</strong> es <strong>Futuro</strong> solo permitira seleccionar una fecha de entrada en operacion mayor a la actual' +
                ', Si no lo es solo permitira seleccionar una fecha inferior a la actual' +
            '</p></small></div></div>'
});
$('#SectNivelTesion,#EditSectNivelTesion,#ActSectNivelTesion').popover({
    html: true,
    content: '<div class="panel panel-default"> <div class="panel-body"><p><small>' +
                "<strong>Nivel 4:</strong>Tensión nominal mayor o igual a 57,5 kV y menor a 220 kV." +
                "<br><strong>Nivel 3:</strong>Tensión nominal mayor o igual a 30 kV y menor de 57,5 kV." +
                "<br><strong>Nivel 2:</strong>Tensión nominal mayor o igual a 1 kV y menor de 30 kV." +
                "<br><strong>Nivel 1:</strong>Tensión nominal menor a 1 kV." +
                "<br><strong>Nivel 0:</strong>Subestacion de Trasmision Nacional." +
            '</small></p></div></div>'
});

$('#InpPorcentajeCarga,#EditInpPorcentajeCarga,#ActInpPorcentajeCarga').popover({
    html: true,
    content: '<div class="panel panel-default"> <div class="panel-body"><p><small>' +
                "Ingrese la cargabilidad en formato porcentaje."+
            '</small></p></div></div>'
});