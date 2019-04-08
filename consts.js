const DevicesKey = "devices";
const CurrentDeviceKey = "currentDevice";
const IsLocalServer = true;

const DeviceType = {
    None: 0,
    Table60: 1,
    Table91: 2,
    Cloud: 3,
    FirTree: 4,
}

const ModeType = {
    None: 0,
    Color: 1,
    Gradient: 2,
    Animation: 3,
    Interactivity: 4
}

const DirectionType = {
    None: 0,
    Previous: 1,
    Next: 2,
    Play: 3,
    Stop: 4,
    Brightness: 5,
    SpeedAnimations: 6
}

deviceAPHost = "192.168.4.3";
deviceUrl = "";

var mqtt;
mqttReconnectTimeout = 2000;
var deviceType;
isReceivedIp = false;
count = 0;

mqttHost = 'm12.cloudmqtt.com';
mqttPort = 30989;
mqttTopic = "";//'test/ledd';		// bf09cfb9ccc449b2a4ced008517364b1

mqttUseTLS = true;
mqttUserName = "sirglnjd";
mqttPassword = "aOT8BRDcRi-Q";
mqttCleanSession = true;
mqttPath = "/mqtt";

var webSocket;
isWebSocketConnected = false;