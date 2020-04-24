export function setAuth(auth) {
  return {
    type: "setAuth",
    data: auth,
  };
}
export function rmAuth(auth) {
  return {
    type: "rmAuth",
    data: auth,
  };
}
