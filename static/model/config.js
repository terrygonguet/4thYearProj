class Config extends createjs.EventDispatcher {

  constructor () {
    super();

    createjs.Sound.volume = localStorage.getItem("volume") || 0.25;

    this.width  = 0.8 * window.innerHeight;
    this.height = 0.8 * window.innerHeight;
    this.keylistener = null;

    this.container = $("<div></div>")
                     .addClass("configContainer")
                     .css({
                       width: this.width,
                       height: this.height,
                       left: (window.innerWidth - this.width) / 2,
                       top: (window.innerHeight - this.height) / 2
                     })
                     .hide()
                     .appendTo("#gameWrapper");

    this.keylist   = $("<table></table>")
                     .addClass("keylist")
                     .appendTo(this.container);

    input.on("menu", this.toggle, this);

    var localBindings = JSON.parse(localStorage.getItem("bindings")) || {};
    input.bindings = {
      up        : localBindings.up        || ["z"],
      down      : localBindings.down      || ["s"],
      left      : localBindings.left      || ["q"],
      right     : localBindings.right     || ["d"],
      reload    : localBindings.reload    || ["r"],
      pause     : localBindings.pause     || ["p"],
      debug     : localBindings.debug     || ["o"],
      radar     : localBindings.radar     || ["Tab"],
      menu      : localBindings.menu      || ["Escape"],
      ratata    : ["!"]
    };
    input.lockedBindings = [ "menu" ];
    input.hiddenBindings = [ "pause", "debug", "ratata" ];
  }

  /**
   * toggles display on the menu
   */
  toggle () {
    input.enabledListeners.mousedown = !input.enabledListeners.mousedown;
    this.buildKeylist();
    this.container.toggle();
  }

  /**
   * creates the keybindings table
   */
  buildKeylist () {
    $(".keylist tr").detach();
    $("<tr><th>Setting</th><th>Value</th></tr>").appendTo(".keylist");
    for (var binding in input.bindings) {
      if (input.bindings.hasOwnProperty(binding) && input.hiddenBindings.indexOf(binding) === -1) {
        var btn = $("<button binding='" + binding + "'>" + input.bindings[binding][0] + "</button>");
        if (input.lockedBindings.indexOf(binding) === -1) {
          btn.click(e => {
            if (this.keylistener) input.off("keydown", this.keylistener);
            $(e.target).text("_");
            input.bindings[$(e.target).attr("binding")][0] = "";
            this.keylistener = input.on("keydown", f => {
              input.bindings[$(e.target).attr("binding")][0] = f.key;
              $(e.target).text(f.key);
              // f.cancelBubble = true;
              input.off("keydown", this.keylistener);
              this.keylistener = null;
              try {
                localStorage.setItem("bindings", JSON.stringify(input.bindings));
              } catch (e) { console.log(e); }
            });
          });
        } else
          btn.addClass("lockedBinding");
        var tr = $("<tr></tr>")
                 .append("<td>" + binding + "</td>")
                 .append($("<td></td>").append(btn))
                 .appendTo(this.keylist);
      }
    }
    $("<tr></tr>")
      .append("<td>Volume</td>")
      .append($("<td></td>")
        .append(
          $("<input type='range' min='0' max='1' step='0.05' />")
          .val(createjs.Sound.volume)
          .change(e => {
            createjs.Sound.volume = $(e.target).val();
            try {
              localStorage.setItem("volume", createjs.Sound.volume);
            } catch (e) {}
          })
        )
      )
      .appendTo(this.keylist);
  }

}

const config = new Config();
