import { Socket } from "socket.io";

declare global {
  interface Window {
    requestAnimFrame: any;
    webkitRequestAnimationFrame: any;
    mozRequestAnimationFrame: any;
    oRequestAnimationFrame: any;
    msRequestAnimationFrame: any;
    io: Socket;
  }

  interface JQuery {
    tooltip(arg: any): JQuery;
    qrcode(arg: any): JQuery;
    draggable(arg?: any): JQuery;
    droppable(arg: any): JQuery;
    countdown(arg: any): JQuery;
    resizable(arg: any): JQuery;
    dialog(arg: any): JQuery;
    slider(arg: any): JQuery;
    contextMenu(arg: any): JQuery;
  }

  interface JQueryStatic {
    contextMenu(arg: any): JQuery;
  }
}
