import React from "react";
import {
  onConnect,
  updateTickets,
  modalShow,
  msgReq,
  acceptBySome,
  closeTicket,
  closeChat,
  timeExceed,
  timeModal,
} from "../store/actions/livechat";
import "antd/dist/antd.css";
import { rmAuth } from "../store/actions/auth";
import Store from "../store/store";
import logout from "../assets/logout.png";
import ChatInstance from "./components/ChatInstance";
import {
  Form,
  FormGroup,
  Input,
  Table,
  InputGroup,
  InputGroupAddon,
} from "reactstrap";
import Radium, { StyleRoot } from "radium";
import { bounceInUp } from "react-animations";
import Ripples from "react-ripples";
import Button from "@material-ui/core/Button";
import { withRouter } from "react-router";
import QueryBuilderIcon from "@material-ui/icons/QueryBuilder";
import { Tabs, Icon, notification, message } from "antd";
import IconButton from "@material-ui/core/IconButton";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import RemoveCircleOutlineIcon from "@material-ui/icons/RemoveCircleOutline";
import AddCircleRoundedIcon from "@material-ui/icons/AddCircleRounded";
import VideocamIcon from "@material-ui/icons/Videocam";
import TextField from "@material-ui/core/TextField";
import SendIcon from "@material-ui/icons/Send";
import Chip from "@material-ui/core/Chip";
import CloseIcon from "@material-ui/icons/Close";
import { connect } from "react-redux";
import { Modal } from "react-bootstrap";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import DoneIcon from "@material-ui/icons/Done";
import logo from "../assets/logo.png";
const signalR = require("@aspnet/signalr");
const { TabPane } = Tabs;

const styles = {
  bounce: {
    animation: "x 1s",
    animationName: Radium.keyframes(bounceInUp, "bounceInUp"),
  },
};

class dashboard extends React.Component {
  localStream;
  localVideo = React.createRef();
  remoteVideo = React.createRef();
  constructor() {
    super();
    this.state = {
      isOpen: false,
      availability: "Available",
      showRemoteVideo: false,
      ticket_newMessage: false,
      patient_id: "",
      msgURL: require("../assets/notification.mp3"),
      newRequest_array: [],
      update_Tickets: [],
      newRequest_check: false,
      timeExceed_array: [],
      patientName: "",
      error_PatientName: "",
      Age: "",
      Gender: "",
      error_Gender: "",
      errorAge: "",
      treatment_arr: [],
      complaints_symptoms: [],
      add_Prescription: [],
      lab_tests: [],
      close_chat: false,
      selected_id: 0,
      select_ticket: "",
      show_video: false,
      logout_show: false,
      token: "",
    };
    this.url =
      "https://nf1f8200-a.akamaihd.net/downloads/ringtones/files/mp3/iphone-6-original-ringtone-24163.mp3";
    this.audio = new Audio(this.url);
    this.msgAudio = new Audio(this.state.msgURL);
  }
  getState = (state) => {
    return state;
  };
  componentDidMount() {
    this.connectWithLiveChatHub();
    try {
      const token = localStorage.getItem("token");
      if (token === null) {
        console.log("Session Out");
      }
    } catch (e) {
      console.log("Local Storage Catch", e);
    }
    this.handleConnectionChange();
    window.addEventListener("online", this.handleConnectionChange);
    window.addEventListener("offline", this.handleConnectionChange);
    // axios
    //   .post(window.API_URL + "api/auth/login", {
    //     Username: "admin",
    //     Password: "admin123456"
    //   })
    //   .then(r => {
    //     Store.dispatch(setAuth(r.data));
    //     console.log("Data --- ", r.data);
    //     axios.defaults.headers.common["Authorization"] =
    //       "Bearer " + r.data.token;
    //     setTimeout(() => {
    //       this.connectWithLiveChatHub();
    //     }, 2000);
    //   })
    //   .catch(c => {
    //     console.log("c", c);
    //   });
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
  //////////////////////////////////////// CONNECTION WITH HUB //////////////////////////////////////////////////
  connectWithLiveChatHub = () => {
    const key = "conn";

    message.loading({
      content: "Establishing Connection with Server ...",
      key,
      duration: 1000,
    });
    let connection = new signalR.HubConnectionBuilder()
      .withUrl(window.API_URL + "livechat", {
        accessTokenFactory: () => {
          return this.props.auth.token;
        },
      })
      .build();

    connection.on("exception", (exception) => {
      console.log("connectWithLiveChatHub exception", exception);
    });

    connection.on("NewRequest", (event) => {
      console.log("NewRequest ==== ", event);
      /////////////////////////////////////////////////////////////////////
      const close = () => {
        this.props.connection.invoke("OnReject", event).then((response) => {
          notification.close(event);
          this.setState({
            newRequest_check: false,
          });

          if (this.props.modal) {
            this.props.modalShow(false);
          }
        });
      };

      const btn = (
        <Button
          variant="contained"
          size="small"
          color="primary"
          startIcon={<DoneIcon />}
          onClick={() => {
            console.log("ON ACCEPT", key);
            this.props.connection.invoke("OnAccept", event).then(() => {
              notification.close(event);
              this.setState({
                newRequest_check: false,
              });
              if (this.props.modal) {
                this.props.modalShow(false);
              }
            });
          }}
        >
          Accept
        </Button>
      );

      notification.open({
        message: <div style={{ fontWeight: "bold" }}>Message Request</div>,
        description: `New Message Request From Patient ID - ${event}`,
        btn,
        key,
        onClose: close,
        duration: 60,
      });
      ///////////////////////////////////////////////////////////////////////
    });
    connection.on("AcceptedBySomeDoctor", (event) => {
      console.log("AcceptedBySomeDoctor --- ", event);
    });

    connection.on("OnTimeExceed", (event) => {
      console.log("OnTimeExceed ------ ----- ", JSON.stringify(event));
    });
    connection.on("newWindow", (event) => {
      this.setState({
        newRequest_check: false,
      });
      this.setState(
        {
          newRequest_array: this.state.newRequest_array.filter(
            (item, index) => {
              return item.key !== JSON.stringify(event);
            }
          ),
        },
        () => {
          console.log(
            "newWindow newWindow +_++++ ",
            this.state.newRequest_array
          );
        }
      );
      console.log("NEW WINDOWS ", event);
      var tickets = [...this.props.tickets, event];
      // console.log("TIckets === ", tickets);
      this.props.updateTickets(tickets);
      this.send_TO_CI();
      this.forceUpdate();
    });
    connection.on("OnCloseWindow", () => {
      console.log("OnCloseWindow ");
      // this.props.closeChat(false);
      var tickets = [...this.props.tickets];
      this.props.updateTickets(tickets);
      this.props.closeTicket(false);
    });

    connection
      .start()
      .then(() => {
        console.log("Connection Established");
        message.success({
          content: "Connection Established!",
          key,
          duration: 1,
        });
        this.props.onConnect(connection);
      })
      .catch((err) => {
        console.log("Error Establishing Connection");
        message.error({
          content: "Error Establishing Connection",
          key,
          duration: 1,
        });
      });
  };
  //////////////////////////////////////// CONNECTION WITH HUB //////////////////////////////////////////////////
  addNewMessageToTicket = (message) => {
    var ticketNumber = message.ticketID;

    var tickets = [...this.props.tickets];

    var ticket = tickets.find((x) => x.id === ticketNumber);

    if (ticket) {
      // console.log(message.ticket.id, '===', tickets);

      ticket.messages.push(message);

      this.props.updateTickets(tickets);
    }
  };

  handleModeChange = (e) => {
    const mode = e.target.value;
    this.setState({ mode });
  };

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  };
  changeStatus = () => {
    if (this.state.availability === "Away") {
      if (this.props.connection) {
        this.props.connection
          .invoke("setAvailability", "Available")
          .then((r) => {
            console.log("r", r);
          })
          .catch((e) => {
            console.log("e", e);
          });
      }
      this.setState({
        availability: "Available",
      });
      console.log("Value is Available");
    } else {
      this.setState({
        availability: "Away",
      });
    }
    // if (val === "Available") {
    //   if (this.props.connection) {
    //     this.props.connection
    //       .invoke("setAvailability", val)
    //       .then(r => {
    //         console.log("r", r);
    //       })
    //       .catch(e => {
    //         console.log("e", e);
    //       });
    //   }
    //   console.log("Value is Available");
    // }
    // this.setState({
    //   availability: "Away"
    // });
  };
  drawChatTabs = () => {
    if (this.props.tickets.length > 0) {
      return (
        <Tabs
          id="style-1"
          defaultActiveKey={this.props.tickets.length}
          tabPosition={"left"}
          type="card"
          size="small"
          animated={true}
          // renderTabBar={() => <TabBar />}
          tabBarExtraContent={() => <div>hello</div>}
          tabBarStyle={{
            // backgroundColor: "#ffff",
            maxHeight: "400px",
            width: "200px",
            textAlign: "left",
            justifyContent: "flex-start",
            borderBottomWidth: "1px",
            overflowY: "auto",
            overflowX: "hidden",
            borderWidth: "0px",
            borderColor: "#fff",
          }}
        >
          {this.props.tickets
            .map((ticket, index) => {
              console.log("ticket new", this.props.tickets);

              var name = (
                <div id="style-1" className="chatTab">
                  {
                    this.props.call === "UpComming Call" &&
                    this.props.ticketId === ticket.id ? (
                      <Icon
                        type="phone"
                        theme="filled"
                        style={{ color: "#2ECC71" }}
                      />
                    ) : null
                    // <Icon
                    //   style={{
                    //     color:
                    //       this.props.message === "New Message" &&
                    //       this.props.ticketId === ticket.id
                    //         ? "#2ECC71"
                    //         : "#f00"
                    //   }}
                    //   type="bulb"
                    //   theme={
                    //     this.props.message === "New Message" &&
                    //     this.props.ticketId === ticket.id
                    //       ? "filled"
                    //       : ""
                    //   }
                    // />
                  }
                  {this.props.message === "New Message" &&
                  this.props.ticketId === ticket.id
                    ? this.props.message
                    : ticket.patient.username + " - " + ticket.id}
                </div>
              );

              return (
                <TabPane
                  id="style-1"
                  tab={name}
                  key={ticket.id}
                  forceRender={true}
                >
                  <ChatInstance
                    connection={this.props.connection}
                    ticket={ticket}
                  />
                </TabPane>
              );
            })
            .reverse()}
        </Tabs>
      );
    } else {
      return <div className="waiting"> Listening for New Tickets ..</div>;
    }
  };
  //////////////////////////////////////// DRAW DYNAMIC CHAT TABS //////////////////////////////////////////////////
  openNotification = (key) => {
    console.log("Modal State on Notification ---- --- ", key);
    const close = () => {
      this.props.connection.invoke("OnReject", key).then((response) => {
        console.log("Reject ID" + key + "REJECT RESPONSE ______ ", response);
        notification.close(key);
        this.setState({
          newRequest_check: false,
        });

        if (this.props.modal) {
          this.props.modalShow(false);
        }
      });
    };

    const btn = (
      <Button
        variant="contained"
        size="small"
        color="primary"
        startIcon={<DoneIcon />}
        // onClick={() => notification.close(key)}
        onClick={() => {
          console.log("ON ACCEPT", key);
          this.props.connection.invoke("OnAccept", key).then(() => {
            console.log("Accept ID" + key + "Accept");
            notification.close(key);
            this.setState({
              newRequest_check: false,
            });
            if (this.props.modal) {
              this.props.modalShow(false);
            }
          });
        }}
      >
        Accept
      </Button>
    );

    notification.open({
      message: <div style={{ fontWeight: "bold" }}>Message Request</div>,
      description: `New Message Request From Patient ID - ${key}`,
      btn,
      key,
      onClose: close,
      duration: 2000,
    });
  };
  closeChatModal = () => {
    if (this.props.close) {
      console.log("this.props.close", this.props.close);
      return (
        <Modal
          fade={true}
          centered={true}
          backdrop={true}
          show={this.props.close}
          toggle={this.toggle}
          className={"modal"}
          backdropClassName={"backdrop"}
        >
          <Modal.Header>Confirmation</Modal.Header>
          <Modal.Body>Do you want to Close Chat?</Modal.Body>
          <Modal.Footer>
            <Button
              color="primary"
              onClick={() => {
                this.props.closeChat(false);
                this.props.closeTicket(true);
              }}
            >
              Yes
            </Button>
            <Button
              color="secondary"
              onClick={() => this.props.closeChat(false)}
            >
              No
            </Button>
          </Modal.Footer>
        </Modal>
      );
    }
  };
  switch_to_video = () => {
    console.log("switch_to_video", this.state.show_video);
    this.setState({
      show_video: !this.state.show_video,
    });
  };
  send_TO_CI = () => {
    if (this.props.tickets.length > 0) {
      // console.log('this.props.tickets Dashboard', this.state.selected_id)

      return (
        <ChatInstance
          connection={this.props.connection}
          ticket={this.props.tickets[this.state.selected_id]}
        />
      );
    } else {
      return (
        <div className="col-9 chat_instance">
          <div className="row">
            <div className="col-6">
              <div className="chat_area" style={{ backgroundColor: "#f6f6f8" }}>
                <div className="row">
                  <div className="col">
                    <div className="mt-1 patient_Name">Patient - 1771</div>
                  </div>
                  <div className="col">
                    <div className="right_bar">
                      <div className="row">
                        <FormControlLabel
                          disabled
                          className="mt-2"
                          control={
                            <Switch
                              size="small"
                              checked={this.state.show_video}
                              onChange={() => this.switch_to_video()}
                            />
                          }
                          label={
                            this.state.show_video ? (
                              <div
                                className="show_hide"
                                style={{ fontSize: "12px" }}
                              >
                                Hide Video
                              </div>
                            ) : (
                              <div
                                className="show_hide"
                                style={{ fontSize: "12px" }}
                              >
                                Show Video
                              </div>
                            )
                          }
                        />
                        <IconButton
                          disabled={true}
                          color="secondary"
                          aria-label="add an alarm"
                        >
                          <VideocamIcon style={{ color: "#7a7a7a" }} />
                        </IconButton>

                        <IconButton
                          disabled={true}
                          color="secondary"
                          aria-label="add an alarm"
                        >
                          <CloseIcon
                            style={{
                              color: "red",
                            }}
                          />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                </div>
                {/* <Divider style={{ color: "red" }} /> */}
                <div className="block-example border-bottom border-primary"></div>
                <div className="row">
                  <div className="col">
                    <div className="middle" id="style-1">
                      <div
                        ref={(el) => {
                          this.lastMessage = el;
                        }}
                        id="style-1"
                        style={{
                          overflowX: "hidden",
                          overflowY: "auto",
                          maxHeight: "360px",
                        }}
                      >
                        <div className="no_message">
                          <Chip
                            icon={<QueryBuilderIcon />}
                            label="Waiting for Tickets ..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  id="inputField"
                  className="row"
                  style={{
                    backgroundColor: "#ffff",
                  }}
                >
                  <div className="col-9">
                    <TextField
                      id="outlined-multiline-static"
                      multiline
                      disabled
                      rowsMax="3"
                      placeholder="Type Here"
                      style={{
                        fontSize: "10px",
                        // paddingBottom: '10px'
                      }}
                      fullWidth={true}
                      value={this.state.textMessage}
                      onChange={(text) =>
                        this.setState({ textMessage: text.target.value })
                      }
                    />
                  </div>
                  <div className="col-3">
                    <IconButton
                      disabled
                      color="secondary"
                      aria-label="add an alarm"
                    >
                      <AttachFileIcon />
                    </IconButton>

                    <IconButton
                      disabled
                      style={{
                        borderWidth: "0px",
                      }}
                      color="primary"
                      aria-label="add an alarm"
                    >
                      <SendIcon
                        style={{
                          color: "#0d74bc",
                        }}
                      />
                    </IconButton>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6">
              <div
                id="style-1"
                className="prescription_form block-example border border-light"
                style={{
                  backgroundColor: "#fff",
                  overflowX: "hidden",
                  overflowY: "auto",
                }}
              >
                <div className="heading_1 show_hide">
                  <img
                    src={logo}
                    alt=""
                    style={{ width: "60px", height: "60px" }}
                  />
                </div>
                {/* <Divider /> */}
                <div className="block-example border-bottom border-primary"></div>
                <Form>
                  {/* ///////////////// Customer Details ///////////////// */}
                  <div className="tab_heading show_hide">
                    Customer Details :
                  </div>
                  <div className="block-example border-bottom border-primary"></div>
                  <FormGroup
                    // className="form_group"
                    style={{
                      marginTop: "10px",
                      paddingLeft: "6px",
                      paddingRight: "6px",
                    }}
                  >
                    <div className="row">
                      <div className="col">
                        {" "}
                        <Input
                          type="text"
                          required={true}
                          name="health_id"
                          className="show_hide"
                          id="health_id"
                          placeholder="Health ID #"
                          style={{ fontSize: "12px" }}
                          disabled
                        />
                      </div>

                      {/* <div className="col">
                        <Input
                          type="number"
                          disabled={true}
                          name="registeration_id"
                          className="show_hide"
                          id="registeration_id"
                          placeholder="Registration #"
                          style={{ fontSize: "12px" }}
                        />
                        <span
                          style={{
                            color: "red",
                            fontSize: "12px",
                            fontWeight: "normal"
                          }}
                        >
                          {this.state.errorAge}
                        </span>
                      </div> */}

                      <div className="col">
                        {" "}
                        <Input
                          type="text"
                          required={true}
                          disabled
                          name="mr/mrs"
                          className="show_hide"
                          id="mr/mrs"
                          placeholder="Mr/Mrs"
                          style={{ fontSize: "12px" }}
                        />
                      </div>
                      <div className="col">
                        <Input
                          type="text"
                          required={true}
                          name="email"
                          className="show_hide"
                          id="email"
                          placeholder="Email-Address"
                          style={{ fontSize: "12px" }}
                          disabled
                        />
                      </div>
                    </div>
                  </FormGroup>
                  <FormGroup
                    // className="form_group"
                    style={{
                      marginTop: "5px",
                      paddingLeft: "6px",
                      paddingRight: "6px",
                    }}
                  >
                    <div className="row">
                      <div className="col">
                        {" "}
                        <Input
                          type="select"
                          name="gender"
                          disabled
                          className="show_hide"
                          id="gender"
                          placeholder="Gender"
                          style={{ fontSize: "12px" }}
                        >
                          <option>Gender</option>
                          <option>Male</option>
                          <option>Female</option>
                        </Input>
                      </div>
                      <div className="col">
                        {" "}
                        <Input
                          type="text"
                          required={true}
                          name="contact"
                          id="contact"
                          placeholder="Contact"
                          style={{ fontSize: "12px" }}
                          disabled
                          className="show_hide"
                        />
                      </div>
                      <div className="col"> </div>
                    </div>
                  </FormGroup>
                  {/* ///////////////// Customer Details ///////////////// */}
                  {/* ///////////////// Complaints & Symptoms ///////////////// */}
                  {/* <Divider /> */}
                  <div className="row" style={{ backgroundColor: "#ffff" }}>
                    <div className="col">
                      <div className="tab_heading show_hide">
                        Complaints & Symptoms :
                      </div>
                    </div>
                    <div className="col">
                      <div className="add_btn">
                        {" "}
                        <IconButton
                          disabled={true}
                          color="secondary"
                          aria-label="add an alarm"
                        >
                          <AddCircleRoundedIcon style={{ color: "#0b9444" }} />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                  <div className="block-example border-bottom border-primary"></div>
                  <div style={{ marginTop: "16px" }}></div>
                  <div className="row">
                    <div className="col-6">
                      <FormGroup
                        style={{
                          paddingLeft: "6px",
                          paddingRight: "6px",
                        }}
                      >
                        <InputGroup>
                          <Input
                            type="text"
                            name="symptoms"
                            disabled
                            className="show_hide"
                            id="symptoms"
                            placeholder="Symptoms"
                            style={{ fontSize: "12px" }}
                          />
                          <Input
                            type="text"
                            name="duration"
                            disabled
                            className="show_hide"
                            id="duration"
                            placeholder="Duration"
                            style={{ fontSize: "12px" }}
                          />
                          <InputGroupAddon addonType="append">
                            <IconButton
                              disabled={true}
                              size="small"
                              color="secondary"
                              aria-label="add an alarm"
                            >
                              <RemoveCircleOutlineIcon
                                style={{ color: "red" }}
                              />
                            </IconButton>
                          </InputGroupAddon>
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </div>
                  {/* ///////////////// Complaints & Symptoms ///////////////// */}
                  {/* <div style={{ marginTop: "16px" }}></div> */}
                  {/* ///////////////// PROVISIONAL DIAGNOSIS ///////////////// */}
                  {/* <Divider /> */}
                  <div className="row" style={{ backgroundColor: "#ffff" }}>
                    <div className="col">
                      <div className="tab_heading show_hide">
                        Provisional Diagnosis :
                      </div>
                    </div>
                    <div className="col">
                      <div className="add_btn">
                        {" "}
                        <IconButton
                          disabled={true}
                          color="secondary"
                          aria-label="add an alarm"
                        >
                          <AddCircleRoundedIcon style={{ color: "#0b9444" }} />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                  <div className="block-example border-bottom border-primary"></div>
                  <div style={{ marginTop: "16px" }}></div>
                  <div className="row">
                    <div className="col-6">
                      <FormGroup
                        style={{
                          paddingLeft: "6px",
                          paddingRight: "6px",
                        }}
                      >
                        <InputGroup>
                          <Input
                            type="text"
                            name="add_PD"
                            disabled
                            id="addPD"
                            className="show_hide"
                            placeholder="Diagnosis"
                            style={{ fontSize: "12px" }}
                          />
                          <InputGroupAddon addonType="append">
                            <IconButton
                              disabled={true}
                              size="small"
                              color="secondary"
                              aria-label="add an alarm"
                            >
                              <RemoveCircleOutlineIcon
                                style={{ color: "red" }}
                              />
                            </IconButton>
                          </InputGroupAddon>
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </div>
                  {/* ///////////////// PROVISIONAL DIAGNOSIS ///////////////// */}

                  {/* ///////////////// PRESCRIPTION ///////////////// */}
                  {/* <Divider /> */}
                  <div className="row" style={{ backgroundColor: "#ffff" }}>
                    <div className="col">
                      <div className="tab_heading show_hide">
                        Prescription :
                      </div>
                    </div>
                    <div className="col">
                      <div className="add_btn">
                        {" "}
                        <IconButton
                          disabled={true}
                          color="secondary"
                          aria-label="add an alarm"
                        >
                          <AddCircleRoundedIcon style={{ color: "#0b9444" }} />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                  <div className="block-example border-bottom border-primary"></div>
                  <div style={{ marginTop: "16px" }}></div>
                  <FormGroup
                    style={{
                      paddingLeft: "6px",
                      paddingRight: "6px",
                    }}
                  >
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th></th>
                          <th
                            className="show_hide"
                            style={{ fontSize: "12px" }}
                          >
                            S.No
                          </th>
                          <th
                            className="show_hide"
                            style={{ fontSize: "12px" }}
                          >
                            Medicine
                          </th>
                          <th
                            className="show_hide"
                            style={{ fontSize: "12px" }}
                          >
                            Dosage
                          </th>
                          <th
                            className="show_hide"
                            style={{ fontSize: "12px" }}
                          >
                            Route
                          </th>
                          <th
                            className="show_hide"
                            style={{ fontSize: "12px" }}
                          >
                            Frequency
                          </th>
                          <th
                            className="show_hide"
                            style={{ fontSize: "12px" }}
                          >
                            Duration
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="select">
                            <IconButton
                              disabled={true}
                              style={{ marginTop: "-10px", width: "10px" }}
                              size="small"
                              color="secondary"
                              aria-label="add an alarm"
                            >
                              <RemoveCircleOutlineIcon
                                style={{ color: "red" }}
                              />
                            </IconButton>
                          </th>
                          <th
                            className="show_hide"
                            scope="row"
                            style={{ fontSize: "10px" }}
                          >
                            0
                          </th>
                          <td>
                            <Input
                              type="text"
                              disabled
                              name="description"
                              id="description"
                              className="show_hide"
                              placeholder="Medicine"
                              style={{ fontSize: "10px" }}
                            />
                          </td>
                          <td>
                            <Input
                              type="text"
                              name="dosage"
                              disabled
                              className="show_hide"
                              id="dosage"
                              placeholder="Dosage"
                              style={{ fontSize: "10px" }}
                            />
                          </td>
                          <td>
                            <Input
                              type="text"
                              name="Route"
                              disabled
                              className="show_hide"
                              id="Route"
                              style={{ fontSize: "10px" }}
                              placeholder="Route"
                            />
                          </td>
                          <td>
                            <Input
                              type="text"
                              name="Frequency"
                              disabled
                              className="show_hide"
                              id="Frequency"
                              style={{ fontSize: "10px" }}
                              placeholder="Frequency"
                            />
                          </td>
                          <td>
                            <Input
                              type="text"
                              name="Duration"
                              disabled
                              className="show_hide"
                              id="Duration"
                              style={{ fontSize: "10px" }}
                              placeholder="Duration"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </FormGroup>
                  <div style={{ marginTop: "10px" }}></div>
                  {/* ///////////////// PRESCRIPTION ///////////////// */}

                  {/* //////////////////// LAB TESTS ///////////////// */}
                  {/* <Divider /> */}
                  <div className="row" style={{ backgroundColor: "#ffff" }}>
                    <div className="col">
                      <div className="tab_heading show_hide">Lab Tests :</div>
                    </div>
                    <div className="col">
                      <div className="add_btn">
                        {" "}
                        <IconButton
                          disabled={true}
                          color="secondary"
                          aria-label="add an alarm"
                        >
                          <AddCircleRoundedIcon style={{ color: "#0b9444" }} />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                  <div className="block-example border-bottom border-primary"></div>
                  <div style={{ marginTop: "16px" }}></div>
                  <div className="row">
                    <div className="col-6">
                      <FormGroup
                        style={{
                          paddingLeft: "6px",
                          paddingRight: "6px",
                        }}
                      >
                        <InputGroup>
                          <Input
                            disabled
                            type="text"
                            className="show_hide"
                            name="labtest"
                            id="labtest"
                            placeholder={"Test # 1"}
                            style={{ width: "250px", fontSize: "12px" }}
                          />
                          <InputGroupAddon addonType="append">
                            <IconButton
                              disabled={true}
                              size="small"
                              color="secondary"
                              aria-label="add an alarm"
                            >
                              <RemoveCircleOutlineIcon
                                style={{ color: "red" }}
                              />
                            </IconButton>
                          </InputGroupAddon>
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </div>
                  {/* //////////////////// LAB TESTS ///////////////// */}
                  {/* //////////////////////////// Follow Up ////////////////// */}
                  {/* <Divider /> */}
                  <div className="tab_heading show_hide">Follow up :</div>
                  <div className="block-example border-bottom border-primary"></div>
                  <div style={{ marginTop: "16px" }}></div>
                  <FormGroup
                    style={{
                      paddingLeft: "6px",
                      paddingRight: "6px",
                    }}
                  >
                    <div>
                      <TextField
                        disabled
                        id="outlined-multiline-static"
                        label="Follow up"
                        className="show_hide"
                        multiline
                        rows="4"
                        variant="outlined"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </FormGroup>
                  {/* //////////////////////////// Follow Up ////////////////// */}

                  {/* /////////////////////// DISCLAIMER ///////////////////// */}
                  <div
                    className="block-example border border-primary"
                    style={{ width: "96%", padding: "10px", margin: "10px" }}
                  >
                    <div
                      className="show_hide"
                      style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "#0d74bc",
                      }}
                    >
                      Disclaimer
                    </div>
                    <div style={{ padding: "10px" }}>
                      <div
                        className="show_hide"
                        style={{ fontSize: "12px", color: "#0d74bc" }}
                      >
                        1.&nbsp;&nbsp;&nbsp;&nbsp; Prescription is Not Valid For
                        Court{" "}
                      </div>
                      <div
                        className="show_hide"
                        style={{ fontSize: "12px", color: "#0d74bc" }}
                      >
                        2.&nbsp;&nbsp;&nbsp;&nbsp; Treatment/Prescription is
                        only applicable for non-emergency medical cases{" "}
                      </div>
                      <div
                        className="show_hide"
                        style={{ fontSize: "12px", color: "#0d74bc" }}
                      >
                        3.&nbsp;&nbsp;&nbsp;&nbsp; This is Second Opinion
                        service. It does not replace your primary care Doctor.
                      </div>
                    </div>
                  </div>
                  {/* /////////////////////// DISCLAIMER ///////////////////// */}

                  {/* ////////////////////// SUBMIT ////////////////////// */}
                  <div className="submit_btn">
                    <Button
                      disabled
                      variant="contained"
                      className="show_hide"
                      color="primary"
                      startIcon={<CloudUploadIcon />}
                    >
                      Upload EHR
                    </Button>
                  </div>
                  {/* ////////////////////// SUBMIT ////////////////////// */}
                </Form>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };
  _logout = () => {
    this.setState({
      logout_show: true,
    });
  };
  logoutModal = () => {
    const key = "conn";
    if (this.state.logout_show) {
      return (
        <Modal
          centered={true}
          backdrop={true}
          show={this.state.logout_show}
          className={"modal"}
          backdropClassName={"backdrop"}
        >
          <Modal.Header>Confirmation</Modal.Header>
          <Modal.Body>Do you want to Logout?</Modal.Body>
          <Modal.Footer>
            <Button
              color="primary"
              variant="contained"
              onClick={() => {
                this.setState(
                  {
                    logout_show: false,
                  },
                  () => {
                    message.loading({
                      content: "Logging Out",
                      key,
                      duration: 0.3,
                    });
                    setTimeout(() => {
                      localStorage.clear();
                      Store.dispatch(rmAuth(""));
                    }, 100);
                    // this.props.history.push("/TakafulPanel/Login");
                    console.log("LOGOUT", this.props);
                  }
                );
              }}
            >
              Yes
            </Button>
            <div style={{ marginRight: "10px" }} />
            <Button
              color="secondary"
              variant="contained"
              onClick={() =>
                this.setState({
                  logout_show: false,
                })
              }
            >
              No
            </Button>
          </Modal.Footer>
        </Modal>
      );
    }
  };
  render() {
    const { availability } = this.state;

    return (
      <div>
        {/* {this.state.newRequest_check
          ? this.state.newRequest_array.map((val) =>
              this.openNotification(val.key)
            )
          : null} */}
        {this.logoutModal()}
        {this.closeChatModal()}
        <div className="logout_container">
          <div className="logout_sub">
            <div className="row">
              <div className="col">
                <img
                  src={logout}
                  alt=""
                  style={{
                    width: "40px",
                    height: "40px",
                  }}
                />
              </div>{" "}
              <div className="col logout_Text" onClick={this._logout}>
                Logout
              </div>
            </div>
          </div>
        </div>
        {/* /////////////////////// NavBar ///////////////////// */}
        {/* <Navbar color="dark" dark expand="sm">
          <NavbarBrand href="/">Takaful Pakistan</NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={isOpen} navbar>
            <Nav className="mr-auto" navbar>
              <NavItem>
                <NavLink href="/">Dashboard</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="/">History</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="/">Logout</NavLink>
              </NavItem>
              <NavItem></NavItem>
              <Dropdown>
                <Dropdown.Toggle
                  split
                  variant={availability === "Available" ? "success" : "danger"}
                >
                  {availability === "Available" ? (
                    <span style={{ color: "#fff" }}>Available </span>
                  ) : (
                      <span style={{ color: "#fff" }}> Away</span>
                    )}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => this.changeStatus("Available")}>
                    Available
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => this.changeStatus("Away")}>
                    Away
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
            <NavbarText>
              Powered by :{" "}
              <a style={{ color: "red" }} href="https://avolox.com/">
                {" "}
                Avolox
              </a>
            </NavbarText>
          </Collapse>
        </Navbar> */}
        {/* /////////////////////// NavBar ///////////////////// */}

        {/* /////////////////////// Cards ///////////////////// */}
        {/* <Container> */}
        {/* <div
          className="container-fluid"
          style={{
            alignItems: "center",
            paddingTop: "10px",
            paddingBottom: "10px"
          }}
        >
          <div className="row">
            <div className="col-4">
              <Card
                className="cardBox"
                border="info"
                bg="info"
                text="white"
                // style={{ width: "20rem" }}
              >
                <Card.Body>
                  <Card.Title>120</Card.Title>
                  <Card.Text>Total Chats Sessions</Card.Text>
                </Card.Body>
              </Card>
            </div>
            <div className="col-4">
              <Card
                className="cardBox"
                border="success"
                bg="success"
                text="white"
                // style={{ width: "20rem" }}
              >
                <Card.Body>
                  <Card.Title>100</Card.Title>
                  <Card.Text>Chats Request Accepted</Card.Text>
                </Card.Body>
              </Card>
            </div>
            <div className="col-4">
              <Card
                className="cardBox"
                border="danger"
                bg="danger"
                text="white"
                // style={{ width: "20rem" }}
              >
                <Card.Body>
                  <Card.Title>20</Card.Title>
                  <Card.Text>Chats Request Rejected</Card.Text>
                </Card.Body>
              </Card>
            </div>
          </div>
        </div> */}
        {/* </Container> */}
        {/* /////////////////////// Cards ///////////////////// */}

        <div
          // className="chatBox"
          style={{
            borderRadius: "10px",
            padding: "10px",
            marginLeft: "10px",
            marginRight: "10px",
            // marginBottom: '10px'
          }}
        >
          {/* <div className="row"> */}
          {/* /////////////////////// Chat Area ///////////////////// */}
          {/* <Col style={{ minHeight: 200 }} className="col-6"> */}
          {/* {this.drawChatTabs()} */}
          <div className="row">
            {" "}
            <div className="col-3">
              <div
                id="style-1"
                className="chatBox"
                style={{
                  // width: "300px",
                  backgroundColor: "#ffff",
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  // overflow: "scroll"
                }}
              >
                {/* ////////////////////// Header ///////////////////////// */}
                <div className="row">
                  <div className="col-6 chat_box_header">
                    <span className="leftText" style={{ paddingLeft: "10px" }}>
                      Total Chats - {this.props.tickets.length}
                    </span>
                  </div>
                  <div className="col-6">
                    <span className="rightText">
                      <Button
                        variant="outlined"
                        color="primary"
                        className="avail_btn"
                        size="small"
                        style={{ fontSize: "14px" }}
                        onClick={() => this.changeStatus()}
                        startIcon={
                          <FiberManualRecordIcon
                            style={{
                              color:
                                availability === "Available" ? "green" : "red",
                            }}
                          />
                        }
                      >
                        <div
                          className="availability"
                          style={{
                            color:
                              availability === "Available" ? "green" : "red",
                          }}
                        >
                          {" "}
                          {availability === "Available" ? "Available" : "Away"}
                        </div>
                      </Button>
                      {/* <Dropdown>
                        <Dropdown.Toggle
                          split
                          variant={
                            availability === "Available" ? "success" : "danger"
                          }
                        >
                          {availability === "Available" ? (
                            <span style={{ color: "#fff" }}>Available </span>
                          ) : (
                            <span style={{ color: "#fff" }}> Away</span>
                          )}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={() => this.changeStatus("Available")}
                          >
                            Available
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => this.changeStatus("Away")}
                          >
                            Away
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown> */}
                    </span>
                  </div>
                </div>
                {/* <div className="bottom_Width" /> */}
                {/* ////////////////////// Header ///////////////////////// */}
                {this.props.tickets
                  .map((ticket, index) => (
                    <StyleRoot>
                      <div style={styles.bounce}>
                        <Ripples
                          className="chat_Tabs_Back"
                          color="#0d74bc"
                          during={1500}
                          onClick={() =>
                            this.setState(
                              {
                                select_ticket: ticket.id,
                                selected_id: index,
                              },
                              () => {
                                // this.send_TO_CI();
                              }
                            )
                          }
                        >
                          <div
                            className="chat_Tabs "
                            style={{
                              backgroundColor:
                                this.state.select_ticket !== ""
                                  ? this.state.select_ticket === ticket.id
                                    ? "#f6f6f8"
                                    : "#ffff"
                                  : this.props.tickets[0].id === ticket.id
                                  ? "#f6f6f8"
                                  : "#ffff",
                              // color:
                              //   this.state.select_ticket !== ""
                              //     ? this.state.select_ticket === ticket.id
                              //       ? "#0196ff"
                              //       : null
                              //     : this.props.tickets[0].id === ticket.id
                              //     ? "#0196ff"
                              //     : null
                            }}
                          >
                            <div className="col">
                              <div className="p_name">
                                {ticket.patient.username}
                              </div>
                              <div className="p_hid">
                                Ticket Id : {ticket.id}
                              </div>
                              <div className="p_policy">Policy # 1111221</div>
                            </div>
                          </div>
                        </Ripples>

                        {/* <Divider light={true} /> */}
                      </div>
                    </StyleRoot>
                  ))
                  .reverse()}
              </div>
            </div>
            {this.send_TO_CI()}
          </div>
        </div>
        <div className="footer">
          Powered By :{" "}
          <a
            className="logo_name"
            // style={{ color: "red", fontWeight: "bold", fontFamily: "Segoe UI" }}
            href="https://avolox.com/"
          >
            {" "}
            Avolox{" "}
          </a>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  var auth = state.AuthReducer.auth;
  var connection = state.LiveChatReducer.connection;
  var tickets = state.LiveChatReducer.tickets;
  var message = state.LiveChatReducer.message;
  var ticketId = state.LiveChatReducer.ticketId;
  var call = state.LiveChatReducer.call;
  var modal = state.LiveChatReducer.modal;
  var accept = state.LiveChatReducer.accept;
  var reject = state.LiveChatReducer.reject;
  var time = state.LiveChatReducer.time;
  var msg = state.LiveChatReducer.msg;
  var close = state.LiveChatReducer.close;
  return {
    auth,
    connection,
    tickets,
    message,
    ticketId,
    call,
    modal,
    accept,
    reject,
    time,
    msg,
    close,
  };
};
const mapDispatchToProps = {
  onConnect,
  updateTickets,
  msgReq,
  modalShow,
  acceptBySome,
  closeTicket,
  closeChat,
  timeExceed,
  timeModal,
};

const Dash = connect(mapStateToProps, mapDispatchToProps)(dashboard);
export default withRouter(Dash);
