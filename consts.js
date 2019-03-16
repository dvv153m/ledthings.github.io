const DevicesKey = "devices";
const CurrentDeviceKey = "currentDevice";
const IsDebug = true;

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

mqttHost = 'm12.cloudmqtt.com';
mqttPort = 30989;
mqttTopic = "";//'test/ledd';		// bf09cfb9ccc449b2a4ced008517364b1

mqttUseTLS = true;
mqttUserName = "sirglnjd";
mqttPassword = "aOT8BRDcRi-Q";
mqttCleanSession = true;
mqttPath = "/mqtt";

function getPageByDeviceType(deviceType) {

    switch (deviceType) {
        case DeviceType.Table60:
            return "table.html";
        case DeviceType.Table91:
            return "table.html";
        case DeviceType.Cloud:
            return "cloud.html";
        case DeviceType.FirTree:
            return "firtree.html";
        default:
            return "error.html";
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