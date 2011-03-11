
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
     ['-moz-transform', 'MozTransform'],
     ['-ms-transform', 'msTransform']],
    [['transition', 'transition'],
     ['-o-transition', 'OTransition'],
     ['-webkit-transition', 'webkitTransition'],
     ['-moz-transition', 'MozTransition'],
     ['-ms-transition', 'msTransition']],
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

// make body resize itself to window height
(function() {
  var resizerFn = function() {
    // resize the body to window height
    $('body').height($(window).height());
    
    // re-scale all .clockFixedSizeContainer to fill their containing .clockContainer
    $('.clockContainer').each(function(i) {
      $(this).find('.clockFixedSizeContainer').css('transform', 'scale(' + $(this).width() / 100 + ', ' + $(this).height() / 100 + ')');
    });
  };
  $(window).resize(resizerFn);
  $(document).ready(resizerFn);
})();
