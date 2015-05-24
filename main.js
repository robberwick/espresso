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
            value: 1.5
        },
        rudder: {
            value: 1.5
        }
    };
    this.outputPins = {
        left: C8,
        right: C9
    };
};
RCChannelMixer.prototype.update = function(channel, value) {
    this.inputs[channel].value = value;
};
RCChannelMixer.prototype.getOutput = function() {
    // Math.min(Math.max(parseInt(number), 1), 20);
    // RightESC.write(constrain((this.inputs.throttle.value+this.inputs.rudder.value)/2,1000,2000));
    // LeftESC.write(constrain((-this.inputs.throttle.value+this.inputs.rudder.value)/2+1500,1000,2000));
    var left = Math.min(Math.max(parseFloat((this.inputs.throttle.value+this.inputs.rudder.value)/2, 10), 1), 2);
    var right = Math.min(Math.max(parseFloat((-this.inputs.throttle.value+this.inputs.rudder.value)/2+1.5, 10), 1), 2);
    // console.log(this.inputs.throttle.value, this.inputs.rudder.value);
    return [
        [this.outputPins.left, left],
        [this.outputPins.right, right],
    ];

};
var mixer = new RCChannelMixer();

var receiver = new RCReceiver([
    {
        pin: A0,
        callback: function(time){
            mixer.update('throttle', time);
        }
    },
    {
        pin: C6,
        callback: function(time){
            mixer.update('rudder', time);
        }
    },
    ]);

// Set Interval and send calculate mixer value to specified pin
var interval = setInterval(function () {
  mixer.getOutput().map(function(item){
      digitalPulse(item[0], 1, item[1]);
  });
}, 20);
