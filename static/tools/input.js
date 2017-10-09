class InputManager extends createjs.EventDispatcher {

  constructor () {
    super();

    // keeps track of wich key is pressed and bindings
    // input.keys["keyid"] = true/false;
    // input.keys["bindingname"] = true/false;
    this.keys = {
      mouse1  : false, // can't change those
      mouse2  : false, // mouse buttons
      up      : false,
      down    : false,
      left    : false,
      right   : false
    };
    this.mousePos   = $V([0,0]); // position of the last mouse click or last mousemove event
    this.direction  = $V([0,0]); // normalized direction using the up, down, left and right properties of this.keys
    this.mouseDelta = $V([0,0]); // mouse delta when pointer is locked to the window
    this._listener = e => this.getEvent(e); // to store the listener for removal

    // set to false to prevent events to be fired on this object
    this.enabledListeners = {
      keydown   : true,
      keyup     : true,
      mousedown : true,
      mouseup   : true,
      focus     : true,
      blur      : true,
      mousemove : true
    };

    // changeable bindings
    // this.bindings["bindingname"] = ["keyid1", "keyid2", ...]
    this.bindings = {
      up      : ["z"],
      down    : ["s"],
      left    : ["q"],
      right   : ["d"],
      pause   : ["p"],
      debug   : ["o"],
      config  : ["Escape"]
    };

    // native events listeners
    window.addEventListener("keydown", this._listener, true);
    window.addEventListener("keyup", this._listener, true);
    window.addEventListener("mousedown", this._listener, true);
    window.addEventListener("mouseup", this._listener, true);
    window.addEventListener("focus", this._listener, false);
    window.addEventListener("blur", this._listener, false);
    $("#game").on("contextmenu", null, null, false); // to prevent right click menu
    // document.addEventListener("pointerlockchange",  () => {});
    createjs.Ticker.on("tick", e => !e.paused && this.update(e), this);
  }

  /**
   * @param {eventdata} e
   */
  update (e) {
    if (!this.noDirection) {
      // to reduce unnecessaury calculations if the keys arent used
      if (this.noDirection === undefined) {
        if  (this.keys.up === undefined ||this.keys.down === undefined || this.keys.left === undefined || this.keys.right === undefined)
        this.noDirection = true;
        else this.noDirection = false;
      }
      this.direction = $V([
        Number(this.keys.right - this.keys.left),
        Number(this.keys.down - this.keys.up)
      ]);
    }
  }

  /*
   * Enables the object to catch mousemove events
   * @param state { Boolean } true to enable (default) false to disable
   */
  enableMouseMouve (state = true) {
    if (state)
      window.addEventListener("mousemove", this._listener, true);
    else
      window.removeEventListener("mousemove", this._listener, true);
  }

  /**
   * @param {eventdata} e Native event data
   */
  getEvent (e) {
    e.preventDefault();
    const custEvent = new createjs.Event(""); // custom event to be fired if necessary

    switch (e.type) {
      case "mousedown":
        if (!this.enabledListeners[e.type]) {
          this.keys.mouse1 = this.keys.mouse2 = false;
          break;
        }
        this.mousePos = $V([ e.clientX, e.clientY ]);
        switch (e.button) {
          case 0:
            this.keys.mouse1 = true;
            custEvent.type = "mouse1";
            break;
          case 2:
            this.keys.mouse2 = true;
            custEvent.type = "mouse2";
            break;
        }
        break;
      case "mouseup":
        switch (e.button) {
          case 0:
            this.keys.mouse1 = false;
            custEvent.type = "mouse1U";
            break;
          case 2:
            this.keys.mouse2 = false;
            custEvent.type = "mouse2U";
            break;
        }
        break;
      case "keydown": {
        if (!this.enabledListeners[e.type]) {
          Object.keys(this.keys).forEach(k => {
            k !== "mouse1" && k !== "mouse2" && (this.keys[k] = false);
          });
          break;
        }
        this.keys[e.key] = true;
        let type = Object.keys(this.bindings).find(key => {
          if (this.bindings[key].indexOf(e.key) != -1) {
            this.keys[key] = true;
            return true;
          }
        });
        custEvent.type = (type ? type : ""); // custom binding event if we found a keybind
        } break;
      case "keyup": {
        this.keys[e.key] = false;
        let type = Object.keys(this.bindings).find(key => {
          if (this.bindings[key].indexOf(e.key) != -1) {
            this.keys[key] = false;
            return true;
          }
        });
        custEvent.type = (type ? type + "U" : "");  // custom binding event if we found a keybind
        } break;
      case "focus" : break;
      case "blur" :
        if (!this.enabledListeners[e.type]) break;
        document.exitPointerLock();
        break;
      case "mousemove" :
        if (!this.enabledListeners[e.type]) break;
        this.mousePos = $V([ e.clientX, e.clientY ]);
        if (document.pointerLockElement) {
          // custom mouse move if the pointer is locked
          custEvent.type = "lockedmousemove";
          this.mouseDelta = $V([e.movementX, e.movementY]); // update
        } else
          this.mouseDelta = $V([0,0]);
        break;
    }
    this.dispatchEvent(e);
    // dispatch additionnal event if we found one and the native event didnt get stopped
    custEvent.type && !e.cancelBubble && this.dispatchEvent(custEvent);
  }

}

const input = new InputManager();
