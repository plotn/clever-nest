import React from 'react';
import axios from 'axios';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';

const KEY_RANGE_DIALOGS = 90000;
const KEY_RANGE_DEV_DIV = 100000;

class ConfDevice extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        devState: -1,
        commandLog: "",
        infoStr: "",
        needRefresh: 0,
        groupCommand: 0,
        infoDialogOpen: false,
        infoDialogText: "",
        infoStatusDialogOpen: false,
        infoStatusDialogText: ""
      };
    }
  
    handleClick(i, st) {
      let sC = "ON";
      if (st === 0) sC = "OFF";
      let today  = new Date();
      axios.get(this.props.svcUrl + "/espdevice/control", {
        params: {
          Command: sC,
          dId: this.props.device.did,
          domovenokFormat: false,
          aLinkConf: this.props.byconf
        }, 
        headers: { Authorization: this.props.token } 
      }).then(
        result => {
          this.setState({
            devState: st,
            commandLog: result.data.log,
            infoStr: "Ok",
            infoStatusDialogText: today.toLocaleString()+" Ok (command "+sC+")" 
          });
        },
        error => {
          this.setState({
            devState: -2,
            infoStr: "Error",
            infoStatusDialogText: today.toLocaleString()+" Error accessing device (command "+sC+")"
          });
        }
      );
    }
  
    handleClickStatus(i) {
      let today  = new Date();
      axios.get(this.props.svcUrl + "/espdevice/control", {
        params: {
          Command: "STATUS",
          dId: this.props.device.did,
          domovenokFormat: false,
          aLinkConf: this.props.byconf
        }, 
        headers: { Authorization: this.props.token } 
      }).then(
        result => {
          let stateD = result.data.state;
          if (!stateD) {
            if (result.data.POWER === "ON") stateD = 1; 
            if (result.data.POWER === "OFF") stateD = 0; 
          }  
          this.setState({
            devState: stateD,
            commandLog: result.data.log,
            infoStr: "Ok",
            infoStatusDialogText: today.toLocaleString()+" Ok (command status)"
          });
        },
        error => {
          let today  = new Date();
          this.setState({
            devState: -2,
            infoStr: "Error",
            infoStatusDialogText: today.toLocaleString()+" Error accessing device (checking status) "
          });
        }
      );  
    }
  
    handleClickCommands(i) {
      let sStatus = this.props.svcUrl + "/espdevice/control?Command=[ON|OFF|STATUS]&dId="
        + this.props.device.did + "&aLinkConf=" + this.props.byconf + "&domovenokFormat=[true|false]&password=[pwd]";
        this.setState({
          infoDialogOpen: true,
          infoDialogText: sStatus
        });    
    }
  
    handleClickInfoStatus(i) {
      let sText = this.state.infoStatusDialogText;
      if (!sText) sText = "";
      if (sText === "") {
        sText = this.props.device.dlastStateWhen;
        try {
          var dt = new Date(this.props.device.dlastStateWhen);
          sText = dt.toLocaleString();
        } finally {
          
        }
      }
      this.setState({
        infoStatusDialogOpen: true,
        infoStatusDialogText: sText
      });    
    }
  
    componentDidMount() {
    }
    
    componentDidUpdate() {
      //console.log("upd "+this.state.groupCommand);  
      if (
          ((this.props.needRefresh>0) && (this.state.needRefresh !== this.props.needRefresh))
          ||
          ((this.props.groupCommand === 1) && (this.props.groupCommand !== this.state.groupCommand))
         ) {
        this.setState({
          needRefresh: this.props.needRefresh,
          groupCommand: this.props.groupCommand
        });
        this.handleClickStatus(this);
      }
      if (
          ((this.props.groupCommand === 2) && (this.props.groupCommand !== this.state.groupCommand))
         ) {
        this.setState({
          groupCommand: this.props.groupCommand
        });
        this.handleClick(this.props.device.did, 1);
      } 
      if (
        ((this.props.groupCommand === 3) && (this.props.groupCommand !== this.state.groupCommand))
       ) {
      this.setState({
        groupCommand: this.props.groupCommand
      });
      this.handleClick(this.props.device.did, 0);
    }  
    }
  
    handleInfoClose(i) {
      this.setState({
        infoDialogOpen: false
      });
    };
  
    handleInfoStatusClose(i) {
      this.setState({
        infoStatusDialogOpen: false
      });
    };
  
    render() {
      //console.log("render dev "+this.props.device.did+" by conf = "+this.props.byconf);
      const st = this.state.devState;
      let sState = "?";
      let sColor = "black";
      if (st === 1) { 
        sState = "On"; 
        sColor = "green"; 
      }  
      if (st === 0) {
        sState = "Off";
        sColor = "red"; 
      }
      //console.log(JSON.stringify(this.props.device));
      //console.log(st);
      let info = this.state.infoStr;   
      let sColorI = "black";
      if (info.includes("Ok")) {
        sColorI = "green"; 
      } else {
        sColorI = "red"; 
      }
      if ((this.props.device.dlastState)&&(st === -1)) {
        var devstate = this.props.device.dlastState;
        if (devstate === "1") devstate = "On"
        if (devstate === "ON") devstate = "On"
        if (devstate === "0") devstate = "Off"
        if (devstate === "OFF") devstate = "Off"
        sState = devstate; 
        sColor = "darkgray";
        sColorI = "darkgray";
        info = "info";
      }
  
      let rowsRes = [];
      let ii = 0;
      
      // const styles = {
      //   minWidth: 275
      // }
  
      let sInfo = "";
      if (info) {
        if (sColorI === "red") sState = "ERROR";
        sInfo = <Button style={{ color: sColorI}} onClick={i => this.handleClickInfoStatus(i)}>{sState}</Button>;
      } else sInfo = sState;
  
      let rowsRes2 = [];
      let k = KEY_RANGE_DEV_DIV + this.props.device.did;
      rowsRes2.push(
        <div key={{k}}>
          <CardContent>
            <Typography gutterBottom variant="h6" component="h2">
              {this.props.device.dname}
            </Typography>
            <Typography style={{ color: sColor}}>
              <Button onClick={i => this.handleClickStatus(i)}>
              STATUS:
              </Button>             
              {sInfo}
            </Typography>
          </CardContent>
          <CardActions>
            <Button onClick={i => this.handleClick(i,1)}>On</Button>
            <Button onClick={i => this.handleClick(i,0)}>Off</Button>
            <Button onClick={i => this.handleClickCommands(i)}>...</Button>
          </CardActions>
        </div>
      );
      if ((info) && (sColorI === "red")) {
        rowsRes.push(
          <Card key={ii} variant="outlined" style={{ background: '#e6e6e6'}}> 
          {rowsRes2}    
          </Card> 
        );
      } else {
        if (sState === "On")
          rowsRes.push(
            <Card key={ii} variant="outlined" style={{ background: '#ccffcc'}}> 
            {rowsRes2}    
            </Card> 
          );
        else if (sState === "Off")  
          rowsRes.push(
            <Card key={ii} variant="outlined" style={{ background: '#ffcccc'}}> 
            {rowsRes2}    
            </Card> 
          ) 
        else
          rowsRes.push(
            <Card key={ii} variant="outlined"> 
            {rowsRes2}    
            </Card> 
          );  
      }
      
      ii++;  
      rowsRes.push(   
        <Dialog
          key={KEY_RANGE_DIALOGS + ii}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          open={this.state.infoDialogOpen}
          onClose={i => this.handleInfoClose(i)}
        >
          <DialogTitle id="alert-dialog-title">Raw http commands</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {this.state.infoDialogText}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={i => this.handleInfoClose(i)} color="primary" autoFocus>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      );  
      ii++;
      rowsRes.push(   
        <Dialog
          key={KEY_RANGE_DIALOGS + ii}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          open={this.state.infoStatusDialogOpen}
          onClose={i => this.handleInfoStatusClose(i)}
        >
          <DialogTitle id="alert-dialog-title">Status info</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {this.state.infoStatusDialogText}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={i => this.handleInfoStatusClose(i)} color="primary" autoFocus>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      );  
      return (rowsRes);
    }
  }
  
  export default ConfDevice;