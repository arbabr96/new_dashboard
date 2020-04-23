import React, { Component } from "react";
import { Modal, Button, Layout } from "antd";
// import { ExclamationCircleOutlined } from "@ant-design/icons";
const { ExclamationCircleOutlined } = Layout;
const { confirm } = Modal;

export default class Logout extends Component {
  state = {
    show: false,
  };
  UNSAFE_componentWillReceiveProps(props) {
    this.setState({
      show: props.logout,
    });
  }
  showConfirm() {
    confirm({
      title: "Do you want to Logout?",
      icon: <ExclamationCircleOutlined />,
      content: "Some descriptions",
      onOk() {
        console.log("OK");
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  }

  render() {
    return <div>{this.state.show ? this.showConfirm() : null}</div>;
  }
}
