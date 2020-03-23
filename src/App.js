import React from 'react';
import logo from './logo.svg';
//import ReactDOM from 'react-dom';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
//import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';

import axios from 'axios';
import './App.css';
import urls from './config/urls.json';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const KEY_RANGE_CONF = 10000;
const KEY_RANGE_LOC = 40000;
const KEY_RANGE_LOC_TR = 50000;
const KEY_RANGE_DEV = 60000;
const KEY_RANGE_DEV_TR = 70000;
const KEY_RANGE_URLS = 80000;
const KEY_RANGE_DIALOGS = 90000;

// const useStyles = makeStyles(theme => ({
//   formControl: {
//     margin: theme.spacing(1),
//   },
// }));
 
class ConfDevice extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      devState: -1,
      commandLog: "",
      infoStr: "",
      needRefresh: 0,
      infoDialogOpen: false,
      infoDialogText: ""
    };
  }

  handleClick(i, st) {
    let sC = "ON";
    if (st === 0) sC = "OFF";
    let today  = new Date();
    axios.get(this.props.svcUrl + "/espeasy/control", {
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
          infoStr: today.toLocaleString()+" Ok (command "+sC+")"
        });
      },
      error => {
        this.setState({
          devState: -1,
          infoStr: today.toLocaleString()+" Error accessing device (command "+sC+")"
        });
      }
    );
  }

  handleClickStatus(i) {
    let today  = new Date();
    axios.get(this.props.svcUrl + "/espeasy/control", {
      params: {
        Command: "STATUS",
        dId: this.props.device.did,
        domovenokFormat: false,
        aLinkConf: this.props.byconf
      }, 
      headers: { Authorization: this.props.token } 
    }).then(
      result => {
        this.setState({
          devState: result.data.state,
          commandLog: result.data.log,
           infoStr: today.toLocaleString()+" Ok (command status)"
        });
      },
      error => {
        let today  = new Date();
        this.setState({
          devState: -1,
          infoStr: today.toLocaleString()+" Error accessing device (checking status) "
        });
      }
    );  
  }

  handleClickCommands(i) {
    let sStatus = this.props.svcUrl + "/espeasy/control?Command=[ON|OFF|STATUS]&dId="
      + this.props.device.did + "&aLinkConf=" + this.props.byconf + "&domovenokFormat=[true|false]&password=[pwd]";
      this.setState({
        infoDialogOpen: true,
        infoDialogText: sStatus
      });    
  }

  componentDidMount() {
  }
  
  componentDidUpdate() {
    if ((this.props.needRefresh>0) && (this.state.needRefresh !== this.props.needRefresh)) {
      this.setState({
        needRefresh: this.props.needRefresh
      });
      this.handleClickStatus(this);
    }  
  }

  handleInfoClose(i) {
    this.setState({
      infoDialogOpen: false
    });
  };

  render() {
    console.log("render dev "+this.props.device.did+" by conf = "+this.props.byconf);
    const st = this.state.devState;
    let sState = "undefined";
    let sColor = "black";
    if (st === 1) { 
      sState = "On"; 
      sColor = "green"; 
    }  
    if (st === 0) {
      sState = "Off";
      sColor = "red"; 
    }
    console.log(JSON.stringify(this.props.device));
    console.log(st);
    let info = this.state.infoStr;    
    let sColorI = "black";
    if (info.includes(" Ok")) {
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
      info = this.props.device.dlastStateWhen;
    }

    let rowsRes = [];
    let ii = 0; 
    rowsRes.push(
      <TableCell 
        key={ii}>
        {this.props.device.dname}
      </TableCell>
    );
    ii++;
    rowsRes.push(
      <TableCell 
        key={ii}
        style={{ color: sColor}}>
        State: {sState}
      </TableCell>
    );
    ii++;
    rowsRes.push(
      <TableCell
        key={ii}>
        <Button onClick={i => this.handleClick(i,1)}>On</Button>
        <Button onClick={i => this.handleClick(i,0)}>Off</Button>
        <Button onClick={i => this.handleClickStatus(i)}>Check status</Button>
        <Button onClick={i => this.handleClickCommands(i)}>...</Button>
      </TableCell>   
    );
    ii++;
    rowsRes.push(   
      <TableCell 
        key={ii}
        style={{ color: sColorI}}>
        {info}
      </TableCell>   
    );
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
    return (rowsRes);
  }
}

class ConfLocation extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      dataRows: [],
      loadError: ""
    };
  }

  async loadContent() {
    try {
      const res = await axios.get(this.props.svcUrl + "/devices/byloc", {
        params: {
          aLinkConf: this.props.byconf,
          dLinkLoc: this.props.loc.lid
        },
        headers: { Authorization: this.props.token }
      });
      const resData = res;
      this.setState({ 
        dataRows: resData,
        loadError: "" 
      }); 
    } catch (err) {
      this.setState({ loadError: err.message });
      console.log(JSON.stringify(err));
    }    
  }

  componentDidMount() {
    this.loadContent();
  }

  render() {
    console.log("render loc "+this.props.loc.lid+" by conf = "+this.props.byconf);
    let rowsRes = [];
    if (this.state.loadError !== "") {
      rowsRes.push(<TableRow key={KEY_RANGE_LOC_TR}><TableCell key="1">Error: {this.state.loadError}</TableCell></TableRow>);
    } else {
      rowsRes.push( 
        <TableRow
          key={KEY_RANGE_LOC_TR + this.props.loc.lid}>
          <TableCell  
            colSpan={4} 
            className="conf-loc" onClick={this.props.onClick}>
            <Typography variant="h5" gutterBottom>
              {this.props.loc.lname} - {this.props.loc.lvalue}
            </Typography> 
          </TableCell>
        </TableRow>
      );
      
      if (this.state.dataRows.data) {
        for (let i=0; i<this.state.dataRows.data.length; i++) {
          rowsRes.push(
              <TableRow 
                key={KEY_RANGE_DEV_TR + this.state.dataRows.data[i].did}>
              <ConfDevice 
                key={KEY_RANGE_DEV + this.state.dataRows.data[i].did}
                device={this.state.dataRows.data[i]} 
                byconf={this.props.byconf}
                svcUrl={this.props.svcUrl} 
                needRefresh={this.props.needRefresh}
                token={this.props.token}>
              </ConfDevice>
              </TableRow>
          )
        }; 
      } else rowsRes.push(<TableRow key={KEY_RANGE_DEV_TR}><TableCell key="1">loading ...</TableCell></TableRow>);
    }
    return rowsRes;
  }

}

class ConfLocations extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      dataRows: [],
      loadError: ""
    };
  }

  async loadContent() {
    try {
      const res = await axios.get(this.props.svcUrl + "/locations/byconf", {
        params: {
          lLinkConf: this.props.byconf
        },
        headers: { Authorization: this.props.token }
      });
      const resData = res;
      this.setState({ 
        dataRows: resData,
        loadError: "" 
      }); 
    } catch (err) {
      this.setState({ loadError: err.message });
      console.log(JSON.stringify(err));
    }    
  }

  componentDidMount() {
    this.loadContent();
  }

  render() {
    console.log("render locs by conf = "+this.props.byconf);
    let rowsRes = [];
    if (this.state.loadError !== "") {
      rowsRes.push(<TableRow key={KEY_RANGE_LOC}><TableCell key="1">Error: {this.state.loadError}</TableCell></TableRow>);
    } else {
      if (this.state.dataRows.data) {
        for (let i=0; i<this.state.dataRows.data.length; i++) {  
          rowsRes.push(
            <ConfLocation 
              key={KEY_RANGE_LOC + this.state.dataRows.data[i].lid}
              loc={this.state.dataRows.data[i]}
              byconf={this.props.byconf}
              svcUrl={this.props.svcUrl} 
              needRefresh={this.props.needRefresh}
              token={this.props.token}>
            </ConfLocation>
          );
        }; 
      } else rowsRes.push(<TableRow key={KEY_RANGE_LOC}><TableCell key="1">loading ...</TableCell></TableRow>);
    }
    return (
      <Paper>
      <Table aria-label="spanning table">
        <TableHead>
        </TableHead>
        <TableBody>
          {rowsRes}
        </TableBody>
      </Table>
      </Paper>
    );
  }
}

class ConfChoose extends React.Component {
  
  constructor(props) {
    super(props);
    let logn = cookies.get('login');      
    let tokn = cookies.get('token');      
    if (!logn) logn = "";          
    if (!tokn) tokn = "";          
    this.state = {
      curConfIdx: -2,
      needRefresh: 0,
      dataRows: [],
      loadError: "",
      login: logn,
      passw: "",
      token: tokn,
      errorDialogOpen: false
    };
  } 

  handleClick(i, st) {
    this.setState({
      curConfIdx: st,
      needRefresh: 0
    });
    cookies.set('confSelected', st, { path: '/' });
    console.log("cookie: "+cookies.get('confSelected'));
  }

  handleClickRefresh(i) {
    let nr = this.state.needRefresh + 1;
    this.setState({
      needRefresh: nr
    });
  }

  async loadContent(doauth) {
    console.log("loadcont "+doauth);
    if (doauth) {
      try {
        const res = await axios.get(this.props.svcUrl + "/login", {
          params: {
            username: this.state.login,
            password: this.state.passw
          }
        });
        const resData = res;
        if (resData.data) {
          this.setState({ token: resData.data.token, errorDialogOpen: false });
          cookies.set('login', this.state.login, { path: '/' });
          cookies.set('token', resData.data.token, { path: '/' });
        }
      } catch (err) {
        this.setState({ loadError: err.message, errorDialogOpen: true });
        //alert(err.message);
        console.log(JSON.stringify(err));
        return;
      }    
    }
    try {
      let token = cookies.get('token');
      if (!token) {
        this.setState({ loadError: "no-auth" });
      } else {
        const res = await axios.get(this.props.svcUrl + "/confs/all", { headers: { Authorization: token } });
        const resData = res;
        let s = window.location.href;
        let iFound = -2;
        if (resData.data) {
          for (let j=0; j<resData.data.length; j++) {  
            var arrChHref = resData.data[j].ccheckHrefs.split(";");
            let iFound2 = -2;
            arrChHref.forEach(el => { 
              if ((el !== "") && (s.includes(el.trim()))) {
                iFound2 = resData.data[j].cid;
              }
            });
            if (iFound2 >= 0) iFound = iFound2; 
          }
        }    
        let ccI = this.state.curConfIdx;
        if (iFound>=0) ccI = iFound;
        console.log("conf cookie: "+cookies.get('confSelected'));
        if (cookies.get('confSelected')) ccI = cookies.get('confSelected');
        this.setState({ 
          curConfIdx: ccI,
          dataRows: resData,
          loadError: "" 
        }); 
      }
    } catch (err) {
      this.setState({ loadError: err.message });
      console.log(JSON.stringify(err));
    }    
  }

  componentDidMount() {
    console.log("mount");
    this.loadContent(false);
  }

  changeLogin(text) {
    this.setState({login: text});
  }

  changePassw(text) {
    this.setState({passw: text});
  }

  handleLogin(i) {
    cookies.set('token', "", { path: '/' });
    this.loadContent(true);
  }

  handleLogout(i) {
    cookies.set('token', "", { path: '/' });
    this.setState({ passw: "", token: "" });        
    this.loadContent(false);
  }

  handleErrorClose(i) {
    this.setState({
      errorDialogOpen: false
    });
  };

  render() {
    console.log("render");
    let rowsRes = [];  
    let curConf = null;
    //let curConfIdx = this.state.curConfIdx;
    if (this.state.loadError !== "") {
      if ((this.state.loadError.includes("no-auth")) || (this.state.loadError.includes("401"))) {
        return (
          <div>
            <TextField helperText="login" autoFocus
              defaultValue={this.state.login} onChange={event => this.changeLogin(event.target.value)}></TextField>&nbsp;
            <TextField helperText="password" type="password" onChange={event => this.changePassw(event.target.value)}></TextField>
            <Button 
              onClick={i => this.handleLogin(i)}>Login
            </Button>
            <Dialog
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
              open={this.state.errorDialogOpen}
              onClose={i => this.handleErrorClose(i)}
            >
              <DialogTitle id="alert-dialog-title">Error message</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  {this.state.loadError}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={i => this.handleErrorClose(i)} color="primary" autoFocus>
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        );  
      } else {
        rowsRes.push(<div key={KEY_RANGE_CONF}>Error: {this.state.loadError}</div>);
        return (
          <div>
            {rowsRes}
          </div>
        );
      }
    } else {
      if (this.state.dataRows.data) {
        for (let j=0; j<this.state.dataRows.data.length; j++) {  
          if (""+this.state.dataRows.data[j].cid === ""+this.state.curConfIdx) {
            curConf = this.state.dataRows.data[j];
          }
        };
        for (let j=0; j<this.state.dataRows.data.length; j++) {  
          if (curConf == null) curConf = this.state.dataRows.data[j];
          rowsRes.push(
            <Button 
              key={KEY_RANGE_CONF + this.state.dataRows.data[j].cid} 
              onClick={i => this.handleClick(i,this.state.dataRows.data[j].cid)}>{this.state.dataRows.data[j].cdesc}
            </Button>
          );
        }; 
      } else rowsRes.push(<div key={KEY_RANGE_CONF}>loading ...</div>);
    }
    let desc = "loading...";
    let locs = "loading...";
    let sColor = "black";
    if (curConf != null) {
      desc = curConf.cdesc;
      sColor = "maroon";
      locs = <ConfLocations byconf={curConf.cid} svcUrl={this.props.svcUrl} 
        needRefresh={this.state.needRefresh} token={this.state.token}></ConfLocations>;
    }    
    return (
      <>
      <div>
        Config
        (selected:&nbsp; 
        <span style={{ color: sColor}}>
        {desc}
        </span>
        ):
        {rowsRes}
      </div>
      <div>
        <Button key="1000" onClick={i => this.handleClickRefresh(i)}>Refresh all</Button>
        <Button key="1001" onClick={i => this.handleLogout(i)}>Logout</Button>
      </div> 
      <div>
        {locs} 
      </div>
      </>
    );
  }
}

class SvcUrlChoose extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      curUrlIdx: -2,
      needRefresh: 0
    };
  } 

  handleClick(i, st) {
    this.setState({
      curUrlIdx: st,
      needRefresh: 0
    });
    cookies.set('svcUrlSelected', st, { path: '/' });
    console.log("cookie: "+cookies.get('svcUrlSelected'));
  }

  render() {
    let rowsRes = [];  
    let curUrl = null;
    let curUrlIdx = this.state.curUrlIdx;
    if (cookies.get('svcUrlSelected')) curUrlIdx = cookies.get('svcUrlSelected');
    for (let j=0; j<this.props.urls.length; j++) {  
      if (""+this.props.urls[j].urlId === ""+curUrlIdx) {
        curUrl = this.props.urls[j];
      }
    };
    for (let j=0; j<this.props.urls.length; j++) {  
      if (curUrl == null) curUrl = this.props.urls[j];
      rowsRes.push(
          <Button 
            key={KEY_RANGE_URLS + this.props.urls[j].urlId} 
            onClick={i => this.handleClick(i, this.props.urls[j].urlId)}>{this.props.urls[j].urlDesc}
          </Button>
        );
    }; 
    let desc = "loading...";
    let sColor = "black";    
    if (curUrl != null) {
      desc = curUrl.urlDesc+" ";
      sColor = "maroon";
      rowsRes.push(
        <div key={KEY_RANGE_URLS}>
          <ConfChoose svcUrl={curUrl.urlAddr}></ConfChoose>
        </div>
      );
    } else {
      rowsRes.push(
        <div key={KEY_RANGE_URLS}>
          Choose proper service URL...
        </div>
      );
    }   
    return (
      <div>
        URL
        (selected:&nbsp; 
        <span style={{ color: sColor}}>
        {desc}
        </span>
        ):
        {rowsRes}
      </div>
    );
  }
}

function App() {

  //const classes = useStyles();
  //const [value, setValue] = React.useState('cleverNest');
  //let svcUrl = "http://localhost:8081"

  return (
    <div className="App">
      <div>
        <img src={logo} alt={"logo"}/> 
        <Typography variant="h4" gutterBottom>
          Plotn Clever Nest app
        </Typography>
      </div>
      <div>
      <SvcUrlChoose urls={urls}></SvcUrlChoose>
      </div>      
    </div>
  );
}

export default App;
