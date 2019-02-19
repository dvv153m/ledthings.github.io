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
    Stop: 4    
}

function includeJs(filename)
{
    var head = document.getElementsByTagName('head')[0];

    var script = document.createElement('script');
    script.src = filename;
    script.type = 'text/javascript';

    head.appendChild(script)
}

function initBootstrap(body){

    includeJs("https://code.jquery.com/jquery-3.3.1.slim.min.js", body);
    includeJs("https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js", body);
    includeJs("https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js", body);
}