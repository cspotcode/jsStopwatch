
// starts clock animating
// target is a jQuery object matching a .clockContainer
// totalTime is total time to countdown in seconds
function startClock(target, totalTime) {
  var t, d, intervalFn;
  t = target;
  
  // if data object already exists, clock is running. Stop it.
  d = target.data('clock');
  if(d instanceof Object) {
    stopClock(target);
  }
  
  // attach new data object to clock element
  d = {};
  target.data('clock', d);
  
  d.totalTime = totalTime * 1000;
  
  // grab current time to use as offset (time in milliseconds)
  d.startTime = new Date() * 1.0;
  
  d.backward = false;
  
  // update every second
  intervalFn = function() {
    var time, secondHandPosition, masterHandPosition, timeElapsed, timeRemaining;
    time = new Date() * 1.0;
    timeElapsed = time - d.startTime;
    timeRemaining = d.totalTime - timeElapsed;
    secondHandPosition = ((timeRemaining / 1000) - 1) * 360/60;
    masterHandPosition = (timeRemaining - 1000) * 360/d.totalTime;
    if(d.backward) {
      secondHandPosition = -secondHandPosition;
      masterHandPosition = -masterHandPosition;
    }
    t.find('.clockSecondHand').css('transform', 'rotate(' + secondHandPosition + 'deg)');
    t.find('.clockMasterHand').css('transform', 'rotate(' + masterHandPosition + 'deg)');
  };
  d.interval = setInterval(intervalFn, 1000);
  // also, run immediately!  This makes the clock hand start moving immediately
  intervalFn();
}

// stop a clock's animation
function stopClock(target) {
  var d;
  d = target.data('clock');
  if(!(d instanceof Object)) {
    //should throw exception or something, I'll just do nothing
    return;
  }
  clearInterval(d.interval);
  target.removeData('clock');
}

// setup jQuery cssHooks to set browser-specific transform and transition properties
(function() {
  var tempDiv = document.createElement('div');
  $.each([
    [['transform', 'transform'],
     ['-o-transform', 'OTransform'],
     ['-webkit-transform', 'webkitTransform'],
     ['-moz-transform', 'MozTransform']],
    [['transition', 'transition'],
     ['-o-transition', 'OTransition'],
     ['-webkit-transition', 'webkitTransition'],
     ['-moz-transition', 'MozTransition']],
  ], function(i, v) {
    var supported = false;
    $.each(v, function(i2, v2) {
      if (tempDiv.style[v2[1]] === '') {
        supported = v2[0];
        return false;
      }
    });
    
    if(!(supported == v[0][0])) {
      $.cssHooks[v[0][0]] = {
        get: function( elem, computed, extra ) {
          return $.css(elem, supported);
        },
        set: function( elem, value ) {
          elem.style.setProperty(supported, value, null);
          // TODO lol use setAttribute on IE
        }
      };
    }
  });
  tempDiv = null;
})();

// AnimationPlayback
// some code thrown together that might be useful for fancy animations, like making the second hand's mechanical tick look realistic
function AnimationPlayback(animation, target) {
  this._anim = animation;
  this._target = target;
  this._nextKeyframe;
  
  this.play = function() {
    // method 1: create a timer for each keyframe
    // method 2: create only the first timer, it will create the next, and so on
    
    // doing method 1
    this._currentKeyframe = 0;
    this._playbackTimers = $.map(this._anim, function(e, i) {
      window.setTimeout(this.executeNextKeyframeFn(), e.time);
    });
  };
  
  this.executeNextKeyframeFn = (function() {
    // static-ish variable for executeNextKeyframeFn function
    var fn = undefined;
    
        // executeNextKeyframeFn()
    return function() {
      // TODO is caching the fn necessary, or will any good JS engine do this for me?
      // I'm caching because there will be lots of references to this floating around and I'd rather they not be lots of duplicate functions
                                    // executeNextKeyframe()
      if(fn === undefined) fn = $.bind(function() {
      
        this._currentKeyframe += 1;
        
        // foreach action that must be performed for this keyframe
        $.each(this._anim[this._nextKeyframe].actions, function(i, v) {
          var prop, val, a;
          a = v.indexOf(':');
          if (a > -1) {
            prop = v.slice(0, a);
            val = v.slice(a+1);
            if(prop == '+class') { // add class(es)
              this._target.addClass(val);
            } else if(prop == '-class') { // remove class(es)
              this._target.removeClass(val);
            } else { // modify css
              this._target.css(prop, val);
            }
          } // else perform actions that don't use property:value syntax
        });
        
      }, this); // bind
      return fn;
    };
  })();
}


/* Example animation structure:
anim = [
  { time: 0, actions: ['top:0px', 'left:0px'] },
  { time: 0.25, actions: ['left:100px'] },
  { time: 0.5, actions: ['top:100px'] },
  { time: 0.75, actions: ['left:0px'] },
  { time: 1, actions: ['top:0px'] },
] */