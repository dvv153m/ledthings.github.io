function device_click(tableCell) {

    //отправляем тестовый запрос и если получаем ответ, то переходим на соответствующую страницу			
    //tableCell.title - хранится json представление device
    var deviceObject = JSON.parse(tableCell.title);
    localStorage.setItem(CurrentDeviceKey, tableCell.title);
    deviceUrl = deviceObject.localIp;
    goToDevice(deviceObject.deviceType);
    initWebSocket();
}

function goToDevice(deviceObjectType) {

    hideDiv("indexDiv");
    hideDiv("loginDiv");

    switch (deviceObjectType) {
        case DeviceType.Table60:
            showDiv("table60Div");
        case DeviceType.Table91:
            showDiv("table91Div");
        case DeviceType.Cloud:
            showDiv("cloudDiv");
        case DeviceType.FirTree:
            showDiv("firTreeDiv");
        default:
            hideDiv("indexDiv");
    }
}

function addDevice() {

    hideDiv("indexDiv");
    showDiv("loginDiv");
}

function clearDevices() {

    localStorage.clear();
}

function hideDiv(idDiv) {

    var container = document.getElementById(idDiv);
    container.style.display = 'none';
}

function showDiv(idDiv) {

    var container = document.getElementById(idDiv);
    if(container != null)
        container.style.display = 'block';
}

//login//////////////////////////////////////////////////////////////////////////////////////////////////////

function submit() {

    var ssid = document.getElementById("fssid").value;
    var password = document.getElementById("fpassword").value;
    var ip = document.getElementById("fip").value;

    document.getElementById("busyIndicator").style.display = "block";
    document.getElementById("fssid").disabled = true;
    document.getElementById("fpassword").disabled = true;
    document.getElementById("save").disabled = true;
    document.getElementById("warningInfo").style.display = "none";

    //todo добавить проверку на пустоту ssid и password			
    var deviceTypeUrl = "http://" + ip + "/getDeviceType?";
    var loginUrl = "http://" + deviceAPHost + "/login?ssId=" + ssid + "&password=" + password;
    var restartDeviceUrl = "http://" + deviceAPHost + "/restart";

    if (document.getElementById('wifiID').checked) {
        alert(loginUrl);
        fetchData(loginUrl)
            .then(data => {

                if (typeof data != "undefined") {

                    if (data.isSuccess) {

                        mqttTopic = data.deviceId;
                        deviceType = data.deviceType;
                        fetchData(restartDeviceUrl);
                        mqttConnect();
                    }
                    else {

                        //вывести сообщение с ошибкой
                        document.getElementById("warningInfo").style.display = "block";
                        document.getElementById("warningInfo").innerHTML = data.error;//todo data.error тут скорее всего пустой
                        document.getElementById("busyIndicator").style.display = "none";

                        document.getElementById("fssid").disabled = false;
                        document.getElementById("fpassword").disabled = false;
                        document.getElementById("save").disabled = false;
                    }
                }
                else {
                    document.getElementById("busyIndicator").style.display = "none";
                    document.getElementById("warningInfo").style.display = "block";
                    document.getElementById("warningInfo").innerHTML = "No data from device, please connect to Ledthings access point";
                }
            });
    }
    else {

        fetchData(deviceTypeUrl)
            .then(data => {

                if (typeof data != "undefined") {

                    //todo проверка что поле ip это ip
                    deviceType = data.deviceType;
                    var device = {
                        'localIp': ip,
                        'deviceType': deviceType,
                        'deviceName': getDeviceName(deviceType)
                    }

                    saveDevice(device);
                    goToDevice(device.deviceType);
                    initWebSocket();
                }
                else {

                    document.getElementById("busyIndicator").style.display = "none";
                    document.getElementById("warningInfo").style.display = "block";
                    document.getElementById("warningInfo").innerHTML = "wrong ip address";
                }
            });
    }
}

function mqttConnect() {

    var mqttClientId = "web_" + parseInt(Math.random() * 100, 10);

    mqtt = new Paho.MQTT.Client(
        mqttHost,
        mqttPort,
        mqttPath,
        mqttClientId
    );

    mqtt.onConnectionLost = onConnectionLost;
    mqtt.onMessageArrived = onMessageArrived;

    var options = {
        timeout: 3,
        useSSL: mqttUseTLS,
        userName: mqttUserName,
        password: mqttPassword,
        cleanSession: mqttCleanSession,
        onSuccess: onConnect,
        onFailure: function (message) {

            count++;
            if (count > 4) {

                document.getElementById("busyIndicator").style.display = "none";
                document.getElementById("warningInfo").style.display = "block";
                document.getElementById("warningInfo").innerHTML = "Ssid or password incorrect";

                document.getElementById("fssid").disabled = false;
                document.getElementById("fpassword").disabled = false;
                document.getElementById("save").disabled = false;

            } else {

                //document.getElementById("countId").innerText = count;
                console.log("Connection failed: " + message.errorMessage + "Retsrying");
                setTimeout(mqttConnect, mqttReconnectTimeout);
            }
        }
    };
    mqtt.connect(options);
}

function onConnect() {

    console.log('Connected to ' + mqttHost + ':' + mqttPort + mqttPath);
    // Connection succeeded; subscribe to our topic
    mqtt.subscribe(mqttTopic, { qos: 0 });
}

function onConnectionLost(response) {
    setTimeout(mqttConnect, mqttReconnectTimeout);
    console.log("connection lost: " + responseObject.errorMessage + ". Reconnecting");
};

function onMessageArrived(message) {
    var topic = message.destinationName;
    var payload = message.payloadString;

    if (isIpAddress(payload)) {

        if (!isReceivedIp) {

            isReceivedIp = true;
            deviceAPHost = payload;
            var stopSendMqttUrl = "http://" + deviceAPHost + "/stopSendMqtt";
            fetchData(stopSendMqttUrl).then(data => {

                console.log(stopSendMqttUrl);

                var device = {
                    'localIp': payload,
                    'deviceType': deviceType,
                    'deviceName': getDeviceName(deviceType)
                }

                saveDevice(device);
                goToDevice(device.deviceType);
                initWebSocket();
            });
        }
    }
};

function isIpAddress(ipAddress) {

    var len = ipAddress.length;
    if (len > 0) {

        return true;
    }
    else {

        return false;
    }
}

function saveDevice(device) {

    var jsonDevice = JSON.stringify(device);
    localStorage.setItem(CurrentDeviceKey, jsonDevice);

    var restoredSession = JSON.parse(localStorage.getItem(DevicesKey));
    if (restoredSession != null &&
        restoredSession.devices != null &&
        restoredSession.devices.length > 0) {

        //todo сделать проверку на существование такого устройсва в коллекции
        restoredSession.devices.push(device);
        localStorage.setItem(DevicesKey, JSON.stringify(restoredSession));
    }
    else {

        var devicesInfo = {
            'devices': []
        };

        devicesInfo.devices.push(device);
        localStorage.setItem(DevicesKey, JSON.stringify(devicesInfo));
    }
    deviceUrl = device.localIp;
}

function radioClick(typeR) {

    if (typeR == "wifi") {

        setDisabledDiv('wific', false);
        setDisabledDiv('ipc', true);
    }
    else {

        setDisabledDiv('wific', true);
        setDisabledDiv('ipc', false);
    }
}

function setDisabledDiv(idDiv, disabledValue) {

    document.getElementById(idDiv).disabled = disabledValue;
    var nodes = document.getElementById(idDiv).getElementsByTagName('*');
    for (var i = 0; i < nodes.length; i++) {
        nodes[i].disabled = disabledValue;
    }
}

//cloud/////////////////////////////////////////////////////////////////////////////////////////////////////

function initWebSocket() {

    webSocket = new WebSocket('ws://' + deviceUrl + ':81/');
    webSocket.onopen = function () {

        isWebSocketConnected = true;
        console.log('WebSocket connect', "connect");
        webSocket.send('Connect ' + new Date());
    };
    webSocket.onerror = function (error) {

        isWebSocketConnected = false;
        console.log('WebSocket Error ', error);
    };
    webSocket.onmessage = function (e) {

        console.log('Server: ', e.data);
    };
    webSocket.onclose = function () {

        isWebSocketConnected = false;
        console.log('WebSocket connection closed');
    };

    var colorWheel = iro.ColorPicker("#colorWheelDemo", {
        // options here
    });
    colorWheel.on('color:change', function (color) {
        //grb
        if (isWebSocketConnected) {
            var g = color.rgb.r ** 2 / 255;
            var r = color.rgb.g ** 2 / 255;
            var b = color.rgb.b ** 2 / 255;

            var rgb = r << 20 | g << 10 | b;
            var rgbstr = '#' + rgb.toString(16);
            webSocket.send(rgbstr);
        }
    })
}

function sendCommand(mode, val) {

    var commandUrl = "http://" + deviceUrl + "/ledthings?mode=" + mode + "&val=" + val;
    fetchData(commandUrl);

}

function playStop(mode, nameId) {

    if (document.getElementById(nameId).innerHTML == "Play") {

        document.getElementById(nameId).innerHTML = "Stop";
        sendCommand(mode, DirectionType.Play);
    }
    else {

        document.getElementById(nameId).innerHTML = "Play";
        sendCommand(mode, DirectionType.Stop);
    }
}

function resetCommand() {

    var resetUrl = "http://" + deviceUrl + "/reset";
    fetchData(resetUrl);
}

//common////////////////////////////////////////////////////////////////////////////////////////////////////

function getDeviceName(deviceType) {

    switch (deviceType) {
        case DeviceType.None:
            return "Unknown";
        case DeviceType.Table60:
            return "Table";
        case DeviceType.Table91:
            return "Table";
        case DeviceType.Cloud:
            return "Cloud";
        case DeviceType.FirTree:
            return "FirTree";
        default:
            return "Unknown";
    }
}

function fetchData(url) {

    return fetch(url)
        .then(status)
        .then(json)
        .catch(error => {
            var er = error;
            console.log(er);
        });
}

function status(response) {

    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response)
    } else {
        return Promise.reject(new Error(response.statusText))
    }
}

function json(response) {

    return response.json()
}

