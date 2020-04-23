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
  InputGroupAddon,
} from "reactstrap";
import "../../index.css";
// import { Button } from "reactstrap";
import CircularProgress from "@material-ui/core/CircularProgress";
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
import ClearIcon from "@material-ui/icons/Clear";
import DoneIcon from "@material-ui/icons/Done";
import Switch from "@material-ui/core/Switch";
import Paper from "@material-ui/core/Paper";
import Zoom from "@material-ui/core/Zoom";
import { Spinner } from "reactstrap";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import "../../assets/css.css";
import axios from "axios";
import logo from "../../assets/logo.png";
import close from "../../assets/close.png";
import doc from "../../assets/doc.png";
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
  ermModal,
} from "../../store/actions/livechat";
import { CloseButton } from "react-bootstrap";
const { TextArea } = Input;
const { Icon } = Layout;

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload(file) {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("You can only upload JPG/PNG file!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("Image must smaller than 2MB!");
  }
  return isJpgOrPng && isLt2M;
}

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
      h_id: "",
      patientName: "",
      registraton_id: "",
      age: "",
      gender: "",
      contact: "",
      email: "",
      follow_up: "",
      treatment_arr: [],
      complaints_symptoms: [],
      provisional_diagnosis: [],
      add_Prescription: [],
      lab_tests: [],
      error_hid: false,
      valid_pname: false,
      error_pname: false,
      errorR_id: false,
      valid_gender: false,
      error_gender: false,
      valid_contact: false,
      error_contact: false,
      valid_email: false,
      error_email: false,
      valid_pname: false,
      error_fup: false,
      data: [],
      show_video: false,
      file_uri: "",
      file_type: "",
      uploading: false,
      s_required: null,
      d_required: null,
      pd_required: null,
      test_required: null,
      m_required: null,
      do_required: null,
      r_required: null,
      f_required: null,
      du_required: null,
      s_valid: true,
      d_valid: true,
      pd_valid: true,
      test_valid: true,
      m_valid: true,
      do_valid: true,
      r_valid: true,
      f_valid: true,
      du_valid: true,
      cs_NE: true,
      pd_NE: true,
      pr_NE: true,
      lt_NE: true,
    };
    // this.url = "http://streaming.tdiradio.com:8000/house.mp3";
    this.url =
      "https://nf1f8200-a.akamaihd.net/downloads/ringtones/files/mp3/iphone-6-original-ringtone-24163.mp3";
    this.audio = new Audio(this.url);
  }

  UNSAFE_componentWillReceiveProps(props) {
    const { connection, ticket } = props;
    if (ticket.id === this.props.ticket.id) {
      console.log("Same Ticket");
    } else {
      this.listening_connection(connection, ticket);
    }
    console.log(
      "UNSAFE_componentWillReceiveProps (Connection) ",
      connection,
      "UNSAFE_componentWillReceiveProps (Ticket) ",
      ticket
    );
  }
  listening_connection = (connection, ticket) => {
    // let ticket = this.props.ticket;
    // let connection = this.props.connection;
    console.log("CHAT INSTANCE RE RENDER ---- ", ticket);
    connection.on("message-" + ticket.id, (message) => {
      this.props.newMessage("New Message");
      this.props.ticketID(message.ticketID);

      ticket.messages.push(message);

      console.log("textMessage - Recieved", message);
      setTimeout(() => {
        this.props.newMessage("");
        this.props.ticketID("");
      }, 2000);

      this.forceUpdate();
    });

    connection.on("requestAudio-" + ticket.id, (ticketId) => {
      //  console.log('')
      // console.log('Audio Requested');
      ticket["AudioChatRequest"] = true;
      const hide = message.info(`Upcoming Call from Patient ID - ${ticket.id}`);
      setTimeout(hide, 2500);
      this.setState({
        play: true,
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

    connection.on("onDeclineAudio-" + ticket.id, (ticketId) => {
      this.props.newCallNotification(false);
      this.audio.pause();
      if (this.state.isAudioConnected === true) {
        // this.state.peerConn.close()
        console.log("Call isAudioConnected finished ");
        this.setState({
          play: false,
        });
        this.props.newCallMsg("");
        // this.props.newCallNotification(false);
        this.props.callAlert("");
        this.props.ticketID("");
        this.setState({ play: false, videoState: false });

        if (this.localStream)
          this.localStream.getTracks().map((stream) => {
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
          show_video: false,
          play: false,
          videoState: false,
        });
        if (this.localStream)
          this.localStream.getTracks().map((stream) => {
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

    connection.on("requestVideo-" + ticket.id, (ticketId) => {
      console.log("enable video");
      this.setState({
        showRemoteVideo: true,
        show_video: true,
      });
    });

    connection.on("addIceCandidate-" + ticket.id, (evt) => {
      var descr = JSON.parse(evt);

      if (descr.type === "offer") {
        this.newPeerConnection();
        if (this.state.peerConn) {
          this.state.peerConn
            .setRemoteDescription(new RTCSessionDescription(descr))
            .then(() => {
              this.state.peerConn.createAnswer(
                (sessionDescription) =>
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
          candidate: descr.candidate,
        });
        this.state.peerConn
          .addIceCandidate(candidate)
          .then(() => {
            console.log("ADDED ICE CANDIDATE Successfully");
          })
          .catch((error) => {
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
          disconnect_TicketID: ticket.id,
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
          videoState: false,
        });
      }
      // this.localVideo.pause();
      // this.localVideo.src = "";
      // this.localStream.stop();

      if (this.localStream)
        this.localStream.getTracks().map((stream) => {
          return stream.stop();
        });
      this.forceUpdate();
    });

    this.scrollToBottom();
  };

  componentDidMount() {
    let ticket = this.props.ticket;
    let connection = this.props.connection;
    this.listening_connection(connection, ticket);
    // console.log('CHAT INSTANCE RE RENDER ---- ', ticket)
    // connection.on("message-" + ticket.id, message => {
    //   this.props.newMessage("New Message");
    //   this.props.ticketID(message.ticketID);

    //   ticket.messages.push(message);

    //   console.log('textMessage - Recieved', message);
    //   setTimeout(() => {
    //     this.props.newMessage("");
    //     this.props.ticketID("");
    //   }, 2000);

    //   this.forceUpdate();
    // });

    // connection.on("requestAudio-" + ticket.id, ticketId => {
    //   //  console.log('')
    //   // console.log('Audio Requested');
    //   ticket["AudioChatRequest"] = true;
    //   const hide = message.info(`Upcoming Call from Patient ID - ${ticket.id}`);
    //   setTimeout(hide, 2500);
    //   this.setState({
    //     play: true
    //   });
    //   console.log("REQUEST AUDIO");
    //   this.props.callAlert("UpComming Call");
    //   this.props.ticketID(ticket.id);
    //   this.props.newCallMsg(ticket.id);
    //   this.props.newCallNotification(true);
    //   // console.log("CALL NOTIFY requestAudio ", this.props.newCall);
    //   this.audio.play();
    //   // this.getStream();
    //   this.forceUpdate();
    // });

    // connection.on("onDeclineAudio-" + ticket.id, ticketId => {
    //   this.props.newCallNotification(false);
    //   this.audio.pause();
    //   if (this.state.isAudioConnected === true) {
    //     // this.state.peerConn.close()
    //     console.log("Call isAudioConnected finished ");
    //     this.setState({
    //       play: false
    //     });
    //     this.props.newCallMsg("");
    //     // this.props.newCallNotification(false);
    //     this.props.callAlert("");
    //     this.props.ticketID("");
    //     this.setState({ play: false, videoState: false });

    //     if (this.localStream)
    //       this.localStream.getTracks().map(stream => {
    //         return stream.stop();
    //       });
    //     this.props.ticket.AudioChatRequest = false;
    //     this.forceUpdate();
    //   }
    //   if (this.state.showRemoteVideo === true) {
    //     console.log("Audio decline showRemoteVideo false");
    //     // this.localVideo.current.
    //     this.props.callAlert("");
    //     this.props.ticketID("");
    //     this.audio.pause();
    //     this.setState({
    //       showRemoteVideo: false,
    //       play: false,
    //       videoState: false
    //     });
    //     if (this.localStream)
    //       this.localStream.getTracks().map(stream => {
    //         return stream.stop();
    //       });
    //     this.props.ticket.AudioChatRequest = false;
    //     this.forceUpdate();
    //   } else {
    //     this.props.newCallMsg("");
    //     if (this.props.newCall) {
    //       this.props.newCallNotification(false);
    //     }
    //     console.log("Call Declined by Client");
    //     this.props.callAlert("");
    //     this.props.ticketID("");
    //     this.setState({ play: false, videoState: false });
    //     this.audio.pause();
    //     this.props.ticket.AudioChatRequest = false;
    //     this.forceUpdate();
    //   }
    // });

    // connection.on("requestVideo-" + ticket.id, ticketId => {
    //   console.log("enable video");
    //   this.setState({
    //     showRemoteVideo: true
    //   });
    // });

    // connection.on("addIceCandidate-" + ticket.id, evt => {
    //   var descr = JSON.parse(evt);

    //   if (descr.type === "offer") {
    //     this.newPeerConnection();
    //     if (this.state.peerConn) {
    //       this.state.peerConn
    //         .setRemoteDescription(new RTCSessionDescription(descr))
    //         .then(() => {
    //           this.state.peerConn.createAnswer(
    //             sessionDescription =>
    //               this.setLocalAndSendMessage(sessionDescription),
    //             this.defaultErrorCallback
    //           );
    //         });
    //     }

    //     // setTimeout(() => {
    //     //   console.log("After New");
    //     //   this.state.peerConn.setRemoteDescription(
    //     //     new RTCSessionDescription(descr)
    //     //   );
    //     //   this.state.peerConn.createAnswer(
    //     //     sessionDescription =>
    //     //       this.setLocalAndSendMessage(sessionDescription),
    //     //     this.defaultErrorCallback
    //     //   );
    //     // }, 1000);
    //     // this.state.peerConn.createOffer((sessionDescription) => this.setLocalAndSendMessage(sessionDescription), this.defaultErrorCallback);
    //   } else if (descr.type === "answer") {
    //     this.state.peerConn.setRemoteDescription(
    //       new RTCSessionDescription(descr)
    //     );
    //   } else if (descr.type === "candidate") {
    //     var candidate = new RTCIceCandidate({
    //       sdpMLineIndex: descr.sdpMLineIndex,
    //       sdpMid: descr.sdpMid,
    //       candidate: descr.candidate
    //     });
    //     this.state.peerConn
    //       .addIceCandidate(candidate)
    //       .then(() => {
    //         console.log("ADDED ICE CANDIDATE Successfully");
    //       })
    //       .catch(error => {
    //         console.log("ADDED ICE CANDIDATE error", error);
    //       });
    //     // }
    //     // this.state.peerConn
    //     //     .addIceCandidate(candidate)
    //     //     .catch((error) => {
    //     //         console.log('error', error);
    //     //     });
    //   }
    // });

    // connection.on("disconnect-" + ticket.id, () => {
    //   this.setState(
    //     {
    //       disconnect_TicketID: ticket.id
    //     },
    //     () => {
    //       console.log("Disconnect method", ticket.id);
    //     }
    //   );
    //   if (this.props.ticket.AudioChatRequest) {
    //     this.props.connection.invoke("OnDeclineAudio", ticket.id).then(() => {
    //       this.setState({ play: false });
    //       this.props.callAlert("");
    //       this.props.ticketID("");
    //       this.audio.pause();
    //       this.props.ticket.AudioChatRequest = false;
    //       console.log("Audio Declined");
    //       //this.props.ticket.AudioChatRequest =
    //       this.forceUpdate();
    //     });
    //   }

    //   if (this.state.videoState) {
    //     this.setState({
    //       showRemoteVideo: false,
    //       videoState: false
    //     });
    //   }
    //   // this.localVideo.pause();
    //   // this.localVideo.src = "";
    //   // this.localStream.stop();

    //   if (this.localStream)
    //     this.localStream.getTracks().map(stream => {
    //       return stream.stop();
    //     });
    //   this.forceUpdate();
    // });

    // this.scrollToBottom();
  }
  audioAlert = () => {
    return <Alert variant="primary">This is a Call alert—check it out!</Alert>;
  };

  newPeerConnection = () => {
    window.RTCPeerConnection =
      window.mozRTCPeerConnection ||
      window.webkitRTCPeerConnection ||
      window.RTCPeerConnection;
    let peerConn = new RTCPeerConnection({
      iceServers: [
        { url: "stun:stun.l.google.com:19302" },
        { url: "stun:stun1.l.google.com:19302" },
        { url: "stun:stun2.l.google.com:19302" },
        { url: "stun:stun3.l.google.com:19302" },
        { url: "stun:stun4.l.google.com:19302" },
        {
          urls: "turn:110.93.216.20:3478?transport=tcp",
          username: "test",
          lifetime: 600,
          credential: "test",
        },
      ],
    });

    // s    end any ice candidates to the other peer
    peerConn.onicecandidate = (evt) => {
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
            candidate: evt.candidate.candidate,
          })
        );
      } else {
        console.log("End of candidates.");
        this.setState({
          videoState: true,
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
      (stream) => {
        //  this.remoteVideo = React.createRef();
        console.log("remoteStream on addstream", stream);
        this.remoteVideo.current.srcObject = stream.stream;

        //  this.remoteVideo.current.srcObject = stream.stream;
      },
      false
    );

    this.setState({
      peerConn: peerConn,
    });
  };

  defaultErrorCallback = (err) => {
    console.log("err", err);
  };

  setLocalAndSendMessage = (sessionDescription) => {
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
  Form_scrollToBottom = () => {
    this.form.scrollTop = this.form.scrollHeight;
  };
  AudioRequestView = () => {
    return (
      <div className="call_request_view">
        <div className="heading_text show_hide">
          Patient has requested for an audio call session
        </div>

        <div className="row buttons_call">
          <div>
            <Button
              variant="contained"
              size="small"
              color="primary"
              className="show_hide"
              startIcon={<DoneIcon />}
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
          </div>
          &nbsp;&nbsp;
          <div>
            <Button
              variant="contained"
              size="small"
              color="secondary"
              className="show_hide"
              startIcon={<ClearIcon />}
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
              Reject
            </Button>
          </div>
        </div>
        {/* <div className={"message"}>
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
        </div> */}
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
              .then((response) => {
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
      (stream) => {
        this.localStream = stream;
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();

        const audioChunks = [];
        mediaRecorder.addEventListener("dataavailable", (event) => {
          audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks);
          const audioUrl = window.URL.createObjectURL(audioBlob);
          console.log("AUDIO URL === ", audioUrl);
          this.setState({
            recordURL: audioUrl,
          });
        });

        setTimeout(() => {
          mediaRecorder.stop();
        }, 10000);
        console.log("local stream without video", this.localStream);
        this.localVideo.current.srcObject = stream;
      },
      (error) => {
        console.log("error", error);
      }
    );
  };
  remove_Track = (pc) => {
    //  pc.removeTrack(pc);
  };
  startRemoteVideo = () => {
    this.setState({
      showRemoteVideo: true,
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
      (stream) => {
        this.localStream = stream;

        console.log("local stream  video", this.localStream);
        this.localVideo.current.srcObject = this.localStream;
      },
      (error) => {
        console.log("error", error);
      }
    );
  };
  onChange = (e) => {
    let files = e.target.files;
  };
  // fileList,
  customRequest = () => {
    console.log("File Request ", this.state.file);
    this.setState({ uploading: true });
    var data = new FormData();

    // data.append("prescription", this.state.file);
    data.append("prescription", this.state.file);
    console.log("DATA APPENDED", data);
    var config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    axios
      .post(
        window.API_URL +
          "api/files/uploadprescription?ticketId=" +
          this.props.ticket.id,
        data,
        config
      )
      .then((response) => {
        console.log("File Uploaded ----- ", response);
        if (response.status === 200) {
          this.setState({
            file: "",
            fileName: "",
            file_type: "",
            file_uri: "",
            uploading: false,
          });
        }
      })
      .catch((error) => {
        console.log(
          "File Uploaded -----  Error",
          error,
          error.response,
          error.request
        );
        this.setState({ uploading: false });
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
  sendMessage = (ticket_id) => {
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
        textMessage: "",
      });
    } else {
      alert("Empty message cannot send");
      if (!(this.state.textMessage == "\n" || this.state.textMessage == "\r")) {
        console.log("Message has enter");
        var someText = this.state.textMessage.replace(/(\r\n|\n|\r)/gm, "");
        console.log("REMOVE ENTER ", someText);
        this.setState({
          textMessage: someText,
        });
      }
    }
  };
  //////////////////////////////////////////// METHODS FOR ERM /////////////////////////////////////////////////////////
  handleHealthID = (event) => {
    this.setState({
      h_id: event.target.value,
    });
  };
  handleR_id = (event) => {
    this.setState({
      registraton_id: event.target.value,
    });
  };
  handlePatientName = (event) => {
    this.setState({
      patientName: event.target.value,
    });
  };
  handleGender = (event) => {
    this.setState({
      gender: event.target.value,
    });
  };
  handleContact = (event) => {
    this.setState({
      contact: event.target.value,
    });
  };
  handleEmail = (event) => {
    this.setState({
      email: event.target.value,
    });
  };
  handle_FUP = (event) => {
    this.setState({
      follow_up: event.target.value,
    });
  };
  ///////////////////////////// Disease ///////////////////////////////////////////
  addTreatment = (event) => {
    console.log("ADD_____", this.state.treatment_arr.length);
    this.setState((prevState) => ({
      treatment_arr: [
        ...prevState.treatment_arr,
        { treatment: "", key: this.state.treatment_arr.length },
      ],
    }));
  };
  deleteTreatment = (event) => {
    console.log("DELETE Disease INDEX ", event);
    this.setState(
      {
        treatment_arr: this.state.treatment_arr.filter((item, index) => {
          return index !== event;
        }),
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
        this.setState((prevState) => ({
          treatment_arr: temp,
        }));
      }
    });
  };
  ////////////////////////////////////// Disease //////////////////////////////////////////

  ////////////////////////// Complaints & Symptoms /////////////////////////////////////////
  add_complaints = (event) => {
    // this.Form_scrollToBottom();
    console.log("add_complaints _____", this.state.complaints_symptoms.length);
    this.setState((prevState) => ({
      complaints_symptoms: [
        ...prevState.complaints_symptoms,
        {
          Symptoms: "",
          Duration: "",
        },
      ],
    }));
    this.setState({
      s_valid: false,
      d_valid: false,
    });
  };
  delete_complaints = (event) => {
    this.setState(
      {
        complaints_symptoms: this.state.complaints_symptoms.filter(
          (item, index) => {
            return index !== event;
          }
        ),
      },
      () => {
        if (this.state.complaints_symptoms.length === 0) {
          this.setState(
            {
              s_valid: true,
              d_valid: true,
            },
            () =>
              console.log("Lenggth 0", this.state.s_valid, this.state.d_valid)
          );
        }
      }
    );
    // this.state.treatment_arr.splice(this.state.treatment_arr.length, 0);
  };
  complaints_add_array = (event, key) => {
    console.log("complaints_symptoms Name ---- ", event, " at Index ", key);
    this.state.complaints_symptoms[key].Symptoms = event;
    var temp = this.state.complaints_symptoms;
    console.log("complaints_symptoms 1 ", temp);
    this.state.complaints_symptoms.filter((item, index) => {
      if (index === key) {
        this.setState((prevState) => ({
          complaints_symptoms: temp,
        }));
      }
    });
  };
  complaints_add_array1 = (event, key) => {
    console.log("complaints_symptoms Name ---- ", event, " at Index ", key);
    this.state.complaints_symptoms[key].Duration = event;
    var temp = this.state.complaints_symptoms;
    console.log("complaints_symptoms 2 ", temp);
    this.state.complaints_symptoms.filter((item, index) => {
      if (index === key) {
        this.setState((prevState) => ({
          complaints_symptoms: temp,
        }));
      }
    });
  };

  ////////////////////////// Complaints & Symptoms /////////////////////////////////////////

  ////////////////////////// Provisional Diagnosis /////////////////////////////////////////

  addPD = (event) => {
    // this.Form_scrollToBottom();
    console.log("ADD_____", this.state.treatment_arr.length);
    this.setState((prevState) => ({
      provisional_diagnosis: [
        ...prevState.provisional_diagnosis,
        { Value: "", Type: 1 },
      ],
    }));
    this.setState({
      pd_valid: false,
    });
  };
  deletePD = (event) => {
    console.log("DELETE Disease INDEX ", event);
    this.setState(
      {
        provisional_diagnosis: this.state.provisional_diagnosis.filter(
          (item, index) => {
            return index !== event;
          }
        ),
      },
      () => {
        if (this.state.complaints_symptoms.length === 0) {
          this.setState(
            {
              pd_valid: true,
            },
            () => console.log("Lenggth 0", this.state.pd_valid)
          );
        }
      }
    );
    // this.state.treatment_arr.splice(this.state.treatment_arr.length, 0);
  };
  PD_arr = (event, key) => {
    console.log("Treatment_arr Name ---- ", event, " at Index ", key);
    this.state.provisional_diagnosis[key].Value = event;
    var temp = this.state.provisional_diagnosis;
    console.log("Treatment_arr  ", temp);
    this.state.provisional_diagnosis.filter((item, index) => {
      if (index === key) {
        this.setState((prevState) => ({
          provisional_diagnosis: temp,
        }));
      }
    });
  };

  ////////////////////////// Provisional Diagnosis /////////////////////////////////////////

  ////////////////////////// Lab Tests /////////////////////////////////////////
  add_lab_test = (event) => {
    // this.Form_scrollToBottom();
    console.log("add_complaints _____", this.state.lab_tests.length);
    this.setState((prevState) => ({
      lab_tests: [
        ...prevState.lab_tests,
        {
          Value: "",
          Type: 0,
        },
      ],
    }));
    this.setState({
      test_valid: false,
    });
  };
  delete_lab_test = (event) => {
    console.log("DELETE lab_tests INDEX ", event);
    this.setState(
      {
        lab_tests: this.state.lab_tests.filter((item, index) => {
          return index !== event;
        }),
      },
      () => {
        if (this.state.complaints_symptoms.length === 0) {
          this.setState(
            {
              test_valid: true,
            },
            () => console.log("Lenggth 0", this.state.test_valid)
          );
        }
      }
    );
    // this.state.treatment_arr.splice(this.state.treatment_arr.length, 0);
  };
  tests_add_array = (event, key) => {
    console.log("lab_tests Name ---- ", event, " at Index ", key);
    this.state.lab_tests[key].Value = event;
    var temp = this.state.lab_tests;
    console.log("lab_tests  ", temp);
    this.state.lab_tests.filter((item, index) => {
      if (index === key) {
        this.setState((prevState) => ({
          lab_tests: temp,
        }));
      }
    });
  };

  ////////////////////////// Lab Tests /////////////////////////////////////////

  addPrescriptionRow = () => {
    // this.Form_scrollToBottom();
    // console.log("addPrescriptionRow === ", this.state.add_Prescription.length);
    this.setState((prevState) => ({
      add_Prescription: [
        ...prevState.add_Prescription,
        {
          Medicine: "",
          Dosage: "",
          Route: "",
          Frequency: "",
          Duration: "",
        },
      ],
    }));
    this.setState({
      m_valid: false,
      do_valid: false,
      r_valid: false,
      f_valid: false,
      du_valid: false,
    });
  };
  add_description = (event, key) => {
    this.state.add_Prescription[key].Medicine = event;
    var temp = this.state.add_Prescription;
    this.state.add_Prescription.filter((item, index) => {
      if (index === key) {
        this.setState({
          add_Prescription: temp,
        });
      }
    });
  };
  add_dosage = (event, key) => {
    // console.log("add_dosage ---- ", event, " at Index ", key);
    this.state.add_Prescription[key].Dosage = event;
    var temp = this.state.add_Prescription;
    this.state.add_Prescription.filter((item, index) => {
      if (index === key) {
        this.setState({
          add_Prescription: temp,
        });
      }
    });
  };
  add_period = (event, key) => {
    // console.log("add_period ---- ", event, " at Index ", key);
    this.state.add_Prescription[key].Route = event;
    var temp = this.state.add_Prescription;
    this.state.add_Prescription.filter((item, index) => {
      if (index === key) {
        this.setState({
          add_Prescription: temp,
        });
      }
    });
  };
  add_dosageForm = (event, key) => {
    // console.log("add_dosageForm ---- ", event, " at Index ", key);
    this.state.add_Prescription[key].Frequency = event;
    var temp = this.state.add_Prescription;
    this.state.add_Prescription.filter((item, index) => {
      if (index === key) {
        this.setState({
          add_Prescription: temp,
        });
      }
    });
  };
  add_comment = (event, key) => {
    // console.log("add_comment ---- ", event, " at Index ", key);
    this.state.add_Prescription[key].Duration = event;
    var temp = this.state.add_Prescription;
    this.state.add_Prescription.filter((item, index) => {
      if (index === key) {
        this.setState({
          add_Prescription: temp,
        });
      }
    });
  };

  delete_Prescription = (index) => {
    console.log("Delete Prescription Index ==== ", index);
    this.setState(
      {
        delete_Prescription_key: index,
      },
      () => {
        if (this.state.complaints_symptoms.length === 0) {
          this.setState(
            {
              m_valid: true,
              do_valid: true,
              r_valid: true,
              f_valid: true,
              du_valid: true,
            },
            () => console.log("Lenggth 0", this.state.test_valid)
          );
        }
      }
    );
  };
  delete_Prescription_Row = (key) => {
    this.setState(
      {
        add_Prescription: this.state.add_Prescription.filter((item, index) => {
          return index !== key;
        }),
      },
      () => {
        if (this.state.complaints_symptoms.length === 0) {
          this.setState(
            {
              m_valid: true,
              do_valid: true,
              r_valid: true,
              f_valid: true,
              du_valid: true,
            },
            () => console.log("Lenggth 0", this.state.test_valid)
          );
        }
      }
    );
  };
  state = {
    value: 1,
  };

  onConsultationChange = (e) => {
    if (this.state.consultation === e) {
      this.setState({
        consultation: "",
      });
    } else {
      console.log("consultation checked", e.target.value);
      this.setState({
        consultation: e.target.value,
      });
    }
  };
  onLaboratoryChange = (e) => {
    if (this.state.laboratory === e) {
      this.setState({
        laboratory: "",
      });
    } else {
      console.log("laboratory checked", e.target.value);
      this.setState({
        laboratory: e.target.value,
      });
    }
  };
  onMastersChange = (e) => {
    if (this.state.masters === e) {
      this.setState({
        masters: "",
      });
    } else {
      console.log("laboratory checked", e.target.value);
      this.setState({
        masters: e.target.value,
      });
    }
  };
  onSettingsChange = (e) => {
    if (this.state.settings === e) {
      this.setState({
        settings: "",
      });
    } else {
      console.log("settings checked", e.target.value);
      this.setState({
        settings: e.target.value,
      });
    }
  };
  addItem = () => {
    this.setState({
      data: [
        ...this.state.data,
        {
          id: this.state.data.length,
          value: Math.random() * 100,
        },
      ],
    });
  };
  switch_to_video = () => {
    console.log("switch_to_video", this.state.show_video);
    this.setState({
      show_video: !this.state.show_video,
    });
  };
  handleimageUpload = (info) => {
    console.log("INFO ", info);
    if (info.file.status === "done") {
      getBase64(info.file.originFileObj, (imageUrl) =>
        this.setState({
          file_uri: imageUrl,
        })
      );
    }
  };
  submit_form = () => {
    const {
      h_id,
      patientName,
      gender,
      contact,
      email,
      follow_up,
      complaints_symptoms,
      provisional_diagnosis,
      add_Prescription,
      lab_tests,
      s_required,
      d_required,
      pd_required,
      test_required,
      m_required,
      do_required,
      r_required,
      f_required,
      du_required,
      s_valid,
      d_valid,
      pd_valid,
      test_valid,
      m_valid,
      do_valid,
      r_valid,
      f_valid,
      du_valid,
      cs_NE,
      pd_NE,
      pr_NE,
      lt_NE,
    } = this.state;
    if (patientName != "") {
      if (email != "") {
        if (gender != "Gender" || gender != "") {
          if (contact != "") {
            this.setState({
              error_email: false,
              error_contact: false,
              valid_contact: true,
              error_gender: false,
              error_pname: false,
            });
            if (
              (s_valid || s_required === "") &&
              (d_valid || d_required === "") &&
              (pd_valid || pd_required === "") &&
              (test_valid || test_required === "") &&
              (m_valid || m_required === "") &&
              (do_valid || do_required === "") &&
              (r_valid || r_required === "") &&
              (f_valid || f_required === "") &&
              (du_valid || du_required === "")
            ) {
              console.log("ALL VALUES FILLED");
              this.postData();
            } else {
              console.log(
                "ALL VALUES Not FILLED",
                s_valid,
                d_valid,
                pd_valid,
                test_valid,
                m_valid,
                do_valid,
                r_valid,
                f_valid,
                du_valid
              );
              if (complaints_symptoms.length > 0) {
                for (let i = 0; i < complaints_symptoms.length; ++i) {
                  if (complaints_symptoms[i].Symptoms === "") {
                    this.setState({
                      s_required: i,
                      s_valid: false,
                    });
                    this.form.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                  } else if (complaints_symptoms[i].Duration === "") {
                    this.setState({
                      d_required: i,
                      d_valid: false,
                    });
                    this.form.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                  } else {
                    this.setState(
                      {
                        d_required: "",
                        s_valid: true,
                        d_valid: true,
                      },
                      () =>
                        console.log("CS NOT NUll", d_required, s_valid, d_valid)
                    );
                  }
                }
              }
              if (provisional_diagnosis.length > 0) {
                for (let i = 0; i < provisional_diagnosis.length; ++i) {
                  if (provisional_diagnosis[i].Value === "") {
                    this.setState({
                      pd_required: i,
                      pd_valid: false,
                    });
                    this.form.scrollTo({
                      top: 200,
                      left: 0,
                      behavior: "smooth",
                    });
                  } else {
                    this.setState({
                      pd_required: "",
                      pd_valid: true,
                    });
                  }
                }
              }
              if (add_Prescription.length > 0) {
                for (let i = 0; i < add_Prescription.length; ++i) {
                  if (add_Prescription[i].Medicine === "") {
                    this.setState({
                      m_required: i,
                      m_valid: false,
                    });
                    this.form.scrollTo({
                      top: 400,
                      left: 0,
                      behavior: "smooth",
                    });
                  } else if (add_Prescription[i].Dosage === "") {
                    this.setState({
                      do_required: i,
                      do_valid: false,
                    });
                    this.form.scrollTo({
                      top: 400,
                      left: 0,
                      behavior: "smooth",
                    });
                  } else if (add_Prescription[i].Route === "") {
                    this.setState({
                      r_required: i,
                      r_valid: false,
                    });
                    this.form.scrollTo({
                      top: 400,
                      left: 0,
                      behavior: "smooth",
                    });
                  } else if (add_Prescription[i].Frequency === "") {
                    this.setState({
                      f_required: i,
                      f_valid: false,
                    });
                    this.form.scrollTo({
                      top: 400,
                      left: 0,
                      behavior: "smooth",
                    });
                  } else if (add_Prescription[i].Duration === "") {
                    this.setState({
                      du_required: i,
                      du_valid: false,
                    });
                    this.form.scrollTo({
                      top: 400,
                      left: 0,
                      behavior: "smooth",
                    });
                  } else {
                    console.log("All Values filled");
                    this.setState({
                      m_required: "",
                      do_required: "",
                      r_required: "",
                      f_required: "",
                      du_required: "",
                      m_valid: true,
                      do_valid: true,
                      r_valid: true,
                      f_valid: true,
                      du_valid: true,
                    });
                    // if (
                    //   add_Prescription[i].Medicine != "" &&
                    //   add_Prescription[i].Dosage != "" &&
                    //   add_Prescription[i].Route != "" &&
                    //   add_Prescription[i].Frequency != "" &&
                    //   add_Prescription[i].Duration != ""
                    // )
                  }
                }
              }
              if (lab_tests.length > 0) {
                for (let i = 0; i < lab_tests.length; ++i) {
                  if (lab_tests[i].Value === "") {
                    this.setState({
                      test_required: i,
                    });
                  } else {
                    this.setState({
                      test_required: "",
                    });
                  }
                }
              }
            }
            // var data = {
            //   Name: patientName,
            //   Contact: contact,
            //   HealthID: h_id,
            //   Gender: gender,
            //   Email: email,
            //   Followup: follow_up,
            //   ComplaintsSymptoms: complaints_symptoms,
            //   Diagnosis: provisional_diagnosis,
            //   Prescriptions: add_Prescription,
            //   Tests: lab_tests,
            //   TicketId: this.props.ticket.id,
            // };
            // console.log("Data === ", data);
            // try {
            //   axios
            //     .post(window.Tak_API + "api/EHR", data)
            //     .then((r) => {
            //       // if (r.status === 200) {
            //       console.log("Response --- ", r);
            //       // }
            //     })
            //     .catch((c) => {
            //       console.log("EHR error", c);
            //     });
            // } catch (error) {
            //   console.log("EHR Catch Error -- ", error);
            // }
          } else {
            this.setState({
              error_contact: true,
              error_pname: false,
              error_gender: false,
              valid_gender: true,
              valid_contact: false,
              error_email: false,
              valid_email: true,
            });
            this.form.scrollTo({ top: 0, left: 0, behavior: "smooth" });
          }
        } else {
          this.setState({
            error_gender: true,
            error_pname: false,
            valid_pname: true,
            valid_gender: false,
            error_email: false,
            valid_email: true,
          });
          this.form.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        }
      } else {
        this.setState({
          error_email: true,
          error_pname: false,
          valid_pname: true,
          valid_email: false,
        });
        this.form.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      }
    } else {
      this.setState({
        error_pname: true,
        valid_pname: false,
      });
      // this.form.scrollTo({ behavior: "smooth" }, 0, 0);
      this.form.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };
  postData = () => {
    const key = "upload";
    message.loading({
      content: "Uploading EHR ...",
      key,
      duration: 1000,
    });
    const {
      h_id,
      patientName,
      gender,
      contact,
      email,
      follow_up,
      complaints_symptoms,
      provisional_diagnosis,
      add_Prescription,
      lab_tests,
    } = this.state;
    var data = {
      Name: patientName,
      Contact: contact,
      HealthID: this.props.ticket.healthID,
      Gender: gender,
      Email: email,
      Followup: follow_up,
      ComplaintsSymptoms: complaints_symptoms,
      Diagnosis: provisional_diagnosis,
      Prescriptions: add_Prescription,
      Tests: lab_tests,
      TicketId: this.props.ticket.id,
    };
    console.log("Data === ", data);
    try {
      axios
        .post(window.Tak_API + "api/EHR", data)
        .then((r) => {
          if (r.status === 200) {
            message.success({
              content: "Upload Successfully!",
              key,
              duration: 1,
            });
            this.setState({
              patientName: "",
              gender: "Gender",
              contact: "",
              email: "",
              follow_up: "",
              complaints_symptoms: [],
              provisional_diagnosis: [],
              add_Prescription: [],
              lab_tests: [],
            });
            console.log("Response --- ", r);
          }
        })
        .catch((c) => {
          console.log("EHR error", c);
        });
    } catch (error) {
      console.log("EHR Catch Error -- ", error);
    }
  };

  /////////////////////////////////////////// METHODS FOR ERM ///////////////////////////////////////////////////////////
  render() {
    // console.log('ticket', this.props.ticket);
    const {
      valid_pname,
      valid_email,
      valid_contact,
      valid_gender,
      s_required,
      d_required,
      pd_required,
      test_required,
      m_required,
      do_required,
      r_required,
      f_required,
      du_required,
    } = this.state;
    const fileUploadProps = {
      onRemove: (file) => {},
      beforeUpload: (file) => {
        this.setState(
          {
            file,
            fileName: file.name,
            file_type: file.type,
          },
          () => {
            console.log("file Before", this.state.file);
            // this.customRequest();
          }
        );
        getBase64(file, (imageUrl) => {
          this.setState({
            file_uri: imageUrl,
          });
        });

        return false;
      },

      showUploadList: false,
    };

    return (
      <div className="col-9 chat_instance">
        {/* <div className="container-fluid"> */}
        <div className="row">
          <div className="col">
            <div className="chat_area" style={{ backgroundColor: "#f6f6f8" }}>
              <div className="row">
                <div className="col">
                  <div className="mt-1 patient_Name">
                    {this.props.ticket.patient.username} -{this.props.ticket.id}
                  </div>
                </div>
                <div className="col">
                  <div className="right_bar">
                    <div className="row">
                      {this.state.videoState && this.state.showRemoteVideo ? (
                        <FormControlLabel
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
                      ) : null}
                      {this.state.videoState && !this.state.showRemoteVideo ? (
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
                                .invoke("OnDeclineAudio", this.props.ticket.id)
                                .then(() => {
                                  this.props.ticket.AudioChatRequest = false;
                                  if (this.state.videoState) {
                                    this.setState({
                                      showRemoteVideo: false,
                                      videoState: false,
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
                            <VideocamOffRoundedIcon style={{ color: "red" }} />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                      <Tooltip title="Close Chat">
                        <IconButton
                          onClick={() => {
                            this.setState(
                              {
                                closeTicketID: this.props.ticket.id,
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
                              color: "red",
                            }}
                          />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
              <div className="block-example border-bottom border-primary"></div>
              <div className="row">
                <div className="col">
                  <div
                    className={
                      this.state.file_uri != "" ? "with_img" : "middle"
                    }
                    id="style-1"
                  >
                    <div
                      ref={(el) => {
                        this.lastMessage = el;
                      }}
                      id="style-1"
                      style={{
                        overflowX: "hidden",
                        overflowY: "auto",
                        maxHeight:
                          this.state.file_uri != "" ? "320px" : "420px",
                      }}
                    >
                      {this.props.close_Ticket ? this.removeTicket() : null}
                      {this.props.ticket.messages.length === 0 &&
                      !this.state.showRemoteVideo ? (
                        <div className="no_message show_hide">
                          <Chip label="No messages" />
                        </div>
                      ) : null}
                      <Zoom
                        in={this.state.show_video}
                        style={{
                          transitionDelay: this.state.show_video
                            ? "200ms"
                            : "0ms",
                        }}
                      >
                        <div className="video_show">
                          <div className="col">
                            <div
                              style={{
                                // marginLeft: "10px",
                                position: "relative",
                              }}
                            >
                              <video
                                ref={this.localVideo}
                                style={{
                                  // border: '1px solid #000',
                                  position: "absolute",
                                  bottom: "0px",
                                  right: "0px",
                                  width: "100px",
                                  height: "80px",
                                  display: this.state.showRemoteVideo
                                    ? "block"
                                    : "none",
                                }}
                                autoPlay
                                muted
                              ></video>
                              <div>
                                <video
                                  ref={this.remoteVideo}
                                  style={{
                                    width: "200px",
                                    height: "100%",
                                    // border: "1px solid #000",
                                    // background: "#777",

                                    display: this.state.showRemoteVideo
                                      ? "block"
                                      : "none",
                                  }}
                                  autoPlay
                                ></video>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Zoom>
                      {this.props.ticket.messages.map((message, index) => {
                        var isSenderPatient =
                          message.senderID === this.props.ticket.patientID;

                        return (
                          <Row key={index}>
                            <Col>
                              {isSenderPatient ? (
                                <div className={"message_right"}>
                                  {message.file == null ? message.text : null}

                                  {message.file != null &&
                                  message.file.fileType === 0 ? (
                                    <img
                                      alt=""
                                      style={{
                                        width: "200px",
                                        padding: "5px",
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
                                <div className={"message_left"}>
                                  {message.file == null ? message.text : null}
                                  {message.file != null &&
                                  message.file.fileType === 0 ? (
                                    <img
                                      alt=""
                                      style={{
                                        width: "200px",
                                        padding: "5px",
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
              {this.state.file_uri != "" ? (
                <div className="preview_img">
                  <div className="close_btn">
                    <img
                      onClick={() => {
                        this.setState({
                          file: "",
                          fileName: "",
                          file_type: "",
                          file_uri: "",
                        });
                      }}
                      alt=""
                      style={{
                        width: "20px",
                        height: "20px",
                        marginTop: "-8px",
                        marginRight: "-8px",
                        zIndex: 9999,
                      }}
                      src={close}
                    />
                  </div>
                  {this.state.file_type === "image/png" ||
                  this.state.file_type === "image/jpg" ||
                  (this.state.file_type === "image/jpeg" &&
                    this.state.file_type != "") ? (
                    <img
                      alt=""
                      style={{
                        width: "120px",
                        height: "100px",
                        marginTop: "-12px",
                        borderRadius: "8px",
                      }}
                      src={this.state.file_uri}
                    />
                  ) : (
                    <img
                      alt=""
                      style={{
                        width: "120px",
                        height: "100px",
                        marginTop: "-12px",
                        borderRadius: "8px",
                      }}
                      src={doc}
                    />
                  )}

                  {this.state.uploading ? (
                    <div className="img_send">
                      <Spinner color="primary" size="sm" />
                    </div>
                  ) : (
                    <div
                      className="img_send"
                      onClick={() => this.customRequest()}
                    >
                      Send
                    </div>
                  )}
                </div>
              ) : null}
              {/* <div className="container-fluid"> */}
              {/* <div className="row"> */}
              {this.state.disconnect_TicketID === this.props.ticket.id ? (
                <div className="session_expired show_hide">
                  <Chip
                    // variant="outlined"
                    className="show_hide"
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
                      rowsMax="3"
                      placeholder="Type Here"
                      style={{
                        fontSize: "10px",
                      }}
                      className="show_hide"
                      fullWidth={true}
                      value={this.state.textMessage}
                      onChange={(text) =>
                        this.setState({ textMessage: text.target.value })
                      }
                    />
                  </div>
                  <div className="col-3">
                    <Upload {...fileUploadProps}>
                      <Tooltip arrow title="Upload File/Image">
                        <IconButton
                          size="small"
                          color="secondary"
                          aria-label="add an alarm"
                        >
                          <AttachFileIcon />
                        </IconButton>
                      </Tooltip>
                    </Upload>

                    <Tooltip arrow title="Send Message">
                      <IconButton
                        onClick={() => {
                          console.log("Send MEssage");
                          this.sendMessage(this.props.ticket.id);
                        }}
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
                    </Tooltip>
                  </div>
                </div>
              )}
              {/* </div> */}
            </div>
            {/* </div> */}
          </div>

          <div className="col-6">
            <div
              ref={(el) => {
                this.form = el;
              }}
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
              <div className="block-example border-bottom border-primary"></div>
              <Form>
                {/* ///////////////// Customer Details ///////////////// */}
                <div className="tab_heading show_hide">Customer Details :</div>
                {/* <Divider /> */}
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
                      <Input
                        type="text"
                        name="health_id"
                        className="show_hide"
                        id="health_id"
                        disabled={true}
                        value={this.props.ticket.healthID}
                        placeholder="Health ID #"
                        style={{ fontSize: "12px" }}
                        invalid={this.state.error_hid}
                        onChange={(e) => this.handleHealthID(e)}
                      />
                    </div>

                    {/* <div className="col">
                      <Input
                        type="text"
                        name="registeration_id"
                        id="registeration_id"
                        className="show_hide"
                        placeholder="Registration #"
                        style={{ fontSize: "12px" }}
                        invalid={this.state.errorR_id}
                        onChange={(e) => this.handleR_id(e)}
                      />
                    </div> */}
                    <div className="col">
                      <Input
                        type="text"
                        required={true}
                        valid={valid_pname}
                        name="mr/mrs"
                        className="show_hide"
                        id="mr/mrs"
                        placeholder="Mr/Mrs"
                        style={{ fontSize: "12px" }}
                        invalid={this.state.error_pname}
                        onChange={(e) => this.handlePatientName(e)}
                        value={this.state.patientName}
                      />
                    </div>
                    <div className="col">
                      <Input
                        type="email"
                        required={true}
                        className="show_hide"
                        valid={valid_email}
                        name="email"
                        id="email"
                        placeholder="Email-Address"
                        style={{ fontSize: "12px" }}
                        invalid={this.state.error_email}
                        onChange={(e) => this.handleEmail(e)}
                        value={this.state.email}
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
                        className="show_hide"
                        id="gender"
                        placeholder="Gender"
                        style={{ fontSize: "12px" }}
                        valid={valid_gender}
                        invalid={this.state.error_gender}
                        value={this.state.gender}
                        onChange={(e) => this.handleGender(e)}
                      >
                        <option>Gender</option>
                        <option>Male</option>
                        <option>Female</option>
                      </Input>
                    </div>
                    <div className="col">
                      <Input
                        type="text"
                        required={true}
                        name="contact"
                        className="show_hide"
                        id="contact"
                        placeholder="Contact"
                        style={{ fontSize: "12px" }}
                        valid={valid_contact}
                        invalid={this.state.error_contact}
                        onChange={(e) => this.handleContact(e)}
                        value={this.state.contact}
                      />
                    </div>
                    <div className="col"> </div>
                  </div>
                </FormGroup>
                {/* ///////////////// Customer Details ///////////////// */}
                {/* ///////////////// Complaints & Symptoms ///////////////// */}
                {/* <Divider /> */}
                <div
                  className="row"
                  style={{
                    backgroundColor: "#ffff",
                    borderBottomWidth: "1px",
                    borderColor: "#0d74bc",
                  }}
                >
                  <div className="col">
                    <div className="tab_heading show_hide">
                      Complaints & Symptoms :
                    </div>
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
                          <AddCircleRoundedIcon style={{ color: "#0b9444" }} />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                </div>
                <div className="block-example border-bottom border-primary"></div>
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
                                paddingRight: "6px",
                              }}
                            >
                              <InputGroup>
                                {s_required === index ? (
                                  <Input
                                    type="text"
                                    name="symptoms"
                                    className="show_hide"
                                    id="symptoms"
                                    value={
                                      this.state.complaints_symptoms[index]
                                        .Symptoms
                                    }
                                    placeholder="Symptoms"
                                    style={{ fontSize: "12px" }}
                                    invalid={true}
                                    onChange={(text) =>
                                      this.complaints_add_array(
                                        text.target.value,
                                        index
                                      )
                                    }
                                  />
                                ) : (
                                  <Input
                                    type="text"
                                    name="symptoms"
                                    className="show_hide"
                                    id="symptoms"
                                    value={
                                      this.state.complaints_symptoms[index]
                                        .Symptoms
                                    }
                                    placeholder="Symptoms"
                                    style={{ fontSize: "12px" }}
                                    onChange={(text) =>
                                      this.complaints_add_array(
                                        text.target.value,
                                        index
                                      )
                                    }
                                  />
                                )}
                                {d_required === index ? (
                                  <Input
                                    type="text"
                                    name="duration"
                                    id="duration"
                                    className="show_hide"
                                    value={
                                      this.state.complaints_symptoms[index]
                                        .Duration
                                    }
                                    invalid={true}
                                    placeholder="Duration"
                                    style={{ fontSize: "12px" }}
                                    onChange={(text) =>
                                      this.complaints_add_array1(
                                        text.target.value,
                                        index
                                      )
                                    }
                                  />
                                ) : (
                                  <Input
                                    type="text"
                                    name="duration"
                                    id="duration"
                                    className="show_hide"
                                    value={
                                      this.state.complaints_symptoms[index]
                                        .Duration
                                    }
                                    placeholder="Duration"
                                    style={{ fontSize: "12px" }}
                                    onChange={(text) =>
                                      this.complaints_add_array1(
                                        text.target.value,
                                        index
                                      )
                                    }
                                  />
                                )}
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
                      <Tooltip title="Add Provisional Diagnosis">
                        <IconButton
                          onClick={() => this.addPD()}
                          color="secondary"
                          aria-label="add an alarm"
                        >
                          <AddCircleRoundedIcon style={{ color: "#0b9444" }} />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                </div>
                {/* <Divider /> */}
                <div className="block-example border-bottom border-primary"></div>
                <div style={{ marginTop: "16px" }}></div>
                <div className="row" style={{ marginBottom: "16px" }}>
                  {this.state.provisional_diagnosis.length == 0
                    ? null
                    : this.state.provisional_diagnosis.map((val, index) => {
                        return (
                          <div className="col-6" key={index}>
                            <FormGroup
                              style={{
                                paddingLeft: "6px",
                                paddingRight: "6px",
                              }}
                            >
                              <InputGroup>
                                {pd_required === index ? (
                                  <Input
                                    type="text"
                                    name="add_PD"
                                    id="addPD"
                                    invalid={true}
                                    className="show_hide"
                                    value={
                                      this.state.provisional_diagnosis[index]
                                        .Value
                                    }
                                    placeholder="Diagnosis"
                                    style={{ fontSize: "12px" }}
                                    onChange={(text) =>
                                      this.PD_arr(text.target.value, index)
                                    }
                                  />
                                ) : (
                                  <Input
                                    type="text"
                                    name="add_PD"
                                    id="addPD"
                                    className="show_hide"
                                    value={
                                      this.state.provisional_diagnosis[index]
                                        .Value
                                    }
                                    placeholder="Diagnosis"
                                    style={{ fontSize: "12px" }}
                                    onChange={(text) =>
                                      this.PD_arr(text.target.value, index)
                                    }
                                  />
                                )}
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
                {/* <Divider /> */}
                <div className="row" style={{ backgroundColor: "#ffff" }}>
                  <div className="col">
                    <div className="tab_heading show_hide">Prescription :</div>
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
                          <AddCircleRoundedIcon style={{ color: "#0b9444" }} />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                </div>
                {/* <Divider /> */}
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
                        {/* <th className="show_hide" style={{ fontSize: "12px" }}>
                          S.No
                        </th> */}
                        <th className="show_hide" style={{ fontSize: "12px" }}>
                          Medicine
                        </th>
                        <th className="show_hide" style={{ fontSize: "12px" }}>
                          Dosage
                        </th>
                        <th className="show_hide" style={{ fontSize: "12px" }}>
                          Route
                        </th>
                        <th className="show_hide" style={{ fontSize: "12px" }}>
                          Frequency
                        </th>
                        <th className="show_hide" style={{ fontSize: "12px" }}>
                          Duration
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.add_Prescription.length > 0
                        ? this.state.add_Prescription.map((item, index) => {
                            return (
                              <tr key={index}>
                                <th scope="select">
                                  <Tooltip
                                    className="show_hide"
                                    title="Delete Provisional Diagnosis"
                                  >
                                    <IconButton
                                      style={{ width: "10px" }}
                                      size="small"
                                      onClick={() =>
                                        this.delete_Prescription_Row(index)
                                      }
                                      color="secondary"
                                      aria-label="add an alarm"
                                    >
                                      <RemoveCircleOutlineIcon
                                        style={{ color: "red" }}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                </th>
                                {/* <th scope="row" style={{ fontSize: "10px" }}>
                                  {this.state.add_Prescription[index].sr}
                                </th> */}
                                <td>
                                  {m_required === index ? (
                                    <Input
                                      type="text"
                                      name="description"
                                      id="description"
                                      className="show_hide"
                                      style={{ fontSize: "10px" }}
                                      invalid={true}
                                      value={
                                        this.state.add_Prescription[index]
                                          .medicine
                                      }
                                      onChange={(text) =>
                                        this.add_description(
                                          text.target.value,
                                          index
                                        )
                                      }
                                    />
                                  ) : (
                                    <Input
                                      type="text"
                                      name="description"
                                      id="description"
                                      invalid={false}
                                      className="show_hide"
                                      style={{ fontSize: "10px" }}
                                      value={
                                        this.state.add_Prescription[index]
                                          .medicine
                                      }
                                      onChange={(text) =>
                                        this.add_description(
                                          text.target.value,
                                          index
                                        )
                                      }
                                    />
                                  )}
                                </td>
                                <td>
                                  {do_required === index ? (
                                    <Input
                                      type="text"
                                      name="dosage"
                                      id="dosage"
                                      className="show_hide"
                                      style={{ fontSize: "10px" }}
                                      invalid={true}
                                      value={
                                        this.state.add_Prescription[index]
                                          .dosage
                                      }
                                      onChange={(text) =>
                                        this.add_dosage(
                                          text.target.value,
                                          index
                                        )
                                      }
                                    />
                                  ) : (
                                    <Input
                                      type="text"
                                      name="dosage"
                                      id="dosage"
                                      invalid={false}
                                      className="show_hide"
                                      style={{ fontSize: "10px" }}
                                      value={
                                        this.state.add_Prescription[index]
                                          .dosage
                                      }
                                      onChange={(text) =>
                                        this.add_dosage(
                                          text.target.value,
                                          index
                                        )
                                      }
                                    />
                                  )}
                                </td>
                                <td>
                                  {r_required === index ? (
                                    <Input
                                      type="text"
                                      name="route"
                                      id="route"
                                      className="show_hide"
                                      invalid={true}
                                      style={{ fontSize: "10px" }}
                                      value={
                                        this.state.add_Prescription[index].route
                                      }
                                      onChange={(text) =>
                                        this.add_period(
                                          text.target.value,
                                          index
                                        )
                                      }
                                    />
                                  ) : (
                                    <Input
                                      type="text"
                                      name="route"
                                      id="route"
                                      invalid={false}
                                      className="show_hide"
                                      style={{ fontSize: "10px" }}
                                      value={
                                        this.state.add_Prescription[index].route
                                      }
                                      onChange={(text) =>
                                        this.add_period(
                                          text.target.value,
                                          index
                                        )
                                      }
                                    />
                                  )}
                                </td>
                                <td>
                                  {f_required === index ? (
                                    <Input
                                      type="text"
                                      name="frequency"
                                      id="frequency"
                                      className="show_hide"
                                      style={{ fontSize: "10px" }}
                                      invalid={true}
                                      value={
                                        this.state.add_Prescription[index]
                                          .frequency
                                      }
                                      onChange={(text) =>
                                        this.add_dosageForm(
                                          text.target.value,
                                          index
                                        )
                                      }
                                    />
                                  ) : (
                                    <Input
                                      type="text"
                                      name="frequency"
                                      id="frequency"
                                      invalid={false}
                                      className="show_hide"
                                      style={{ fontSize: "10px" }}
                                      value={
                                        this.state.add_Prescription[index]
                                          .frequency
                                      }
                                      onChange={(text) =>
                                        this.add_dosageForm(
                                          text.target.value,
                                          index
                                        )
                                      }
                                    />
                                  )}
                                </td>
                                <td>
                                  {du_required === index ? (
                                    <Input
                                      type="text"
                                      name="duration"
                                      className="show_hide"
                                      id="duration"
                                      style={{ fontSize: "10px" }}
                                      invalid={true}
                                      value={
                                        this.state.add_Prescription[index]
                                          .duration
                                      }
                                      onChange={(text) =>
                                        this.add_comment(
                                          text.target.value,
                                          index
                                        )
                                      }
                                    />
                                  ) : (
                                    <Input
                                      type="text"
                                      name="duration"
                                      className="show_hide"
                                      id="duration"
                                      valid={true}
                                      style={{ fontSize: "10px" }}
                                      value={
                                        this.state.add_Prescription[index]
                                          .duration
                                      }
                                      onChange={(text) =>
                                        this.add_comment(
                                          text.target.value,
                                          index
                                        )
                                      }
                                    />
                                  )}
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
                {/* <Divider /> */}
                <div className="row" style={{ backgroundColor: "#ffff" }}>
                  <div className="col">
                    <div className="tab_heading show_hide">Lab Tests :</div>
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
                          <AddCircleRoundedIcon style={{ color: "#0b9444" }} />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                </div>
                {/* <Divider /> */}
                <div className="block-example border-bottom border-primary"></div>
                <div style={{ marginTop: "16px" }}></div>
                <div className="row">
                  {this.state.lab_tests.length == 0
                    ? null
                    : this.state.lab_tests.map((val, index) => {
                        return (
                          <div className="col-6" key={index}>
                            <FormGroup
                              style={{
                                paddingLeft: "6px",
                                paddingRight: "6px",
                              }}
                            >
                              <InputGroup>
                                {test_required === index ? (
                                  <Input
                                    type="text"
                                    name="labtest"
                                    className="show_hide"
                                    id="labtest"
                                    value={this.state.lab_tests[index].Value}
                                    placeholder={"Test # " + index}
                                    invalid={true}
                                    style={{ width: "250px", fontSize: "12px" }}
                                    onChange={(text) =>
                                      this.tests_add_array(
                                        text.target.value,
                                        index
                                      )
                                    }
                                  />
                                ) : (
                                  <Input
                                    type="text"
                                    name="labtest"
                                    className="show_hide"
                                    id="labtest"
                                    value={this.state.lab_tests[index].Value}
                                    placeholder={"Test # " + index}
                                    style={{ width: "250px", fontSize: "12px" }}
                                    onChange={(text) =>
                                      this.tests_add_array(
                                        text.target.value,
                                        index
                                      )
                                    }
                                  />
                                )}
                                <InputGroupAddon addonType="append">
                                  <Tooltip title="Remove Lab Test">
                                    <IconButton
                                      onClick={() =>
                                        this.delete_lab_test(index)
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
                {/* //////////////////// LAB TESTS ///////////////// */}

                {/* //////////////////////////// Follow Up ////////////////// */}
                {/* <Divider /> */}
                <div className="tab_heading show_hide">Follow up :</div>
                {/* <Divider /> */}
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
                      id="outlined-multiline-static"
                      label="Follow up"
                      className="show_hide"
                      multiline
                      rows="4"
                      variant="outlined"
                      style={{ width: "100%" }}
                      invalid={this.state.error_fup}
                      onChange={(e) => this.handle_FUP(e)}
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
                      2.&nbsp;&nbsp;&nbsp;&nbsp; Treatment/Prescription is only
                      applicable for non-emergency medical cases{" "}
                    </div>
                    <div
                      className="show_hide"
                      style={{ fontSize: "12px", color: "#0d74bc" }}
                    >
                      3.&nbsp;&nbsp;&nbsp;&nbsp; This is Second Opinion service.
                      It does not replace your primary care Doctor.
                    </div>
                  </div>
                </div>
                {/* /////////////////////// DISCLAIMER ///////////////////// */}

                {/* ////////////////////// SUBMIT ////////////////////// */}
                <div className="submit_btn">
                  <Button
                    onClick={this.submit_form}
                    variant="contained"
                    color="primary"
                    className="show_hide"
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
        {/* </div> */}
      </div>
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
  ermModal,
};

const mapStateToProps = (state) => {
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
    close,
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(ChatInstance);
