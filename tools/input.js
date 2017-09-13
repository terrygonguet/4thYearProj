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
      right   : ["d"]
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

  /*
   * @param e { eventdata } Native event data
   */
  getEvent (e) {
    const custEvent = new createjs.Event(""); // custom event to be fired if necessary

    switch (e.type) {
      case "mousedown":
        if (!this.enabledListeners[e.type]) {
          this.keys.mouse1 = this.keys.mouse2 = false;
          break;
        }
        switch (e.button) {
          case 0:
            this.keys.mouse1 = true;
            break;
          case 2:
            this.keys.mouse2 = true;
            break;
        }
        break;
      case "mouseup":
        switch (e.button) {
          case 0:
            this.keys.mouse1 = false;
            break;
          case 2:
            this.keys.mouse2 = false;
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
        if (document.pointerLockElement) {
          // custom mouse move if the pointer is locked
          custEvent.type = "lockedmousemove";
          this.mouseDelta = $V([e.movementX, e.movementY]); // update
        } else
          this.mouseDelta = $V([0,0]);
        break;
    }
    custEvent.type && this.dispatchEvent(custEvent); // dispatch additionnal event if we found one
    this.dispatchEvent(e);
  }

}

const input = new InputManager();
