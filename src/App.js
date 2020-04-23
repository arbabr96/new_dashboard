import React from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Dashboard from "./screens/dashboard";
import Login from "./screens/Login";
import { connect } from "react-redux";
import logo from "./assets/logo.png";
import SignUp from "./screens/SignUp";
import { Spinner } from "react-bootstrap";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
    };
    // window.API_URL = "http://192.168.21.212:5000/";
    // window.API_URL = "http://54.36.109.50/TakafulAPI";
    window.API_URL = "https://iteck.pk/TakafulAPI/";
    window.Tak_API = "https://iteck.pk/TakafulAPI/";
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState({
        loader: false,
      });
    }, 3000);
  }
  render() {
    if (this.state.loader) {
      return (
        <div class="page-load">
          <img
            src={logo}
            // alt="Takaful"
            style={{ width: "300px", height: "300px" }}
          />
          <div class="loader">
            {/* <Spinner animation="grow" />
            <Spinner animation="grow" />
            <Spinner animation="grow" /> */}
            <div class="spinner">
              <div class="bounce1"></div>
              <div class="bounce2"></div>
              <div class="bounce3"></div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <Router>
        <div className={this.props.auth ? "All" : "App"}>
          <div className={this.props.auth ? null : "auth-wrapper"}>
            <div className={this.props.auth ? null : "auth-inner"}>
              <Switch>
                <Route
                  path="/TakafulPanel/dashboard"
                  render={() => {
                    return this.props.auth ? (
                      <Dashboard />
                    ) : (
                      <Redirect
                        to={{
                          pathname: "/TakafulPanel/Login",
                        }}
                      />
                    );
                  }}
                />
                <Route
                  path="/TakafulPanel/Login"
                  // render={() => {
                  //   return this.props.auth ? (
                  //     <Redirect
                  //       to={{
                  //         pathname: "/dashboard"
                  //       }}
                  //     />
                  //   ) : (
                  //     <Login />
                  //   );
                  // }}
                  render={() => {
                    return <Login />;
                  }}
                />
                <Route
                  path="/TakafulPanel/Signup"
                  render={() => {
                    return <SignUp />;
                  }}
                />
              </Switch>
            </div>
          </div>
        </div>
      </Router>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.AuthReducer.auth,
  };
};

export default connect(mapStateToProps)(App);
