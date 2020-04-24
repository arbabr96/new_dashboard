import { combineReducers } from "redux";

const initialState = {
  tickets: [],
  isAvailable: true,
  auth: "",
  message: "",
  ticketId: "",
  modal: false,
  msg: "",
  accept: false,
  reject: false,
  menu: false,
  newCall: false,
  newCallmsg: "",
  t_id: "",
  close: false,
  close_Ticket: false,
  time_id: "",
  time: false,
  erm: false,
};

var jwtDecode = require("jwt-decode");

function AuthReducer(state = initialState, action) {
  switch (action.type) {
    case "setAuth":
      var data = jwtDecode(action.data.token);
      return Object.assign({}, state, {
        auth: {
          token: action.data.token,
          profile: {
            name: data.Name,
          },
        },
      });
    case "rmAuth":
      return Object.assign({}, state, {
        auth: "",
      });
    default:
      return state;
  }
}

function LiveChatReducer(state = initialState, action) {
  switch (action.type) {
    case "onConnect":
      return Object.assign({}, state, {
        connection: action.connection,
      });

    case "updateTickets":
      return Object.assign({}, state, {
        tickets: action.tickets,
      });

    case "setAvailabilityOption":
      return Object.assign({}, state, {
        isAvailable: action.option,
      });
    case "newMessage":
      // if (action.message == undefined) {
      //     return state
      // }
      return Object.assign("", state, {
        message: action.message,
      });
    case "ticketID":
      return Object.assign("", state, {
        ticketId: action.ticketId,
      });
    case "callAlert":
      return Object.assign("", state, {
        call: action.call,
      });
    case "modalShow":
      return Object.assign("", state, {
        modal: !state.modal,
      });
    case "msgReq":
      return Object.assign("", state, {
        msg: action.msg,
      });
    case "onAccept":
      return Object.assign("", state, {
        accept: !state.accept,
      });
    case "onReject":
      return Object.assign("", state, {
        reject: !state.reject,
      });
    case "menuOpenClose":
      return Object.assign("", state, {
        menu: !state.menu,
      });
    case "newCallNotification":
      return Object.assign("", state, {
        newCall: !state.newCall,
      });
    case "newCallMsg":
      return Object.assign("", state, {
        newCallmsg: action.newCallmsg,
      });
    case "acceptBySome":
      return Object.assign("", state, {
        t_id: action.t_id,
      });
    case "closeChat":
      return Object.assign("", state, {
        close: !state.close,
      });
    case "closeTicket":
      return Object.assign("", state, {
        close_Ticket: !state.close_Ticket,
      });
    case "timeModal":
      return Object.assign("", state, {
        time: state.time,
      });
    case "timeExceed":
      return Object.assign("", state, {
        time_id: state.time_id,
      });
    case "ermModal":
      return Object.assign("", state, {
        erm: !state.erm,
      });
    default:
      return state;
  }
}

const Reducers = combineReducers({
  AuthReducer,
  LiveChatReducer,
});

export default Reducers;
