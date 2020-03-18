import React from "react";

import { setAuth } from "../store/actions/auth";
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
  newMessage,
  ticketID,
  callAlert,
  newCallNotification,
  newCallMsg,
  ermModal
} from "../store/actions/livechat";
import add from "../assets/add.png";
import ChatInstance from "./components/ChatInstance";
import Store from "../store/store";
import TabBar from "./components/TabBar";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  NavbarText,
  Form,
  FormGroup,
  Label,
  Input,
  FormText,
  Table,
  InputGroup,
  InputGroupText,
  InputGroupAddon
} from "reactstrap";
import Ripples, { createRipples } from "react-ripples";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import { Tabs, Layout, Upload, Icon, notification, Col, Row } from "antd";
import { connect } from "react-redux";
import { Card, Dropdown, Container, Modal } from "react-bootstrap";
import axios from "axios";
const signalR = require("@aspnet/signalr");
const { TextArea } = Input;
const { TabPane } = Tabs;

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
      select_ticket: []
    };
    this.url =
      "https://nf1f8200-a.akamaihd.net/downloads/ringtones/files/mp3/iphone-6-original-ringtone-24163.mp3";
    this.audio = new Audio(this.url);
    this.msgAudio = new Audio(this.state.msgURL);
  }
  componentDidMount() {
    this.connectWithLiveChatHub();
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
  //////////////////////////////////////// CONNECTION WITH HUB //////////////////////////////////////////////////
  connectWithLiveChatHub = () => {
    let connection = new signalR.HubConnectionBuilder()
      .withUrl(window.API_URL + "livechat", {
        accessTokenFactory: () => {
          return this.props.auth.token;
        }
      })
      .build();

    connection.on("exception", exception => {
      console.log("connectWithLiveChatHub exception", exception);
    });

    connection.on("NewRequest", event => {
      console.log("NewRequest ==== ", event);
      this.setState({
        newRequest_check: true
      });
      this.setState(
        prevState => ({
          newRequest_array: [...prevState.newRequest_array, { key: event }]
        }),
        () => {
          console.log("newRequest_array ======= ", this.state.newRequest_array);
        }
      );
    });
    connection.on("AcceptedBySomeDoctor", event => {
      console.log("AcceptedBySomeDoctor --- ", event);

      this.setState(
        {
          newRequest_array: this.state.newRequest_array.filter(
            (item, index) => {
              return item.key !== JSON.stringify(event);
            }
          )
        },
        () => {
          console.log(
            "AcceptedBySomeDoctor AcceptedBySomeDoctor +_++++ ",
            this.state.newRequest_array
          );
        }
      );
    });
    connection.on("OnTimeExceed", event => {
      console.log("OnTimeExceed ------ ----- ", JSON.stringify(event));
      // notification.close(event);
      this.setState({
        newRequest_array: this.state.newRequest_array.filter((item, index) => {
          return item.key !== JSON.stringify(event);
        })
      });
      this.setState(
        prevState => ({
          timeExceed_array: [...prevState.timeExceed_array, { key: event }]
        }),
        () => {
          console.log("timeExceed_array ======= ", this.state.timeExceed_array);
        }
      );
    });
    connection.on("newWindow", event => {
      this.setState({
        newRequest_check: false
      });
      this.setState(
        {
          newRequest_array: this.state.newRequest_array.filter(
            (item, index) => {
              return item.key !== JSON.stringify(event);
            }
          )
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
      console.log("TIckets === ", tickets);
      this.props.updateTickets(tickets);
    });
    connection.on("OnCloseWindow", () => {
      console.log("OnCloseWindow ");
      // this.props.closeChat(false);
      var tickets = [...this.props.tickets];
      this.props.updateTickets(tickets);
      this.props.closeTicket(false);
    });

    connection.start().then(() => {
      console.log("Connection Established");
      this.props.onConnect(connection);
    });
  };
  //////////////////////////////////////// CONNECTION WITH HUB //////////////////////////////////////////////////
  addNewMessageToTicket = message => {
    var ticketNumber = message.ticketID;

    var tickets = [...this.props.tickets];

    var ticket = tickets.find(x => x.id === ticketNumber);

    if (ticket) {
      // console.log(message.ticket.id, '===', tickets);

      ticket.messages.push(message);

      this.props.updateTickets(tickets);
    }
  };

  handleModeChange = e => {
    const mode = e.target.value;
    this.setState({ mode });
  };

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  };
  changeStatus = val => {
    if (val === "Available") {
      if (this.props.connection) {
        this.props.connection
          .invoke("setAvailability", val)
          .then(r => {
            console.log("r", r);
          })
          .catch(e => {
            console.log("e", e);
          });
      }
      console.log("Value is Available");
    }
    this.setState({
      availability: val
    });
  };
  handlePatientName = event => {
    if (event.target.value !== "") {
      this.setState(
        {
          patientName: event.target.value,
          error_PatientName: ""
        },
        () => {
          console.log("Patient Name === ", this.state.patientName);
        }
      );
    } else {
      this.setState({
        error_PatientName: "Enter Patient Name"
      });
    }
  };

  handleAge = event => {
    console.log("EVENT AGE ==", event.target.value);
    if (event.target.value > 0 && event.target.value < 99) {
      console.log("Age -- ", event.target.value);
      this.setState({
        Age: event.target.value,
        errorAge: ""
      });
    } else {
      // document.getElementById("age").style.borderColor = "red";
      this.setState({
        Age: "",
        errorAge: "Age Must be Greater Than 0 and Less than 99"
      });
    }
  };
  ///////////////////////////// Disease ///////////////////////////////////////////
  addTreatment = event => {
    console.log("ADD_____", this.state.treatment_arr.length);
    this.setState(prevState => ({
      treatment_arr: [
        ...prevState.treatment_arr,
        { treatment: "", key: this.state.treatment_arr.length }
      ]
    }));
  };
  deleteTreatment = event => {
    console.log("DELETE Disease INDEX ", event);
    this.setState(
      {
        treatment_arr: this.state.treatment_arr.filter((item, index) => {
          return index !== event;
        })
      },
      () => {
        console.log("DISEASE ARRAY +_++++ ", this.state.treatment_arr);
      }
    );
    // this.state.treatment_arr.splice(this.state.treatment_arr.length, 0);
  };
  Treatment_arr = (event, key) => {
    console.log("Treatment_arr Name ---- ", event, " at Index ", key);
    this.state.treatment_arr[key].treatment = event;
    var temp = this.state.treatment_arr;
    console.log("Treatment_arr  ", temp);
    this.state.treatment_arr.filter((item, index) => {
      if (index === key) {
        this.setState(prevState => ({
          treatment_arr: temp
        }));
      }
    });
  };
  ////////////////////////////////////// Disease //////////////////////////////////////////

  ////////////////////////// Complaints & Symptoms /////////////////////////////////////////
  add_complaints = event => {
    console.log("add_complaints _____", this.state.complaints_symptoms.length);
    this.setState(prevState => ({
      complaints_symptoms: [
        ...prevState.complaints_symptoms,
        {
          symptoms: "",
          duration: "",
          key: this.state.complaints_symptoms.length
        }
      ]
    }));
  };
  delete_complaints = event => {
    console.log("DELETE complaints_symptoms INDEX ", event);
    this.setState(
      {
        complaints_symptoms: this.state.complaints_symptoms.filter(
          (item, index) => {
            return index !== event;
          }
        )
      },
      () => {
        console.log("DISEASE ARRAY +_++++ ", this.state.complaints_symptoms);
      }
    );
    // this.state.treatment_arr.splice(this.state.treatment_arr.length, 0);
  };
  complaints_add_array = (event, key) => {
    console.log("complaints_symptoms Name ---- ", event, " at Index ", key);
    this.state.complaints_symptoms[key].symptoms = event;
    var temp = this.state.complaints_symptoms;
    console.log("complaints_symptoms 1 ", temp);
    this.state.complaints_symptoms.filter((item, index) => {
      if (index === key) {
        this.setState(prevState => ({
          complaints_symptoms: temp
        }));
      }
    });
  };
  complaints_add_array1 = (event, key) => {
    console.log("complaints_symptoms Name ---- ", event, " at Index ", key);
    this.state.complaints_symptoms[key].duration = event;
    var temp = this.state.complaints_symptoms;
    console.log("complaints_symptoms 2 ", temp);
    this.state.complaints_symptoms.filter((item, index) => {
      if (index === key) {
        this.setState(prevState => ({
          complaints_symptoms: temp
        }));
      }
    });
  };

  ////////////////////////// Complaints & Symptoms /////////////////////////////////////////

  ////////////////////////// Lab Tests /////////////////////////////////////////
  add_lab_test = event => {
    console.log("add_complaints _____", this.state.lab_tests.length);
    this.setState(prevState => ({
      lab_tests: [
        ...prevState.lab_tests,
        {
          test: "",
          key: this.state.lab_tests.length
        }
      ]
    }));
  };
  delete_lab_test = event => {
    console.log("DELETE lab_tests INDEX ", event);
    this.setState(
      {
        lab_tests: this.state.lab_tests.filter((item, index) => {
          return index !== event;
        })
      },
      () => {
        console.log("DISEASE ARRAY +_++++ ", this.state.lab_tests);
      }
    );
    // this.state.treatment_arr.splice(this.state.treatment_arr.length, 0);
  };
  tests_add_array = (event, key) => {
    console.log("lab_tests Name ---- ", event, " at Index ", key);
    this.state.lab_tests[key].test = event;
    var temp = this.state.lab_tests;
    console.log("lab_tests  ", temp);
    this.state.lab_tests.filter((item, index) => {
      if (index === key) {
        this.setState(prevState => ({
          lab_tests: temp
        }));
      }
    });
  };

  ////////////////////////// Lab Tests /////////////////////////////////////////

  addPrescriptionRow = () => {
    console.log("addPrescriptionRow === ", this.state.add_Prescription.length);
    this.setState(prevState => ({
      add_Prescription: [
        ...prevState.add_Prescription,
        {
          sr: this.state.add_Prescription.length,
          description: "",
          dosage: "",
          period: "",
          dosageForm: "",
          comment: "",
          interval: "",
          intervalUOM: ""
        }
      ]
    }));
  };
  add_description = (event, key) => {
    console.log("add_description ---- ", event, " at Index ", key);
    this.state.add_Prescription[key].description = event;
    var temp = this.state.add_Prescription;
    this.state.add_Prescription.filter((item, index) => {
      if (index === key) {
        this.setState(
          {
            add_Prescription: temp
          },
          () => {
            console.log(
              "Add Prescription After add_description == ",
              this.state.add_Prescription
            );
          }
        );
      }
    });
  };
  add_dosage = (event, key) => {
    console.log("add_dosage ---- ", event, " at Index ", key);
    this.state.add_Prescription[key].dosage = event;
    var temp = this.state.add_Prescription;
    this.state.add_Prescription.filter((item, index) => {
      if (index === key) {
        this.setState(
          {
            add_Prescription: temp
          },
          () => {
            console.log(
              "Add Prescription After add_dosage == ",
              this.state.add_Prescription
            );
          }
        );
      }
    });
  };
  add_period = (event, key) => {
    console.log("add_period ---- ", event, " at Index ", key);
    this.state.add_Prescription[key].period = event;
    var temp = this.state.add_Prescription;
    this.state.add_Prescription.filter((item, index) => {
      if (index === key) {
        this.setState(
          {
            add_Prescription: temp
          },
          () => {
            console.log(
              "Add Prescription After add_period == ",
              this.state.add_Prescription
            );
          }
        );
      }
    });
  };
  add_dosageForm = (event, key) => {
    console.log("add_dosageForm ---- ", event, " at Index ", key);
    this.state.add_Prescription[key].dosageForm = event;
    var temp = this.state.add_Prescription;
    this.state.add_Prescription.filter((item, index) => {
      if (index === key) {
        this.setState(
          {
            add_Prescription: temp
          },
          () => {
            console.log(
              "Add Prescription After add_dosageForm == ",
              this.state.add_Prescription
            );
          }
        );
      }
    });
  };
  add_comment = (event, key) => {
    console.log("add_comment ---- ", event, " at Index ", key);
    this.state.add_Prescription[key].comment = event;
    var temp = this.state.add_Prescription;
    this.state.add_Prescription.filter((item, index) => {
      if (index === key) {
        this.setState(
          {
            add_Prescription: temp
          },
          () => {
            console.log(
              "Add Prescription After add_comment == ",
              this.state.add_Prescription
            );
          }
        );
      }
    });
  };
  add_interval = (event, key) => {
    console.log("add_interval ---- ", event, " at Index ", key);
    this.state.add_Prescription[key].interval = event;
    var temp = this.state.add_Prescription;
    this.state.add_Prescription.filter((item, index) => {
      if (index === key) {
        this.setState(
          {
            add_Prescription: temp
          },
          () => {
            console.log(
              "Add Prescription After add_interval == ",
              this.state.add_Prescription
            );
          }
        );
      }
    });
  };
  add_intervalUOM = (event, key) => {
    console.log("add_intervalUOM ---- ", event, " at Index ", key);
    this.state.add_Prescription[key].intervalUOM = event;
    var temp = this.state.add_Prescription;
    this.state.add_Prescription.filter((item, index) => {
      if (index === key) {
        this.setState(
          {
            add_Prescription: temp
          },
          () => {
            console.log(
              "Add Prescription After add_intervalUOM == ",
              this.state.add_Prescription
            );
          }
        );
      }
    });
  };
  delete_Prescription = index => {
    console.log("Delete Prescription Index ==== ", index);
    this.setState(
      {
        delete_Prescription_key: index
      },
      () => {
        console.log(
          "Delete Prescription KEY ======== ",
          this.state.delete_Prescription_key
        );
      }
    );
  };
  delete_Prescription_Row = () => {
    this.setState(
      {
        add_Prescription: this.state.add_Prescription.filter((item, index) => {
          return index !== this.state.delete_Prescription_key;
        })
      },
      () => {
        console.log(
          "delete_Prescription_Row ARRAY +_++++ ",
          this.state.add_Prescription
        );
      }
    );
  };
  handleform1next = () => {
    if (this.state.form1) {
      this.setState({
        form1: false,
        form2: true
      });
    }
  };
  handleform2back = () => {
    if (this.state.form2) {
      this.setState({
        form2: false,
        form1: true
      });
    }
  };
  handleform2next = () => {
    if (this.state.form2) {
      this.setState({
        form2: false,
        form3: true
      });
    }
  };
  handleform3back = () => {
    if (this.state.form3) {
      this.setState({
        form3: false,
        form2: true
      });
    }
  };
  handleform3next = () => {
    if (this.state.form2) {
      this.setState({
        form2: false,
        form3: true
      });
    }
  };
  state = {
    value: 1
  };

  onConsultationChange = e => {
    if (this.state.consultation === e) {
      this.setState({
        consultation: ""
      });
    } else {
      console.log("consultation checked", e.target.value);
      this.setState({
        consultation: e.target.value
      });
    }
  };
  onLaboratoryChange = e => {
    if (this.state.laboratory === e) {
      this.setState({
        laboratory: ""
      });
    } else {
      console.log("laboratory checked", e.target.value);
      this.setState({
        laboratory: e.target.value
      });
    }
  };
  onMastersChange = e => {
    if (this.state.masters === e) {
      this.setState({
        masters: ""
      });
    } else {
      console.log("laboratory checked", e.target.value);
      this.setState({
        masters: e.target.value
      });
    }
  };
  onSettingsChange = e => {
    if (this.state.settings === e) {
      this.setState({
        settings: ""
      });
    } else {
      console.log("settings checked", e.target.value);
      this.setState({
        settings: e.target.value
      });
    }
  };
  // DrawChats = () => {
  //   if (this.props.tickets.length > 0) {
  //     return (
  //       <div className="row">
  //         <div className="col-3">
  //           <div
  //             id="style-1"
  //             className="chatBox"
  //             style={{
  //               width: "300px",
  //               backgroundColor: "#fafafa",
  //               paddingTop: "10px",
  //               paddingBottom: "10px"
  //             }}
  //           >
  //             {/* ////////////////////// Header ///////////////////////// */}
  //             <div className="row">
  //               <div className="col-6">
  //                 <span className="leftText" style={{ paddingLeft: "10px" }}>
  //                   Chats
  //                 </span>
  //               </div>
  //             </div>
  //             <div className="bottom_Width" />
  //             {/* ////////////////////// Header ///////////////////////// */}

  //             <Ripples color="#0d74bc" during={1500}>
  //               <div
  //                 className="chat_Tabs"
  //                 onClick={() =>
  //                   this.setState(
  //                     {
  //                       selected_id: ticket.id
  //                     },
  //                     () => {
  //                       console.log("Tickets id --- ", this.state.selected_id);
  //                     }
  //                   )
  //                 }
  //               >
  //                 {ticket.patient.username} - {ticket.id}
  //               </div>
  //             </Ripples>
  //             <Divider light={true} />
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   }
  // };

  //////////////////////////////////////// DRAW DYNAMIC CHAT TABS //////////////////////////////////////////////////
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
            borderColor: "#fff"
          }}
        >
          {this.props.tickets
            .map((ticket, index) => {
              console.log("ticket new", this.props.tickets);

              var name = (
                <div id="style-1" className="chatTab">
                  {this.props.call === "UpComming Call" &&
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
  openNotification = key => {
    console.log("Modal State on Notification ---- --- ", key);
    const close = () => {
      this.props.connection.invoke("OnReject", key).then(response => {
        console.log("Reject ID" + key + "REJECT RESPONSE ______ ", response);
        notification.close(key);
        this.setState({
          newRequest_check: false
        });

        if (this.props.modal) {
          this.props.modalShow(false);
        }
      });
    };

    const btn = (
      <Button
        type="primary"
        size="small"
        // onClick={() => notification.close(key)}
        onClick={() => {
          console.log("ON ACCEPT", key);
          this.props.connection.invoke("OnAccept", key).then(() => {
            console.log("Accept ID" + key + "Accept");
            notification.close(key);
            this.setState({
              newRequest_check: false
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
      message: "Message Request",
      description: `New Message Request From Patient ID - ${key}`,
      btn,
      key,
      onClose: close,
      duration: 2000
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
              on
              onClick={() => {
                this.props.closeChat(false);
                this.props.closeTicket(true);
              }}
            >
              Yes
            </Button>
            <Button color="danger" onClick={() => this.props.closeChat(false)}>
              No
            </Button>
          </Modal.Footer>
        </Modal>
      );
    }
  };
  send_TO_CI = () => {
    if (this.props.tickets.length > 0) {
      console.log('this.props.tickets Dashboard', this.props.tickets[this.state.selected_id])
      return (
        <ChatInstance
          connection={this.props.connection}
          ticket={this.props.tickets[this.state.selected_id]}
        />
      )
    }

  }
  render() {
    const { isOpen, availability } = this.state;
    return (
      <div>
        {this.state.newRequest_check
          ? this.state.newRequest_array.map(val =>
            this.openNotification(val.key)
          )
          : null}
        {this.closeChatModal()}
        {/* /////////////////////// NavBar ///////////////////// */}
        <Navbar color="dark" dark expand="sm">
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
        </Navbar>
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
          style={{ borderRadius: "10px", padding: "10px", margin: "10px" }}
        >
          {/* <div className="row"> */}
          {/* /////////////////////// Chat Area ///////////////////// */}
          {/* <Col style={{ minHeight: 200 }} className="col-6"> */}
          {/* {this.drawChatTabs()} */}
          <div className="row"> <div className="col-3">
            <div

              className="chatBox"
              style={{
                width: "300px",
                backgroundColor: "#fafafa",
                paddingTop: "10px",
                paddingBottom: "10px"
                // overflow: "scroll"
              }}
            >
              {/* ////////////////////// Header ///////////////////////// */}
              <div className="row">
                <div className="col-6 chat_box_header">
                  <span className="leftText" style={{ paddingLeft: "20px" }}>
                    Total Chats - {this.props.tickets.length}
                  </span>
                </div>
                <div className="col-5">
                  <span className="rightText">
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
                  </span>
                </div>
              </div>
              <div className="bottom_Width" />
              {/* ////////////////////// Header ///////////////////////// */}
              {this.props.tickets.map((ticket, index) => (
                <div key={index} >
                  <Ripples
                    color="#0d74bc"
                    during={1500}
                    onClick={() => this.setState({
                      select_ticket: ticket,
                      selected_id: index
                    }, () => {

                      console.log("Index --- ", index, this.state.select_ticket)
                      console.log("PROPS TICKET --- ", index, this.props.tickets[index])
                      this.forceUpdate()
                    })
                    }
                  >
                    <div
                      className="chat_Tabs"

                    >
                      {ticket.patient.username} -
                    {ticket.id}
                    </div>
                  </Ripples>
                  <Divider light={true} />
                </div>
              )).reverse()}
            </div>
          </div>
            {this.send_TO_CI()}
          </div>
          {/* <div className="container-fluid"> */}
          {/* {this.DrawChats()} */}
          {/* </div> */}
          {/* </Col> */}
          {/* /////////////////////// Chat Area ///////////////////// */}
          {/* </div>*/}
        </div>

        {/* <footer className="page-footer font-small blue">
          <div className="footer-copyright text-center py-3">
            Powered by :<a href="https://avolox.com/"> Avolox</a>
          </div>
        </footer> */}
      </div>
    );
  }
}

const mapStateToProps = state => {
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
    close
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
  timeModal
};

export default connect(mapStateToProps, mapDispatchToProps)(dashboard);
