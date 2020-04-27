import React from "react";
import "../index.css";
import "antd/dist/antd.css";
import "antd/es/message/style/css";
import { Input, message } from "antd";
import { setAuth, rmAuth } from "../store/actions/auth";
import Store from "../store/store";
import { withRouter } from "react-router-dom";
import Grow from "@material-ui/core/Grow";

const axios = require("axios");

class Login extends React.Component {
  constructor() {
    super();
    this.state = {
      Username: "",
      Password: "",
      isDisconnected: false,
      checked: false,
    };
  }
  componentDidMount() {
    this.setState({
      checked: true,
    });
    try {
      const token = localStorage.getItem("token");
      if (token === null || token === "") {
        console.log("Session out Login");
        Store.dispatch(rmAuth(""));
        this.props.history.push("/");
      } else {
        // console.log("Local Storage Value APP JS", token);
        Store.dispatch(setAuth(JSON.parse(token)));
        this.props.history.push("/Dashboard");
      }
    } catch (e) {
      console.log("Local Storage Catch Error", e);
    }

    this.handleConnectionChange();
    window.addEventListener("online", this.handleConnectionChange);
    window.addEventListener("offline", this.handleConnectionChange);
  }

  componentWillUnmount() {
    window.removeEventListener("online", this.handleConnectionChange);
    window.removeEventListener("offline", this.handleConnectionChange);
  }
  handleConnectionChange = () => {
    const key = "login";
    const condition = navigator.onLine ? "online" : "offline";
    if (condition === "online") {
      const webPing = setInterval(() => {
        fetch("//google.com", {
          mode: "no-cors",
        })
          .then(() => {
            this.setState({ isDisconnected: false }, () => {
              // console.log("Online");
              return clearInterval(webPing);
            });
          })
          .catch(() => this.setState({ isDisconnected: true }));
      }, 2000);
      return;
    } else {
      // console.log("Offline");
      message.error({
        content: "Internet Disconnected",
        key,
        duration: 1,
      });
      return this.setState({ isDisconnected: true });
    }
  };

  login = () => {
    const { Username, Password } = this.state;
    const data = {
      Username: Username,
      Password: Password,
    };
    const key = "login";

    // console.log("USERNAME __ ", Username, Password);
    if (Username !== "") {
      if (Password !== "") {
        message.loading({
          content: "Please wait ...",
          key,
          duration: 1000,
        });

        try {
          axios
            .post(window.API_URL + "api/auth/login", data)
            .then((r) => {
              if (r.status === 200) {
                console.log("Response --- ", r);
                message.success({
                  content: "Login Successfully!",
                  key,
                  duration: 0.5,
                });

                axios.defaults.headers.common["Authorization"] =
                  "Bearer " + r.data.token;
                setTimeout(() => {
                  Store.dispatch(setAuth(r.data));
                  localStorage.setItem("token", JSON.stringify(r.data));
                  this.props.history.push("/Dashboard");
                }, 600);
              }
            })
            .catch((c) => {
              message.error({ content: `${c.message}`, key, duration: 1 });
              // console.log("Api Error --- ", c);
            });
        } catch (error) {
          message.error({ content: `${error.message}`, key, duration: 1 });
          // console.log("Catch Error -- ", error);
        }
      } else {
        message.error({ content: "Please Enter Password", key, duration: 1 });
      }
    } else {
      message.error({ content: "Please Enter Username", key, duration: 1 });
    }
  };
  signup = () => {
    this.props.history.push("/TakafulPanel/Signup");
  };

  render() {
    const { checked } = this.state;
    return (
      <div className={"App"}>
        <div className={"auth-wrapper"}>
          <div className={"auth-inner"}>
            <Grow
              in={checked}
              style={{ transformOrigin: "0 0 0 0" }}
              {...(checked ? { timeout: 400 } : {})}
            >
              <form>
                <h3>Takaful Login</h3>
                <div className="form-group">
                  <label>Username</label>
                  {/* <input
            type="email"
            className="form-control"
            placeholder="Enter email"
            onChange
          /> */}
                  <Input
                    placeholder="Username"
                    onChange={(text) =>
                      this.setState({ Username: text.target.value })
                    }
                    // value={this.state.Username}
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  {/* <input
            type="password"
            className="form-control"
            placeholder="Enter password"
          /> */}
                  <Input.Password
                    visibilityToggle={true}
                    placeholder="Password"
                    onChange={(text) =>
                      this.setState({ Password: text.target.value })
                    }
                    onKeyUp={(text) => {
                      if (text.keyCode === 13 && text.target.value !== "") {
                        this.login();
                      }
                    }}
                    // value={this.state.Password}
                  />
                </div>
                <div className="form-group">
                  <div className="custom-control custom-checkbox">
                    {/* <input
                type="checkbox"
                className="custom-control-input"
                id="customCheck1"
              />
              <label className="custom-control-label" htmlFor="customCheck1">
                Remember me
              </label> */}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={this.login}
                  className="btn btn-primary btn-block"
                >
                  Login
                </button>
                {/* <button
          type="button"
          onClick={this.signup}
          className="btn btn-success btn-block"
        >
          Sign Up
        </button> */}
                {/* <p className="forgot-password text-right">
          <a onClick={this.signup} href="#">
            Sign Up
          </a>
        </p> */}
              </form>
            </Grow>
          </div>
        </div>
      </div>
    );
  }
}
export default withRouter(Login);
