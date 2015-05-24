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
}

RCChannel.prototype.watchHandler = function(e) {
    if (this.callback){
        this.callback.call(this, (e.time - e.lastTime)*1000);
    }
};

var receiver = new RCReceiver([
    {
        pin: A0,
        callback: function(time){
            console.log("Pin", time);
        }
    },
    {
        pin: BTN1,
        callback: function(time){
            console.log("Button:", time);
        }
    },
    ]);
