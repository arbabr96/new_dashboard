import React from "react";
import '../index.css'
// import "antd/dist/antd.css";
import { Input } from "antd";
import { setAuth } from '../store/actions/auth'
import Store from "../store/store";
import { withRouter, } from "react-router-dom";

const axios = require("axios");

class Login extends React.Component {
    constructor() {
        super();
        this.state = {
            Username: "",
            Password: ""
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
            Password: Password
        };
        // console.log("USERNAME __ ", Username, Password);
        if (Username !== "") {
            if (Password !== "") {
                try {
                    axios
                        .post(window.API_URL + "api/auth/login", data)
                        .then(r => {
                            if (r.status === 200) {
                                console.log("Response --- ", r);
                                Store.dispatch(setAuth(r.data));

                                axios.defaults.headers.common["Authorization"] =
                                    "Bearer " + r.data.token;
                            }
                        })
                        .catch(c => {
                            alert("Check Credentials");
                            console.log("Api Error --- ", c);
                        });
                } catch (error) {
                    alert("Check Credentials");
                    console.log("Catch Error -- ", error);
                }
            } else {
                alert("Please Enter Password");
            }
        } else {
            alert("Please Enter Username");
        }
    };

    handleClick = () => {
        this.props.history.push("/sign-up");
    };

    render() {
        return (
            <form>
                <h3>Sign In</h3>
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
                        onChange={text => this.setState({ Username: text.target.value })}
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
                        visibilityToggle={false}
                        placeholder="Password"
                        onChange={text => this.setState({ Password: text.target.value })}
                        onKeyUp={text => {
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
                {/* <Link to="/TakafulPanel/Signup">
          <button
            type="button"
            onClick={this.handleClick}
            className="btn btn-success btn-block"
          >
            Sign Up
        </button>
        </Link> */}
                {/* <p className="forgot-password text-right">
              <a href="#">Sign Up</a>
            </p> */}
            </form>
        );
    }
}
export default withRouter(Login);
