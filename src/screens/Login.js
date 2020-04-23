import React from "react";
import "../index.css";
// import "antd/dist/antd.css";
import { Input, message } from "antd";
import { setAuth } from "../store/actions/auth";
import Store from "../store/store";
import { withRouter } from "react-router-dom";

const axios = require("axios");

class Login extends React.Component {
  constructor() {
    super();
    this.state = {
      Username: "",
      Password: "",
    };
  }
  //   componentDidMount() {
  //     setTimeout(() => {
  //       axios
  //         .post(window.API_URL + "/api/auth/login", {
  //           Username: "admin",
  //           Password: "admin123456"
  //         })
  //         .then(r => {
  //           Store.dispatch(setAuth(r.data));

  //           axios.defaults.headers.common["Authorization"] =
  //             "Bearer " + r.data.token;
  //         })
  //         .catch(c => {
  //           console.log("c", c);
  //         });
  //     }, 500);
  //   }

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
        const hide = message.loading({
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
                  this.props.history.push("/TakafulPanel/dashboard");
                }, 600);
              }
            })
            .catch((c) => {
              message.error({ content: "Check Credentials", duration: 1 });
              console.log("Api Error --- ", c);
            });
        } catch (error) {
          message.error({ content: "Check Credentials", duration: 1 });
          console.log("Catch Error -- ", error);
        }
      } else {
        message.error({ content: "Please Enter Password", duration: 1 });
      }
    } else {
      message.error({ content: "Please Enter Username", duration: 1 });
    }
  };

  handleClick = () => {
    this.props.history.push("/sign-up");
  };
  signup = () => {
    this.props.history.push("/TakafulPanel/Signup");
  };

  render() {
    return (
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
            onChange={(text) => this.setState({ Username: text.target.value })}
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
            onChange={(text) => this.setState({ Password: text.target.value })}
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
        <button
          type="button"
          onClick={this.signup}
          className="btn btn-success btn-block"
        >
          Sign Up
        </button>
        {/* <p className="forgot-password text-right">
          <a onClick={this.signup} href="#">
            Sign Up
          </a>
        </p> */}
      </form>
    );
  }
}
export default withRouter(Login);
