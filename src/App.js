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

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      token: "",
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
        <div className="page-load">
          <img src={logo} alt="" style={{ width: "300px", height: "300px" }} />
          <div className="loader">
            {/* <Spinner animation="grow" />
            <Spinner animation="grow" />
            <Spinner animation="grow" /> */}
            <div className="spinner">
              <div className="bounce1"></div>
              <div className="bounce2"></div>
              <div className="bounce3"></div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <Router>
        <div className={this.props.auth !== "" ? "All" : "App"}>
          <div className={this.props.auth !== "" ? null : "auth-wrapper"}>
            <div className={this.props.auth !== "" ? null : "auth-inner"}>
              <Switch>
                <Route
                  history={this.props.history}
                  path="/TakafulPanel/dashboard"
                  render={() => {
                    return this.props.auth !== "" ? (
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
