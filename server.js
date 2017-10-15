var env = require('dotenv').config();
var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var moment = require("moment-timezone");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var mqtt = require('mqtt');
var dashboardData = {};
var devices = ["FIT01", "FIT02", "FIT03", "FIT04", "FIT05", "FIT06", "FIT07", "FIT08", "FIT09", "FIT10", "FIT11", "FIT12", "FIT13", "FIT14", "FIT15", "FIT16", "FIT17", "FIT18", "FIT19", "FIT20", "FIT21", "FIT22", "FIT23", "FIT24", "FIT25"]

devices.forEach(function (device) {
    dashboardData[device] = {
        id: device,
        T: "N/A",
        H: "N/A",
        L: "N/A",
        O: "N/A",
        date: "N/A",
        reply: "{OK}"
    }
});

app.use(express.static('public'));

var options = {
    port: process.env.MQTT_PORT,
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASSWORD,
};

// Create a client connection
var client = mqtt.connect(process.env.MQTT_URL, options);

// define the home page route
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/home.html');
});

//404
app.get('*', function (req, res) {
    res.status(404).sendFile(__dirname + '/views/404.html');
});

//Socket.io Service
io.on("connection", function (socket) {
    socket.on("subToDevice", function (data, result) {
        if (data.device) {
            socket.join(data.device);
        } else {
            result({
                error: true,
                message: "Dispositivo no especificado"
            });
        }
    });

    socket.on("setReply", function (data, result) {
        console.log("setReply", data)
        if (data.device && data.reply) {
            dashboardData[data.device].reply = data.reply
            result({
                error: false,
                message: "Respuesta actualizada exitosamente"
            });
        } else {
            result({
                error: true,
                message: "Dispositivo no especificado"
            });
        }
    });

    socket.on("getAllData", function (result) {
        result({
            error: false,
            data: dashboardData
        });
    });

    socket.on("sendCommand", function (data, result) {
        if (data.device && data.command) {
            client.publish(data.device, data.command);
            result({
                error: false,
                message: "comando enviado a '" + data.device + "' exitosamente"
            });
        } else {
            result({
                error: true,
                message: "Dispositivo o comando no especificado"
            });
        }
    });
});

client.on('connect', function () {
    console.log("-Connected to MQTT Broker");
    client.subscribe('#');
});

client.on('message', function (topic, message) {

    io.to("#").emit("newMessage", {
        message: message.toString(),
        topic: topic
    });

    if (topic == "data") {
        var date = moment(new Date()).tz('America/Guatemala').format("DD-MM-YYY HH:mm");
        var newRecord = JSON.parse(message);
        dashboardData[newRecord.id].id = newRecord.id
        dashboardData[newRecord.id].T = newRecord.T;
        dashboardData[newRecord.id].H = newRecord.H;
        dashboardData[newRecord.id].L = newRecord.L;
        dashboardData[newRecord.id].O = newRecord.O;
        dashboardData[newRecord.id].date = date;
        io.emit("record", dashboardData[newRecord.id]);
        client.publish(newRecord.id, dashboardData[newRecord.id].reply);
    }

    console.log({
        message: message.toString(),
        topic: topic
    });
});

http.listen(HTTP_PORT, function () {
    console.log("-Web Server Started :)");
});

process.on("uncaughtException", function (err) {
    console.log("uncaughtException: ", err);
});
