import React, { Component } from "react";
import Ripples from "react-ripples";
import Divider from "@material-ui/core/Divider";
import "../../index.css";
class TabBar extends Component {
  render() {
    return (
      <div className="row">
        <div className="col-3">
          <div
            id="style-1"
            className="chatBox"
            style={{
              width: "300px",
              backgroundColor: "#fafafa",
              paddingTop: "10px",
              paddingBottom: "10px",
            }}
          >
            {/* ////////////////////// Header ///////////////////////// */}
            <div className="row">
              <div className="col-6">
                <span className="leftText" style={{ paddingLeft: "10px" }}>
                  Chats
                </span>
              </div>
            </div>
            <div className="bottom_Width" />
            {/* ////////////////////// Header ///////////////////////// */}

            <Ripples color="#0d74bc" during={1500}>
              {/* <div className="chat_Tabs">Arbab 123</div> */}
            </Ripples>
            <Divider light={true} />
          </div>
        </div>
      </div>
    );
  }
}
export default TabBar;
