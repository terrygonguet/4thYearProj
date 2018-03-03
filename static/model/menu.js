class Menu {

  constructor() {
    this.container    = $("#menu").show();
    this.txbName      = $("<input id='txbName' required autofocus placeholder='theLegend27' value='"+(localStorage.getItem("name") || "")+"'/>");
    this.btnRename     = $("<button class='NeonButton' id='btnRename'>Set name</button>");
    this.tblRooms     = $("<table id='tblRooms'></table>");
    this.lblName      = $("<button class='NeonButton' id='lblName'>"+localStorage.getItem("name")+"</button>");
    this._refresher   = null;

    this.container.on("click", "#btnRename", e => {
      var name = $("#txbName").val();
      if (name) {
        localStorage.setItem("name", name);
        game.name = name;
        this.lblName.text(name);
        this.gotoList();
      }
    });
    this.container.on("keydown", "#txbName", e => e.key === "Enter" && this.btnRename.click() || true);
    this.container.on("click", "#lblName", e => this.gotoName());
    this.container.on("click", ".btnJoin", e => {
      var room = Number($(e.target).attr("room"));
      this.gotoGame();
      game.socket.emit("joinroom", room);
    });
    this.container.on("click", "#btnRefresh", e => this.gotoList());
    this.container.on("click", "#btnCreate", e => {
      game.socket.emit("createroom", { type:"Deathmatch" });
      this.gotoList();
    });

    this.tblRooms.empty()
      .append(`<tr id="tblHeader">
        <th>ID</th>
        <th>Type</th>
        <th>State</th>
        <th>Players</th>
        <th><button class="NeonButton" id="btnRefresh">Refresh</button></th>
      </tr>`);
    localStorage.getItem("name") === null && this.gotoName() || this.gotoList();
    game = game || new Game("game");
  }

  showMenu() {
    $("#game").hide();
    input.enabledListeners.keydown = false;
    return this.container.show();
  }

  gotoName() {
    this.showMenu().empty()
      .append("<p>Enter your name :</p>")
      .append(
        $("<p>")
          .append(this.txbName)
          .append(this.btnRename)
      );
  }

  gotoList() {
    this.showMenu().empty()
      .append(this.lblName)
      .append(this.tblRooms);
    this.tblRooms.children(":not(#tblHeader)").detach();
    this.tblRooms.append("<tr><th colspan=5 >Loading</th></tr>");
    $.getJSON("/rooms", res => {
      this.tblRooms.children(":not(#tblHeader)").detach();
      for (var room of res) {
        this.tblRooms.append(`<tr>
          <td>${room.id}</td>
          <td>${room.type}</td>
          <td>${room.state}</td>
          <td>${room.players}/${room.maxplayers}</td>
          <td><button class="NeonButton btnJoin" room="${room.id}">Join</button></td>
        </tr>`);
      }
      this.tblRooms.append("<tr><th colspan=5 ><button class='NeonButton' id='btnCreate'>Create</button></th></tr>");
      if (!res.length) {
        $("#btnCreate").parent().prepend("No rooms - ");
      }
    });
  }

  gotoGame() {
    this.container.empty().hide();
    $("#game").show();
    input.enabledListeners.keydown = true;
  }

}
