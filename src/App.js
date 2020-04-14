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
import SignUp from "./screens/SignUp";

class App extends React.Component {
  constructor(props) {
    super(props);

    // window.API_URL = "http://192.168.21.212:5000/";
    // window.API_URL = "http://54.36.109.50/TakafulAPI";
    window.API_URL = "https://iteck.pk/Takaful/";
  }
  render() {
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
                          pathname: "/TakafulPanel/signIn",
                        }}
                      />
                    );
                  }}
                />
                <Route
                  path="/TakafulPanel/signIn"
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
                  path="/TakafulPanel/signUP"
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
