import React from 'react';
import electron from 'electron';

export default class TitleBar extends React.Component {
  constructor(props) {
    super(props);

    this.remote = electron.remote || false;

    this.minimize = this.minimize.bind(this);
    this.close = this.close.bind(this);
  }

  minimize() {
    const window = this.remote.getCurrentWindow();
    window.minimize();
  }

  close() {
    const window = this.remote.getCurrentWindow();
    window.close();
  }

  render() {
    return (
      <div id="title-bar">
        <div id="title-bar-btns">
          <div id="min-btn" className="" onClick={this.minimize}></div>
          <div id="close-btn" className="" onClick={this.close}></div>
        </div>

        <style jsx>{`
          div {
            height: auto;
          }
          #title-bar {
            background: #2c3e50;
            width: 100%;
            height: 30px;
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
            -webkit-app-region: drag;
          }
          #title-bar-btns {
            position: absolute;
            right: 10px;
          }
          #title-bar-btns div {
            -webkit-app-region: no-drag;
            width: 15px;
            height: 15px;
            border: none
            border-radius: 100%;
            display: inline-block;
            margin-right: 5px;
            margin-top: 7.5px;
          }
          #title-bar-btns #min-btn {
            background: #f1c40f;
          }
          #title-bar-btns #min-btn:hover {
            background: #c19d0b;
          }
          #title-bar-btns #close-btn {
            background: #e74c3c;
          }
          #title-bar-btns #close-btn:hover {
            background: #cf2a19;
          }
        `}</style>
      </div>
    );
  }
}
