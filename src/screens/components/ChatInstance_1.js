import React from "react";
import { Row, Col, Alert } from "antd";
import { connect } from "react-redux";
import { Input, Layout, Upload, message } from "antd";
// import { Button } from "reactstrap";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import CancelIcon from "@material-ui/icons/Cancel";
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
      recordURL: ""
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
    this.localStream.getTracks().forEach(function(track) {
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

  render() {
    // console.log('ticket', this.props.ticket);

    const fileUploadProps = {
      onRemove: file => {},
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

    return (
      <div>
        <Row className="row">
          <Col className="col-9">
            <div
              ref={el => {
                this.lastMessage = el;
              }}
              className={"chatInstance"}
              style={{ height: "300px", overflow: "auto" }}
            >
              {
                <Row>
                  <Col span={4} offset={0}>
                    <div className={"message-info"}>
                      You're talking to {this.props.ticket.patient.username}
                    </div>
                  </Col>
                </Row>
              }
              {this.props.close_Ticket ? this.removeTicket() : null}
              {this.props.ticket.messages.map((message, index) => {
                console.log("Ticket Message ----- ", message);
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
                                width: "300px",
                                padding: "5px"
                              }}
                              src={
                                window.API_URL + "/images/" + message.file.path
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
                                window.API_URL + "/images/" + message.file.path
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
                                window.API_URL + "/images/" + message.file.path
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
                                window.API_URL + "/images/" + message.file.path
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
            <div>
              {this.state.disconnect_TicketID === this.props.ticket.id ? (
                <span style={{ alignItems: "center" }}>
                  Your Chat Session Expired
                </span>
              ) : (
                <Row>
                  <Col span={16}>
                    <TextArea
                      allowClear={true}
                      style={{
                        marginLeft: "5px",
                        maxWidth: "100%",
                        textAlign: "justify",
                        justifyContent: "center"
                      }}
                      value={this.state.textMessage}
                      placeholder="Type your reply here"
                      onChange={text =>
                        this.setState({ textMessage: text.target.value })
                      }
                      // autoSize={minRows: 1, maxRows: 2 }
                      onPressEnter={() =>
                        this.sendMessage(this.props.ticket.id)
                      }
                      // onPressEnter={text => {
                      //   if (text.target.value !== "") {
                      //     this.props.connection.invoke(
                      //       "message",
                      //       this.props.ticket.id,
                      //       text.target.value
                      //     );
                      //     this.setState({
                      //       textMessage: ""
                      //     });
                      //   }
                      // }}
                    />
                  </Col>
                  <Col span={8}>
                    <Upload {...fileUploadProps}>
                      <IconButton
                        color="primary"
                        aria-label="Upload File/Image"
                      >
                        <AttachFileIcon />
                      </IconButton>
                      {/* <Button
                        outline
                        style={{ fontSize: "12px" }}
                        color="primary"
                      >
                        Select File
                      </Button> */}
                    </Upload>
                  </Col>

                  {/* </div> */}
                </Row>
              )}
            </div>
          </Col>

          <Col className="col-3">
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
                    height: "40vh",
                    // border: "1px solid #000",
                    background: "#777",
                    display: this.state.showRemoteVideo ? "block" : "none"
                  }}
                  autoPlay
                ></video>
              </div>
            </div>
            {/* : null} */}
            <Row>
              <Col>
                {this.state.videoState && !this.state.showRemoteVideo ? (
                  <Button
                    variant="contained"
                    color="primary"
                    style={{ fontSize: "14px" }}
                    onClick={() => {
                      console.log("button");

                      this.props.connection.invoke(
                        "requestVideo",
                        parseInt(this.props.ticket.id)
                      );
                    }}
                  >
                    Start Video Chat
                  </Button>
                ) : null}
              </Col>
              <Col>
                {this.state.showRemoteVideo ? (
                  <Button
                    variant="contained"
                    className={"Btn"}
                    color="danger"
                    style={{ fontSize: "14px" }}
                    onClick={() => {
                      console.log("close video button");
                      this.props.connection
                        .invoke("OnDeclineAudio", this.props.ticket.id)
                        .then(() => {
                          setTimeout(() => {
                            const audio = new Audio(this.state.recordURL);
                            audio.play();
                          }, 1000);
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
                  >
                    Close Video Chat
                  </Button>
                ) : null}
              </Col>
              <Col>
                <IconButton
                  onClick={() => {
                    this.setState(
                      {
                        closeTicketID: this.props.ticket.id
                      },
                      () => {
                        this.props.closeChat(true);
                        setTimeout(() => {
                          console.log("this.props.close", this.props.close);
                        }, 600);
                      }
                    );
                    // this.removeTicket(this.props.ticket.id);
                  }}
                  color="secondary"
                  aria-label="Upload File/Image"
                >
                  <CancelIcon />
                </IconButton>
                {/* <Button
                  color="danger"
                  className={"Btn"}
                  outline
                  style={{ fontSize: "14px" }}
                  onClick={() => {
                    this.setState(
                      {
                        closeTicketID: this.props.ticket.id
                      },
                      () => {
                        this.props.closeChat(true);
                        setTimeout(() => {
                          console.log("this.props.close", this.props.close);
                        }, 600);
                      }
                    );
                    // this.removeTicket(this.props.ticket.id);
                  }}
                >
                  Close Chat
                </Button> */}
              </Col>
            </Row>
          </Col>
          {/* <Col className="col-3">
            <div>ERM</div>
          </Col> */}
        </Row>
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
