import React from "react";
import "./App.css";
import { HashRouter, Switch, Route, Redirect } from "react-router-dom";
import Dashboard from "./screens/dashboard";
import Login from "./screens/Login";
import { connect } from "react-redux";
import logo from "./assets/logo.png";
import SignUp from "./screens/SignUp";
import Store from "./store/store";
import { setAuth } from "./store/actions/auth";

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
      <HashRouter basename="/">
        {/* <div className={this.props.auth !== "" ? "All" : "App"}> */}
        {/* <div className={this.props.auth !== "" ? null : "auth-wrapper"}>
            <div className={this.props.auth !== "" ? null : "auth-inner"}> */}
        {this.props.auth === "" ? (
          <Route path="/" render={() => <Login />} />
        ) : (
          <Switch>
            {/* <Route exact path="/">
              <Login />
            </Route> */}
            <Route exact path="/Dashboard">
              <Dashboard />
            </Route>
            {/*  <Route
                  exact
                  path="/TakafulPanel"
                  render={() => {
                    return <Login />;
                  }}
                />
                <Route
                  path="/TakafulPanel/Signup"
                  render={() => {
                    return <SignUp />;
                  }}
                /> */}
          </Switch>
        )}
        {/* </div>
          </div>
        </div> */}
      </HashRouter>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.AuthReducer.auth,
  };
};

export default connect(mapStateToProps)(App);
