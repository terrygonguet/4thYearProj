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
    // same as this.keys but keeps track of any
    // keypress on the keyboard
    this.keyboard = {

    }
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

    // array of binding names that shouldn't be changed (not supported by this class)
    this.lockedBindings = [ ];

    // array of binding names that shouldn't be shown (not supported by this class)
    this.hiddenBindings = [ ];

    // Keys that won't trigger anny event or use preventDefault
    this.ignoredKeys = [ "F12", "F11", "F5" ];

    // a string representing that last ~300 keys pressed last key in front
    this.lastkeys = "";

    // basically cheat codes
    // will be removed from lastkeys if found
    // /!\ Needs to be specified in reverse as the latest key struct is at the satrt of the string
    this.keypatterns = {
      konami: "abArrowRightArrowLeftArrowRightArrowLeftArrowDownArrowDownArrowUpArrowUp"
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
      ]).toUnitVector();
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
    var custEvents = [];

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
            custEvents.push("mouse1");
            break;
          case 2:
            this.keys.mouse2 = true;
            custEvents.push("mouse2");
            break;
        }
        break;
      case "mouseup":
        switch (e.button) {
          case 0:
            this.keys.mouse1 = false;
            custEvents.push("mouse1U");
            break;
          case 2:
            this.keys.mouse2 = false;
            custEvents.push("mouse2U");
            break;
        }
        break;
      case "keydown":
        if (this.ignoredKeys.indexOf(e.key) !== -1) break;
        e.preventDefault();
        if (!this.enabledListeners[e.type]) {
          Object.keys(this.keys).forEach(k => {
            k !== "mouse1" && k !== "mouse2" && (this.keys[k] = false);
          });
          Object.keys(this.keyboard).forEach(k => this.keyboard[k] = false);
          break;
        }
        e.preventDefault();
        // patterns
        this.lastkeys = (e.key + this.lastkeys).slice(0,500);
        for (var pattern in this.keypatterns) {
          if (this.keypatterns.hasOwnProperty(pattern)) {
            if (this.lastkeys.startsWith(this.keypatterns[pattern])) {
              custEvents.push(pattern);
              this.lastkeys = this.lastkeys.slice(this.keypatterns[pattern].length-1);
            }
          }
        }

        this.keyboard[e.key] = true;
        custEvents = custEvents.concat(Object.keys(this.bindings).filter(key => {
          if (this.bindings[key].indexOf(e.key) != -1) {
            this.keys[key] = true;
            return true;
          }
        }));
        break;
      case "keyup":
        if (this.ignoredKeys.indexOf(e.key) !== -1) break;
        this.keyboard[e.key] = false;
        custEvents = custEvents.concat(Object.keys(this.bindings).filter(key => {
          if (this.bindings[key].indexOf(e.key) != -1) {
            this.keys[key] = false;
            return true;
          }
        }).map(t => t+"U"));
        break;
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
          custEvents.push("lockedmousemove");
          this.mouseDelta = $V([e.movementX, e.movementY]); // update
        } else
          this.mouseDelta = $V([0,0]);
        break;
    }
    this.dispatchEvent(e);
    // dispatch additionnal event if we found one and the native event didnt get stopped
    if (custEvents.length && !e.cancelBubble) {
      custEvents.forEach(ev => this.dispatchEvent(_.assign(new createjs.Event(ev), { originalEvent:e })));
    }
  }

}

const input = new InputManager();
