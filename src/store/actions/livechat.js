export function onConnect(connection) {
  return {
    type: "onConnect",
    connection
  };
}

export function updateTickets(tickets) {
  return {
    type: "updateTickets",
    tickets
  };
}

export function setAvailabilityOption(option) {
  return {
    type: "setAvailabilityOption",
    option
  };
}
export function newMessage(message) {
  return {
    type: "newMessage",
    message
  };
}
export function ticketID(ticketId) {
  return {
    type: "ticketID",
    ticketId
  };
}
export function callAlert(call) {
  return {
    type: "callAlert",
    call
  };
}
export function modalShow(modal) {
  return {
    type: "modalShow",
    modal
  };
}
export function msgReq(msg) {
  return {
    type: "msgReq",
    msg
  };
}
export function onAccept(accept) {
  return {
    type: "onAccept",
    accept
  };
}
export function onReject(reject) {
  return {
    type: "onReject",
    reject
  };
}
export function menuOpenClose(menu) {
  return {
    type: "menuOpenClose",
    menu
  };
}
export function newCallNotification(newCall) {
  return {
    type: "newCallNotification",
    newCall
  };
}
export function newCallMsg(newCallmsg) {
  return {
    type: "newCallMsg",
    newCallmsg
  };
}
export function acceptBySome(t_id) {
  return {
    type: "acceptBySome",
    t_id
  };
}
export function closeChat(close) {
  return {
    type: "closeChat",
    close
  };
}
export function closeTicket(close_Ticket) {
  return {
    type: "closeTicket",
    close_Ticket
  };
}
export function timeModal(time) {
  return {
    type: "timeModal",
    time
  };
}
export function timeExceed(time_id) {
  return {
    type: "timeExceed",
    time_id
  };
}

export function ermModal(erm) {
  return {
    type: "ermModal",
    erm
  };
}
