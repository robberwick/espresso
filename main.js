var _ = {
    extend: function ( defaults, options ) {
        var extended = {};
        var prop;
        for (prop in defaults) {
            if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
                extended[prop] = defaults[prop];
            }
        }
        for (prop in options) {
            if (Object.prototype.hasOwnProperty.call(options, prop)) {
                extended[prop] = options[prop];
            }
        }
        return extended;
    }
};

function RCReceiver(channels) {
    this.channels = channels.map(function(item, index){
        return new RCChannel(item);
    });
}

function RCChannel(options){
    this.pin = options.pin;
    this.callback = options.callback || null;
    this.watchOptions = _.extend(
        {
            repeat: true,
            edge: 'falling',
            debounce:0
        }, options.watchOptions || {}
    );
    this.watch = setWatch(this.watchHandler.bind(this), this.pin, this.watchOptions);
    this.lastSeen = 0;
}

RCChannel.prototype.watchHandler = function(e) {
    this.lastSeen = e.time;
    if (this.callback){
        this.callback.call(this, (e.time - e.lastTime)*1000);
    }
};


RCChannelMixer = function() {
    this.inputs = {
        throttle: {
            value: 0
        },
        rudder: {
            value: 0
        }
    };
    this.pin = A1;
};
RCChannelMixer.prototype.update = function(channel, value) {
    this.inputs[channel].value = value;
};

var mixer = new RCChannelMixer();

var receiver = new RCReceiver([
    {
        pin: A0,
        callback: function(time){
            console.log("Pin A0", time.toFixed(2));
            mixer.update('throttle', time);
        }
    },
    {
        pin: C6,
        callback: function(time){
            console.log("Pin C0:", time);
            mixer.update('rudder', time);
        }
    },
    ]);

// Set Interval and send calculate mixer value to specified pin
var interval = setInterval(function () {
  digitalPulse(mixer.pin, 1, mixer.inputs.throttle.value);
}, 20);
