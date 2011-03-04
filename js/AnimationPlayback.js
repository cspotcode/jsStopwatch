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