var socket = io();

$(document).ready(function () {
    $('form').submit(false);
});

socket.emit("getAllData", function (data) {
    for (var index in data.data) {
        $("#" + index).find("#fecha").text(data.data[index].date);
        $("#" + index).find("#temperatura").text(data.data[index].T);
        $("#" + index).find("#humedad").text(data.data[index].H);
        $("#" + index).find("#luminosidad").text(data.data[index].L);
        $("#" + index).find("#otro").text(data.data[index].O);
        $("#" + index).find("#reply").val(data.data[index].reply);
    }
});

socket.on("record", function (data) {
    var index = data.id
    $("#" + index).find("#fecha").text(data.data[index].date);
    $("#" + index).find("#temperatura").text(data.data[index].T);
    $("#" + index).find("#humedad").text(data.data[index].H);
    $("#" + index).find("#luminosidad").text(data.data[index].L);
    $("#" + index).find("#otro").text(data.data[index].O);
    $("#" + index).find("#reply").val(data.data[index].reply);
});

var setDevice;

function changeReply() {
    var reply = $('#reply').val();
    socket.emit("setReply", {
        device: setDevice,
        reply: reply
    }, function (data) {
        $('#change-reply').modal("hide");
    });
};

$('#change-reply').on('shown.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    setDevice = button.data('device');

});

$('#change-reply').on('hidden.bs.modal', function (event) {
    $('#reply').val('');
});
