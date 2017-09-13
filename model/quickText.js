class QuickText extends createjs.Text {
  constructor(props = {})
  {
    super();
    let defaultSets = Object.assign({}, {
      text: "", color: "#EEE", font: "20px Montserrat"
    }, props);
    this.set(defaultSets);
  }
}
