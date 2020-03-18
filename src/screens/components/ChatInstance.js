import React from "react";
import { Row, Col, Alert } from "antd";
import { connect } from "react-redux";
import { Layout, Upload, message } from "antd";
import {
  Collapse,
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
// import { Button } from "reactstrap";
import Ripples, { createRipples } from "react-ripples";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import AddRoundedIcon from "@material-ui/icons/AddRounded";
import RemoveCircleOutlineIcon from "@material-ui/icons/RemoveCircleOutline";
import AddCircleRoundedIcon from "@material-ui/icons/AddCircleRounded";
import CancelIcon from "@material-ui/icons/Cancel";
import Tooltip from "@material-ui/core/Tooltip";
import VideocamIcon from "@material-ui/icons/Videocam";
import Divider from "@material-ui/core/Divider";
import TextField from "@material-ui/core/TextField";
import SendIcon from "@material-ui/icons/Send";
import Chip from "@material-ui/core/Chip";
import CloseIcon from "@material-ui/icons/Close";
import VideocamOffRoundedIcon from "@material-ui/icons/VideocamOffRounded";
import SpeakerNotesOffIcon from "@material-ui/icons/SpeakerNotesOff";
import "../../assets/css.css";
import axios from "axios";
import {
  newMessage,
  ticketID,
  callAlert,
  updateTickets,
  newCallNotification,
  newCallMsg,
  modalShow,
  closeChat,
  closeTicket,
  ermModal
} from "../../store/actions/livechat";
import { CloseButton } from "react-bootstrap";
const { TextArea } = Input;
const { Icon } = Layout;

class ChatInstance extends React.Component {
  localStream;
  localVideo = React.createRef();
  remoteVideo = React.createRef();
  recorder = React.createRef();
  lastMessage;

  constructor(props) {
    super(props);

    this.state = {
      textMessage: "",
      showRemoteVideo: false,
      file: [],
      isAudioConnected: false,
      videoState: false,
      peerConnection: null,
      play: false,
      pause: true,
      closeTicketID: "",
      disconnect: false,
      disconnect_TicketID: "",
      fileName: "",
      recordURL: "",
      patientName: "",
      error_PatientName: "",
      Age: "",
      Gender: "",
      error_Gender: "",
      errorAge: "",
      treatment_arr: [],
      complaints_symptoms: [],
      provisional_diagnosis: [],
      add_Prescription: [],
      lab_tests: [], data: []
    };
    // this.url = "http://streaming.tdiradio.com:8000/house.mp3";
    this.url =
      "https://nf1f8200-a.akamaihd.net/downloads/ringtones/files/mp3/iphone-6-original-ringtone-24163.mp3";
    this.audio = new Audio(this.url);
  }

  componentDidMount() {
    let ticket = this.props.ticket;
    let connection = this.props.connection;

    connection.on("message-" + ticket.id, message => {
      this.props.newMessage("New Message");
      this.props.ticketID(message.ticketID);

      ticket.messages.push(message);

      // console.log('textMessage', message);
      setTimeout(() => {
        this.props.newMessage("");
        this.props.ticketID("");
      }, 2000);

      this.forceUpdate();
    });

    connection.on("requestAudio-" + ticket.id, ticketId => {
      //  console.log('')
      // console.log('Audio Requested');
      ticket["AudioChatRequest"] = true;
      const hide = message.info(`Upcoming Call from Patient ID - ${ticket.id}`);
      setTimeout(hide, 2500);
      this.setState({
        play: true
      });
      console.log("REQUEST AUDIO");
      this.props.callAlert("UpComming Call");
      this.props.ticketID(ticket.id);
      this.props.newCallMsg(ticket.id);
      this.props.newCallNotification(true);
      // console.log("CALL NOTIFY requestAudio ", this.props.newCall);
      this.audio.play();
      // this.getStream();
      this.forceUpdate();
    });

    connection.on("onDeclineAudio-" + ticket.id, ticketId => {
      this.props.newCallNotification(false);
      this.audio.pause();
      if (this.state.isAudioConnected === true) {
        // this.state.peerConn.close()
        console.log("Call isAudioConnected finished ");
        this.setState({
          play: false
        });
        this.props.newCallMsg("");
        // this.props.newCallNotification(false);
        this.props.callAlert("");
        this.props.ticketID("");
        this.setState({ play: false, videoState: false });

        if (this.localStream)
          this.localStream.getTracks().map(stream => {
            return stream.stop();
          });
        this.props.ticket.AudioChatRequest = false;
        this.forceUpdate();
      }
      if (this.state.showRemoteVideo === true) {
        console.log("Audio decline showRemoteVideo false");
        // this.localVideo.current.
        this.props.callAlert("");
        this.props.ticketID("");
        this.audio.pause();
        this.setState({
          showRemoteVideo: false,
          play: false,
          videoState: false
        });
        if (this.localStream)
          this.localStream.getTracks().map(stream => {
            return stream.stop();
          });
        this.props.ticket.AudioChatRequest = false;
        this.forceUpdate();
      } else {
        this.props.newCallMsg("");
        if (this.props.newCall) {
          this.props.newCallNotification(false);
        }
        console.log("Call Declined by Client");
        this.props.callAlert("");
        this.props.ticketID("");
        this.setState({ play: false, videoState: false });
        this.audio.pause();
        this.props.ticket.AudioChatRequest = false;
        this.forceUpdate();
      }
    });

    connection.on("requestVideo-" + ticket.id, ticketId => {
      console.log("enable video");
      this.setState({
        showRemoteVideo: true
      });
    });

    connection.on("addIceCandidate-" + ticket.id, evt => {
      var descr = JSON.parse(evt);

      if (descr.type === "offer") {
        this.newPeerConnection();
        if (this.state.peerConn) {
          this.state.peerConn
            .setRemoteDescription(new RTCSessionDescription(descr))
            .then(() => {
              this.state.peerConn.createAnswer(
                sessionDescription =>
                  this.setLocalAndSendMessage(sessionDescription),
                this.defaultErrorCallback
              );
            });
        }

        // setTimeout(() => {
        //   console.log("After New");
        //   this.state.peerConn.setRemoteDescription(
        //     new RTCSessionDescription(descr)
        //   );
        //   this.state.peerConn.createAnswer(
        //     sessionDescription =>
        //       this.setLocalAndSendMessage(sessionDescription),
        //     this.defaultErrorCallback
        //   );
        // }, 1000);
        // this.state.peerConn.createOffer((sessionDescription) => this.setLocalAndSendMessage(sessionDescription), this.defaultErrorCallback);
      } else if (descr.type === "answer") {
        this.state.peerConn.setRemoteDescription(
          new RTCSessionDescription(descr)
        );
      } else if (descr.type === "candidate") {
        var candidate = new RTCIceCandidate({
          sdpMLineIndex: descr.sdpMLineIndex,
          sdpMid: descr.sdpMid,
          candidate: descr.candidate
        });
        this.state.peerConn
          .addIceCandidate(candidate)
          .then(() => {
            console.log("ADDED ICE CANDIDATE Successfully");
          })
          .catch(error => {
            console.log("ADDED ICE CANDIDATE error", error);
          });
        // }
        // this.state.peerConn
        //     .addIceCandidate(candidate)
        //     .catch((error) => {
        //         console.log('error', error);
        //     });
      }
    });

    connection.on("disconnect-" + ticket.id, () => {
      this.setState(
        {
          disconnect_TicketID: ticket.id
        },
        () => {
          console.log("Disconnect method", ticket.id);
        }
      );
      if (this.props.ticket.AudioChatRequest) {
        this.props.connection.invoke("OnDeclineAudio", ticket.id).then(() => {
          this.setState({ play: false });
          this.props.callAlert("");
          this.props.ticketID("");
          this.audio.pause();
          this.props.ticket.AudioChatRequest = false;
          console.log("Audio Declined");
          //this.props.ticket.AudioChatRequest =
          this.forceUpdate();
        });
      }

      if (this.state.videoState) {
        this.setState({
          showRemoteVideo: false,
          videoState: false
        });
      }
      // this.localVideo.pause();
      // this.localVideo.src = "";
      // this.localStream.stop();

      if (this.localStream)
        this.localStream.getTracks().map(stream => {
          return stream.stop();
        });
      this.forceUpdate();
    });

    this.scrollToBottom();
  }
  audioAlert = () => {
    return <Alert variant="primary">This is a Call alert—check it out!</Alert>;
  };

  newPeerConnection = () => {
    window.RTCPeerConnection =
      window.mozRTCPeerConnection ||
      window.webkitRTCPeerConnection ||
      window.RTCPeerConnection;
    let peerConn = new window.RTCPeerConnection({
      iceServers: [
        { url: "stun:stun.l.google.com:19302" },
        { url: "stun:stun1.l.google.com:19302" },
        { url: "stun:stun2.l.google.com:19302" },
        { url: "stun:stun3.l.google.com:19302" },
        { url: "stun:stun4.l.google.com:19302" }
      ]
    });

    // s    end any ice candidates to the other peer
    peerConn.onicecandidate = evt => {
      if (evt.candidate) {
        // console.log("candidate", evt);

        // console.log("setLocalAndSendMessage", this.props.ticket);

        this.props.connection.invoke(
          "addIceCandidate",
          parseInt(this.props.ticket.id),
          JSON.stringify({
            type: "candidate",
            sdpMLineIndex: evt.candidate.sdpMLineIndex,
            sdpMid: evt.candidate.sdpMid,
            candidate: evt.candidate.candidate
          })
        );
      } else {
        console.log("End of candidates.");
        this.setState({
          videoState: true
        });
        //   console.log(this.state.showRemoteVideo)
      }
      this.forceUpdate();
    };

    // peerConn.addstream(this.localStream);
    this.localStream.getTracks().forEach(function (track) {
      peerConn.addTrack(track);
    });

    peerConn.addEventListener(
      "addstream",
      stream => {
        //  this.remoteVideo = React.createRef();
        console.log("remoteStream on addstream", stream);
        this.remoteVideo.current.srcObject = stream.stream;

        //  this.remoteVideo.current.srcObject = stream.stream;
      },
      false
    );

    this.setState({
      peerConn: peerConn
    });
  };

  defaultErrorCallback = err => {
    console.log("err", err);
  };

  setLocalAndSendMessage = sessionDescription => {
    // console.log('setLocalAndSendMessage', this.props.ticket);
    this.state.peerConn.setLocalDescription(sessionDescription);
    this.props.connection.invoke(
      "addIceCandidate",
      parseInt(this.props.ticket.id),
      JSON.stringify(sessionDescription)
    );
  };

  scrollToBottom = () => {
    this.lastMessage.scrollTop = this.lastMessage.scrollHeight;
  };

  componentDidUpdate = () => {
    this.scrollToBottom();
  };

  AudioRequestView = () => {
    return (
      <div className={"message"}>
        Patient P has requested an audio call session
        <Button
          variant="contained"
          className="acceptCall"
          color="primary"
          size="large"
          //   shape="circle"
          onClick={() => {
            this.props.newCallNotification(false);
            console.log("on Accept ", this.props.newCall);
            this.props.connection
              .invoke("requestAudio", this.props.ticket.id)
              .then(() => {
                this.setState({ isAudioConnected: true, play: false });
                this.props.callAlert("");
                this.props.ticketID("");
                this.audio.pause();
                // this.props.newCallMsg("");
                // this.props.newCallNotification(false);
                this.props.ticket.AudioChatRequest = false;
                console.log("AudioChatRequest", this.props.ticket.id);
                this.getStream();
                console.log("Audio Accepted");
                // this.props.ticket.AudioChat = true;
                console.log("forceStopped");
                this.forceUpdate();
              });
          }}
        >
          Accept
        </Button>
        <Button
          variant="contained"
          className="acceptCall"
          color="danger"
          size="large"
          //   shape="circle"
          onClick={() => {
            this.props.newCallNotification(false);
            console.log("OnDeclineAudio", this.props.newCall);
            this.props.connection
              .invoke("OnDeclineAudio", this.props.ticket.id)
              .then(() => {
                this.setState({ play: false });
                this.props.callAlert("");
                this.props.ticketID("");
                this.audio.pause();
                this.props.ticket.AudioChatRequest = false;
                console.log("Audio Declined");
                //this.props.ticket.AudioChatRequest =
                this.forceUpdate();
              });
          }}
        >
          Decline
        </Button>
      </div>
    );
  };

  ChatRequestView = () => {
    return (
      <div className={"message"}>
        Patient P has requested for Chat
        <Button
          className="acceptCall"
          type="primary"
          size="large"
          //   shape="circle"
          onClick={() => {
            this.props.connection
              .invoke("OnAccept", this.props.msg)
              .then(() => {
                this.props.modalShow(false);
              });
          }}
        >
          Accept
        </Button>
        <Button
          className="acceptCall"
          type="danger"
          size="large"
          //   shape="circle"
          onClick={() => {
            this.props.connection
              .invoke("OnReject", this.props.msg)
              .then(response => {
                console.log("REJECT RESPONSE ______ ", response);
                this.props.modalShow(false);
              });
          }}
        >
          Reject
        </Button>
      </div>
    );
  };

  getStream = () => {
    // this.localStream = null;

    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;
    // navigator.mediaDevices.
    navigator.getUserMedia(
      { audio: true, video: true },
      stream => {
        this.localStream = stream;
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();

        const audioChunks = [];
        mediaRecorder.addEventListener("dataavailable", event => {
          audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks);
          const audioUrl = window.URL.createObjectURL(audioBlob);
          console.log("AUDIO URL === ", audioUrl);
          this.setState({
            recordURL: audioUrl
          });
        });

        setTimeout(() => {
          mediaRecorder.stop();
        }, 10000);
        console.log("local stream without video", this.localStream);
        this.localVideo.current.srcObject = stream;
      },
      error => {
        console.log("error", error);
      }
    );
  };

  remove_Track = pc => {
    //  pc.removeTrack(pc);
  };

  startRemoteVideo = () => {
    this.setState({
      showRemoteVideo: true
    });
  };

  getVideoStream = () => {
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;
    // navigator.mediaDevices.
    navigator.getUserMedia(
      { audio: true, video: true },
      stream => {
        this.localStream = stream;

        console.log("local stream  video", this.localStream);
        this.localVideo.current.srcObject = this.localStream;
      },
      error => {
        console.log("error", error);
      }
    );
  };
  onChange = e => {
    let files = e.target.files;
  };
  // fileList,
  customRequest = () => {
    console.log("File Request ", this.state.file);

    var data = new FormData();

    // data.append("prescription", this.state.file);
    data.append("prescription", this.state.file);
    console.log("DATA APPENDED", data);
    var config = {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    };

    axios
      .post(
        window.API_URL +
        "api/files/uploadprescription?ticketId=" +
        this.props.ticket.id,
        data,
        config
      )
      .then(response => {
        console.log("File Uploaded ----- ", response);
      })
      .catch(error => {
        console.log(
          "File Uploaded -----  Error",
          error,
          error.response,
          error.request
        );
        alert("Upload failed!");
      });
  };

  removeTicket = () => {
    var ticket_arr = this.props.tickets;
    for (let i = 0; i < ticket_arr.length; i++) {
      if (ticket_arr[i].id === this.state.closeTicketID) {
        console.log("TICKET ID __ REMOVE __ ", ticket_arr[i].id);
        this.props.connection.invoke("OnDisconnect", ticket_arr[i].id);

        this.props.closeTicket(false);
        ticket_arr.splice(i, 1);
        this.props.updateTickets(ticket_arr);
        setTimeout(() => {
          this.props.connection.invoke("OnCloseWindow");
          console.log("close_Ticket ", this.props.close_Ticket);
        }, 600);
      }
    }
  };

  sendMessage = ticket_id => {
    console.log(
      "ticket_id == ",
      ticket_id,
      " Message === ",
      this.state.textMessage
    );
    if (this.state.textMessage !== "") {
      this.props.connection.invoke(
        "message",
        ticket_id,
        this.state.textMessage
      );
      this.setState({
        textMessage: ""
      });
    } else {
      alert("Empty message cannot send");
      if (!(this.state.textMessage == "\n" || this.state.textMessage == "\r")) {
        console.log("Message has enter");
        var someText = this.state.textMessage.replace(/(\r\n|\n|\r)/gm, "");
        console.log("REMOVE ENTER ", someText);
        this.setState({
          textMessage: someText
        });
      }
    }
  };
  //////////////////////////////////////////// METHODS FOR ERM /////////////////////////////////////////////////////////

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

  ////////////////////////// Provisional Diagnosis /////////////////////////////////////////

  addPD = event => {
    console.log("ADD_____", this.state.treatment_arr.length);
    this.setState(prevState => ({
      provisional_diagnosis: [
        ...prevState.provisional_diagnosis,
        { diagnose: "", key: this.state.provisional_diagnosis.length }
      ]
    }));
  };
  deletePD = event => {
    console.log("DELETE Disease INDEX ", event);
    this.setState(
      {
        provisional_diagnosis: this.state.provisional_diagnosis.filter(
          (item, index) => {
            return index !== event;
          }
        )
      },
      () => {
        console.log("DISEASE ARRAY +_++++ ", this.state.provisional_diagnosis);
      }
    );
    // this.state.treatment_arr.splice(this.state.treatment_arr.length, 0);
  };
  PD_arr = (event, key) => {
    console.log("Treatment_arr Name ---- ", event, " at Index ", key);
    this.state.provisional_diagnosis[key].diagnose = event;
    var temp = this.state.provisional_diagnosis;
    console.log("Treatment_arr  ", temp);
    this.state.provisional_diagnosis.filter((item, index) => {
      if (index === key) {
        this.setState(prevState => ({
          provisional_diagnosis: temp
        }));
      }
    });
  };

  ////////////////////////// Provisional Diagnosis /////////////////////////////////////////

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
  delete_Prescription_Row = (key) => {
    this.setState(
      {
        add_Prescription: this.state.add_Prescription.filter((item, index) => {
          return index !== key;
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
  addItem = () => {
    this.setState({
      data: [...this.state.data,
      {
        id: this.state.data.length,
        value: Math.random() * 100
      }]
    })
  };
  /////////////////////////////////////////// METHODS FOR ERM ///////////////////////////////////////////////////////////
  render() {
    // console.log('ticket', this.props.ticket);

    const fileUploadProps = {
      onRemove: file => { },
      beforeUpload: file => {
        this.setState(
          {
            file,
            fileName: file.name
          },
          () => {
            console.log("file Before", this.state.file);
            this.customRequest();
          }
        );

        return false;
      },

      showUploadList: false
    };
    console.log('this.props.ticket ==== ', this.props.ticket)
    return (
      <div className="col-9 chat_instance">
        {/* <div className="container-fluid"> */}
        <div className="row">

          < div className="col-6" >
            <div className="chat_area" style={{ backgroundColor: "#f6f6f8" }}>
              <div className="row">
                <div className="col">

                  <div className="patient_Name">
                    {this.props.ticket.patient.username} -
                      {this.props.ticket.id}</div>

                </div>
                <div className="col">
                  <div className="right_bar">
                    <div className="row">
                      {this.state.videoState &&
                        !this.state.showRemoteVideo ? (
                          <Tooltip title="Start Video Call">
                            <IconButton
                              onClick={() => {
                                console.log("video button pressed");
                                this.props.connection.invoke(
                                  "requestVideo",
                                  parseInt(this.props.ticket.id)
                                );
                              }}
                              color="secondary"
                              aria-label="add an alarm"
                            >
                              <VideocamIcon style={{ color: "#7a7a7a" }} />
                            </IconButton>
                          </Tooltip>
                        ) : null}
                      {this.state.showRemoteVideo ? (
                        <Tooltip title="Close Video Call">
                          <IconButton
                            onClick={() => {
                              console.log("close video button");
                              this.props.connection
                                .invoke(
                                  "OnDeclineAudio",
                                  this.props.ticket.id
                                )
                                .then(() => {
                                  this.props.ticket.AudioChatRequest = false;
                                  if (this.state.videoState) {
                                    this.setState({
                                      showRemoteVideo: false,
                                      videoState: false
                                    });
                                  }
                                  console.log("VIdeo call declined");
                                });
                              // this.props.connection
                              //     .invoke('disconnect', parseInt(this.props.ticket.id));
                            }}
                            color="secondary"
                            aria-label="add an alarm"
                          >
                            <VideocamOffRoundedIcon
                              style={{ color: "red" }}
                            />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                      <Tooltip title="Close Chat">
                        <IconButton
                          onClick={() => {
                            this.setState(
                              {
                                closeTicketID: this.props.ticket.id
                              },
                              () => {
                                this.props.closeChat(true);
                                setTimeout(() => {
                                  console.log(
                                    "this.props.close",
                                    this.props.close
                                  );
                                }, 600);
                              }
                            );
                            // this.removeTicket(this.props.ticket.id);
                          }}
                          color="secondary"
                          aria-label="add an alarm"
                        >
                          <CloseIcon
                            style={{
                              color: "red"
                            }}
                          />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
              <Divider light={true} />
              <div className="row">
                <div className="col">
                  <div className="middle" id="style-1">
                    <div
                      ref={el => {
                        this.lastMessage = el;
                      }}
                      id="style-1"
                      style={{ overflowX: 'hidden', overflowY: 'auto', maxHeight: '360px' }}
                    >
                      {this.props.close_Ticket ? this.removeTicket() : null}
                      {this.props.ticket.messages.length === 0 ? (
                        <div className="no_message">
                          <Chip label="No messages" />
                        </div>
                      ) : null}
                      {this.props.ticket.messages.map((message, index) => {
                        var isSenderPatient =
                          message.senderID === this.props.ticket.patientID;

                        return (
                          <Row key={index}>
                            <Col>
                              {isSenderPatient ? (
                                <div span={6} className={"message-right"}>
                                  {message.file == null ? message.text : null}

                                  {message.file != null &&
                                    message.file.fileType === 0 ? (
                                      <img
                                        alt=""
                                        style={{
                                          width: "200px",
                                          padding: "5px"
                                        }}
                                        src={
                                          window.API_URL +
                                          "/images/" +
                                          message.file.path
                                        }
                                      />
                                    ) : (
                                      ""
                                    )}
                                  {message.file != null &&
                                    message.file.fileType === 1 ? (
                                      <a
                                        style={{ color: "#fff" }}
                                        href={
                                          window.API_URL +
                                          "/images/" +
                                          message.file.path
                                        }
                                        target="blank"
                                      >
                                        {message.file.originalName}
                                      </a>
                                    ) : (
                                      ""
                                    )}
                                </div>
                              ) : (
                                  <div className={"message-left"}>
                                    {message.file == null ? message.text : null}
                                    {message.file != null &&
                                      message.file.fileType === 0 ? (
                                        <img
                                          alt=""
                                          style={{
                                            width: "200px",
                                            padding: "5px"
                                          }}
                                          src={
                                            window.API_URL +
                                            "/images/" +
                                            message.file.path
                                          }
                                        />
                                      ) : (
                                        ""
                                      )}
                                    {message.file != null &&
                                      message.file.fileType === 1 ? (
                                        <a
                                          style={{ color: "#fff" }}
                                          href={
                                            window.API_URL +
                                            "/images/" +
                                            message.file.path
                                          }
                                          target="blank"
                                        >
                                          {message.file.originalName}
                                        </a>
                                      ) : (
                                        ""
                                      )}
                                  </div>
                                )}
                            </Col>
                          </Row>
                        );
                      })}
                      {this.props.modal ? this.ChatRequestView() : null}
                      {this.props.ticket.AudioChatRequest
                        ? this.AudioRequestView()
                        : null}
                    </div>
                  </div>
                </div>
                {/* <div className="col">
                  <div style={{ marginLeft: "10px", position: "relative" }}>
                    <video
                      ref={this.localVideo}
                      style={{
                        // border: '1px solid #000',
                        position: "absolute",
                        bottom: "0px",
                        right: "0px",
                        width: "100px",
                        height: "80px",
                        display: this.state.showRemoteVideo ? "block" : "none"
                      }}
                      autoPlay
                    ></video>
                    <div>
                      <video
                        ref={this.remoteVideo}
                        style={{
                          width: "100%",
                          height: "100%",
                          // border: "1px solid #000",
                          // background: "#777",
                          display: this.state.showRemoteVideo
                            ? "block"
                            : "none"
                        }}
                        autoPlay
                      ></video>
                    </div>
                  </div>
                </div>*/}
              </div>

              {/* <div className="container-fluid"> */}
              {/* <div className="row"> */}
              {this.state.disconnect_TicketID === this.props.ticket.id ? (
                <div className="session_expired">
                  <Chip
                    // variant="outlined"
                    label="Your Chat Session Expired"
                    color="secondary"
                    icon={<SpeakerNotesOffIcon />}
                  />
                </div>
              ) : (
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
                        rowsMax="2"
                        placeholder="Type Here"
                        style={{
                          fontSize: "10px"
                        }}
                        fullWidth={true}
                        value={this.state.textMessage}
                        onChange={text =>
                          this.setState({ textMessage: text.target.value })
                        }
                      />
                    </div>
                    <div className="col-3">

                      <Upload {...fileUploadProps}>
                        <Tooltip arrow title="Upload File/Image">
                          <IconButton

                            color="secondary"
                            aria-label="add an alarm"
                          >
                            <AttachFileIcon />
                          </IconButton>
                        </Tooltip>
                      </Upload>

                      <Tooltip arrow title="Send Message">
                        <IconButton
                          onClick={() =>
                            this.sendMessage(this.props.ticket.id)
                          }
                          style={{
                            borderWidth: "0px"
                          }}
                          color="primary"
                          aria-label="add an alarm"
                        >
                          <SendIcon
                            style={{
                              color: "#0d74bc"
                            }}
                          />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                )}
              {/* </div> */}
            </div>
            {/* </div> */}
          </div >

          <div className="col-6">
            <div
              id="style-1"
              className="prescription_form block-example border border-light"
              style={{
                backgroundColor: "#fff",
                overflowX: "hidden",
                overflowY: "auto"
              }}
            >
              <div className="heading_1">Prescription Form</div>
              <Divider />
              <Form>
                {/* ///////////////// Customer Details ///////////////// */}
                <div className="tab_heading">Customer Details :</div>
                <Divider />
                <FormGroup
                  className="form_group"
                  style={{
                    marginTop: "10px",
                    paddingLeft: "6px",
                    paddingRight: "6px"
                  }}
                >
                  <div className="row">
                    <div className="col">
                      {" "}
                      <Input
                        type="text"
                        required={true}
                        name="health_id"
                        id="health_id"
                        placeholder="Health ID #"
                        style={{ fontSize: "12px" }}
                      />
                    </div>

                    <div className="col">
                      <Input
                        type="number"
                        disabled={true}
                        name="registeration_id"
                        id="registeration_id"
                        defaultValue={this.props.ticket.id}
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
                    </div>
                    <div className="col">
                      {" "}
                      <Input
                        type="text"
                        required={true}
                        name="mr/mrs"
                        id="mr/mrs"
                        placeholder="Mr/Mrs"
                        style={{ fontSize: "12px" }}
                      />
                    </div>
                  </div>
                </FormGroup>
                <FormGroup
                  // className="form_group"
                  style={{ marginLeft: "5px" }}
                >
                  <div className="row">
                    <div className="col">
                      {" "}
                      <Input
                        type="select"
                        name="gender"
                        id="gender"
                        placeholder="Gender"
                        style={{ fontSize: "12px" }}
                      >
                        <option>Gender</option>
                        <option>Male</option>
                        <option>Female</option>
                      </Input>
                    </div>
                    <div className="col"></div>
                    <div className="col"></div>
                  </div>
                </FormGroup>
                {/* ///////////////// Customer Details ///////////////// */}
                {/* ///////////////// Complaints & Symptoms ///////////////// */}
                <Divider />
                <div className="row">
                  <div className="col">
                    <div className="tab_heading">Complaints & Symptoms :</div>
                  </div>
                  <div className="col">
                    <div className="add_btn">
                      {" "}
                      <Tooltip title="Add Complaints & Symptoms">
                        <IconButton
                          onClick={() => this.add_complaints()}
                          color="secondary"
                          aria-label="add an alarm"
                        >
                          <AddCircleRoundedIcon style={{ color: "green" }} />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                </div>
                <Divider />
                <div style={{ marginTop: "16px" }}></div>
                <div className="row">
                  {this.state.complaints_symptoms.length == 0
                    ? null
                    : this.state.complaints_symptoms.map((val, index) => {
                      return (
                        <div className="col-6" key={index}>
                          <FormGroup
                            style={{
                              paddingLeft: "6px",
                              paddingRight: "6px"
                            }}
                          >
                            <InputGroup>
                              <Input
                                type="text"
                                name="symptoms"
                                id="symptoms"
                                value={
                                  this.state.complaints_symptoms[index]
                                    .symptoms
                                }
                                placeholder="Symptoms"
                                style={{ fontSize: "12px" }}
                                onChange={text =>
                                  this.complaints_add_array(
                                    text.target.value,
                                    index
                                  )
                                }
                              />
                              <Input
                                type="text"
                                name="duration"
                                id="duration"
                                value={
                                  this.state.complaints_symptoms[index]
                                    .duration
                                }
                                placeholder="Duration"
                                style={{ fontSize: "12px" }}
                                onChange={text =>
                                  this.complaints_add_array1(
                                    text.target.value,
                                    index
                                  )
                                }
                              />
                              <InputGroupAddon addonType="append">
                                <Tooltip title="Remove Complaints & Symptoms">
                                  <IconButton
                                    onClick={() =>
                                      this.delete_complaints(index)
                                    }
                                    size="small"
                                    color="secondary"
                                    aria-label="add an alarm"
                                  >
                                    <RemoveCircleOutlineIcon
                                      style={{ color: "red" }}
                                    />
                                  </IconButton>
                                </Tooltip>
                              </InputGroupAddon>
                            </InputGroup>
                          </FormGroup>
                        </div>
                      );
                    })}
                </div>
                {/* ///////////////// Complaints & Symptoms ///////////////// */}
                <div style={{ marginTop: "16px" }}></div>
                {/* ///////////////// PROVISIONAL DIAGNOSIS ///////////////// */}
                <Divider />
                <div className="row">
                  <div className="col">
                    <div className="tab_heading">Provisional Diagnosis :</div>
                  </div>
                  <div className="col">
                    <div className="add_btn">
                      {" "}
                      <Tooltip title="Add Provisional Diagnosis">
                        <IconButton
                          onClick={() => this.addPD()}
                          color="secondary"
                          aria-label="add an alarm"
                        >
                          <AddCircleRoundedIcon style={{ color: "green" }} />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                </div>
                <Divider />
                <div style={{ marginTop: "16px" }}></div>
                <div className="row" style={{ marginBottom: "10px" }}>
                  {this.state.provisional_diagnosis.length == 0
                    ? null
                    : this.state.provisional_diagnosis.map((val, index) => {
                      return (
                        <div className="col-6" key={index}>
                          <FormGroup
                            style={{
                              paddingLeft: "6px",
                              paddingRight: "6px"
                            }}
                          >
                            <InputGroup>
                              <Input
                                type="text"
                                name="add_PD"
                                id="addPD"
                                value={
                                  this.state.provisional_diagnosis[index]
                                    .diagnose
                                }
                                placeholder="Diagnosis"
                                style={{ fontSize: "12px" }}
                                onChange={text =>
                                  this.PD_arr(text.target.value, index)
                                }
                              />
                              <InputGroupAddon addonType="append">
                                <Tooltip title="Remove Provisional Diagnosis">
                                  <IconButton
                                    onClick={() => this.deletePD(index)}
                                    size="small"
                                    color="secondary"
                                    aria-label="add an alarm"
                                  >
                                    <RemoveCircleOutlineIcon
                                      style={{ color: "red" }}
                                    />
                                  </IconButton>
                                </Tooltip>
                              </InputGroupAddon>
                            </InputGroup>
                          </FormGroup>
                        </div>
                      );
                    })}
                </div>
                {/* ///////////////// PROVISIONAL DIAGNOSIS ///////////////// */}

                {/* ///////////////// PRESCRIPTION ///////////////// */}
                <Divider />
                <div className="row">
                  <div className="col">
                    <div className="tab_heading">Prescription :</div>
                  </div>
                  <div className="col">
                    <div className="add_btn">
                      {" "}
                      <Tooltip title="Add New Prescription Row">
                        <IconButton
                          onClick={() => this.addPrescriptionRow()}
                          color="secondary"
                          aria-label="add an alarm"
                        >
                          <AddCircleRoundedIcon style={{ color: "green" }} />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                </div>
                <Divider />
                <div style={{ marginTop: "16px" }}></div>
                <FormGroup
                  style={{
                    paddingLeft: "6px",
                    paddingRight: "6px"
                  }}
                >
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th></th>
                        <th style={{ fontSize: "12px" }}>S.No</th>
                        <th style={{ fontSize: "12px" }}>Medicine</th>
                        <th style={{ fontSize: "12px" }}>Dosage</th>
                        <th style={{ fontSize: "12px" }}>Route</th>
                        <th style={{ fontSize: "12px" }}>Frequency</th>
                        <th style={{ fontSize: "12px" }}>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.add_Prescription.length > 0
                        ? this.state.add_Prescription.map((item, index) => {
                          return (
                            <tr key={index}>
                              <th scope="select">
                                <Tooltip title="Delete Provisional Diagnosis">
                                  <IconButton
                                    style={{ width: '10px', height: '10px' }}
                                    size='small'
                                    onClick={() => this.delete_Prescription_Row(index)}
                                    color="secondary"
                                    aria-label="add an alarm"
                                  >
                                    <RemoveCircleOutlineIcon style={{ color: "red" }} />
                                  </IconButton>
                                </Tooltip>
                              </th>
                              <th scope="row" style={{ fontSize: "10px" }}>
                                {this.state.add_Prescription[index].sr}
                              </th>
                              <td>
                                <Input
                                  type="text"
                                  name="description"
                                  id="description"
                                  style={{ fontSize: "10px" }}
                                  value={
                                    this.state.add_Prescription[index]
                                      .description
                                  }
                                  onChange={text =>
                                    this.add_description(
                                      text.target.value,
                                      index
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <Input
                                  type="text"
                                  name="dosage"
                                  id="dosage"
                                  style={{ fontSize: "10px" }}
                                  value={
                                    this.state.add_Prescription[index]
                                      .dosage
                                  }
                                  onChange={text =>
                                    this.add_dosage(
                                      text.target.value,
                                      index
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <Input
                                  type="text"
                                  name="Period"
                                  id="Period"
                                  style={{ fontSize: "10px" }}
                                  value={
                                    this.state.add_Prescription[index]
                                      .period
                                  }
                                  onChange={text =>
                                    this.add_period(
                                      text.target.value,
                                      index
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <Input
                                  type="text"
                                  name="dosageForm"
                                  id="dosageForm"
                                  style={{ fontSize: "10px" }}
                                  value={
                                    this.state.add_Prescription[index]
                                      .dosageForm
                                  }
                                  onChange={text =>
                                    this.add_dosageForm(
                                      text.target.value,
                                      index
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <Input
                                  type="text"
                                  name="comment"
                                  id="comment"
                                  style={{ fontSize: "10px" }}
                                  value={
                                    this.state.add_Prescription[index]
                                      .comment
                                  }
                                  onChange={text =>
                                    this.add_comment(
                                      text.target.value,
                                      index
                                    )
                                  }
                                />
                              </td>
                            </tr>
                          );
                        })
                        : null}
                    </tbody>
                  </Table>
                </FormGroup>
                <div style={{ marginTop: "10px" }}></div>
                {/* ///////////////// PRESCRIPTION ///////////////// */}

                {/* //////////////////// LAB TESTS ///////////////// */}
                <Divider />
                <div className="row">
                  <div className="col">
                    <div className="tab_heading">Lab Tests :</div>
                  </div>
                  <div className="col">
                    <div className="add_btn">
                      {" "}
                      <Tooltip title="Add Lab Tests">
                        <IconButton
                          onClick={() => this.add_lab_test()}
                          color="secondary"
                          aria-label="add an alarm"
                        >
                          <AddCircleRoundedIcon style={{ color: "green" }} />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                </div>
                <Divider />
                <div style={{ marginTop: "16px" }}></div>
                <div className="row">
                  {this.state.lab_tests.length == 0
                    ? null
                    : this.state.lab_tests.map((val, index) => {
                      return (
                        <div className="col-6" key={index}>
                          <FormGroup style={{
                            paddingLeft: "6px",
                            paddingRight: "6px"
                          }}>
                            <InputGroup>
                              <Input
                                type="text"
                                name="labtest"
                                id="labtest"
                                value={
                                  this.state.lab_tests[index].test
                                }
                                placeholder={"Test # " + index}
                                style={{ width: "250px", fontSize: '12px' }}
                                onChange={text =>
                                  this.tests_add_array(
                                    text.target.value,
                                    index
                                  )
                                }
                              />
                              <InputGroupAddon addonType="append">
                                <Tooltip title="Remove Lab Test">
                                  <IconButton
                                    onClick={() => this.delete_lab_test(index)}
                                    size="small"
                                    color="secondary"
                                    aria-label="add an alarm"
                                  >
                                    <RemoveCircleOutlineIcon
                                      style={{ color: "red" }}
                                    />
                                  </IconButton>
                                </Tooltip>

                              </InputGroupAddon>
                            </InputGroup>
                          </FormGroup>
                        </div>
                      );
                    })}
                </div>
                {/* //////////////////// LAB TESTS ///////////////// */}
              </Form>
            </div>
          </div>
        </div >
        {/* </div> */}
      </div >
    );
  }
}
const mapDispatchToProps = {
  newMessage,
  ticketID,
  callAlert,
  updateTickets,
  newCallNotification,
  newCallMsg,
  modalShow,
  closeChat,
  closeTicket,
  ermModal
};

const mapStateToProps = state => {
  var message = state.LiveChatReducer.message;
  var ticketId = state.LiveChatReducer.ticketId;
  var tickets = state.LiveChatReducer.tickets;
  var call = state.LiveChatReducer.call;
  var newCallmsg = state.LiveChatReducer.newCallmsg;
  var newCall = state.LiveChatReducer.newCall;
  var msg = state.LiveChatReducer.msg;
  var close_Ticket = state.LiveChatReducer.close_Ticket;
  var close = state.LiveChatReducer.close;
  return {
    message,
    ticketId,
    call,
    tickets,
    newCallmsg,
    newCall,
    msg,
    close_Ticket,
    close
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(ChatInstance);
