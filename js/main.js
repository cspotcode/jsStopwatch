
// starts clock animating
// target is a jQuery object matching a .clockContainer
// totalTime is total time to countdown in seconds
function startClock(target, totalTime) {
  var t, d;
  t = target;
  
  // if data object already exists, clock is running. Stop it.
  d = target.data('clock');
  if(d instanceof Object) {
    stopClock(target);
  }
  
  // attach new data object to clock element
  d = {};
  target.data('clock', d);
  
  // grab current time to use as offset (time in milliseconds)
  d.timeOffset = new Date() * 1.0;
  d.timeOffset += totalTime * 1000;
  
  // update every second
  d.interval = setInterval(function() {
    var time = new Date() * 1.0;
    t.find('.clockSecondHand').css('transform', 'rotate(' + (time - d.timeOffset) * 360/60/1000 + 'deg)');
  }, 1000);
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
    ['transform', 'OTransform', '-webkit-transform'],
    ['transition', 'OTransition', '-webkit-transition']
  ], function(i, v) {
    var supported = false;
    $.each(v, function(i2, v2) {
      if (tempDiv.style[v2] === '') {
        supported = v2;
        return false;
      }
    });
    
    if(!(supported == v[0])) {
      $.cssHooks[v[0]] = {
        get: function( elem, computed, extra ) {
          return $.css(elem, supported);
        },
        set: function( elem, value ) {
          elem.style[supported] = value;
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