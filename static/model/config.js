class Config extends createjs.EventDispatcher {

  constructor () {
    super();

    this.volume = 1;

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

    input.on("config", this.toggle, this);
  }

  toggle () {
    input.enabledListeners.mousedown = !input.enabledListeners.mousedown;
    this.buildKeylist();
    this.container.toggle();
  }

  buildKeylist () {
    $(".keylist tr").detach();
    $("<tr><th>Binding</th><th>Key</th></tr>").appendTo(".keylist");
    for (var binding in input.bindings) {
      if (input.bindings.hasOwnProperty(binding)) {
        var btn = $("<button binding='" + binding + "'>" + input.bindings[binding][0] + "</button>")
                  .click(e => {
                    if (this.keylistener) input.off("keydown", this.keylistener);
                    $(e.target).text("_");
                    input.bindings[$(e.target).attr("binding")][0] = "";
                    this.keylistener = input.on("keydown", f => {
                      input.bindings[$(e.target).attr("binding")][0] = f.key;
                      $(e.target).text(f.key);
                      f.cancelBubble = true;
                      input.off("keydown", this.keylistener);
                      this.keylistener = null;
                    });
                  });
        var tr = $("<tr></tr>")
                 .append("<td>" + binding + "</td>")
                 .append($("<td></td>").append(btn))
                 .appendTo(this.keylist);
      }
    }
  }

}

const config = new Config();
