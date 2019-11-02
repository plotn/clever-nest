import React from 'react';
import logo from './logo.svg';
import ReactDOM from 'react-dom';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import conf from './config/conf.json';
import axios from 'axios';
import './App.css';

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
  },
}));

class ConfDevice extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      devState: -1,
      commandLog: "",
      infoStr: "",
      needRefresh: 0
    };
  }

  handleClick(i, st) {
    let method = this.props.value.commandOn;
    let sC = "On";
    if (st === 0) {
      method = this.props.value.commandOff;
      sC = "Off";
    }  
    let today  = new Date();
    axios.get(method).then(
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
    axios.get(this.props.value.commandStatus).then(
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

  componentDidMount() {
  //  console.log("dm "+this.props.value.commandOn);
  //  if (this.props.needRefresh>0)
  //    this.handleClickStatus(this);
  }
  
  componentDidUpdate() {
    //console.log("du "+this.props.value.commandOn);
    if ((this.props.needRefresh>0) && (this.state.needRefresh != this.props.needRefresh)) {
      this.setState({
        needRefresh: this.props.needRefresh
      });
      this.handleClickStatus(this);
    }  
  }

  render() {
    //console.log("render dev "+this.props.value.commandOn);
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

    const info = this.state.infoStr;
    let sColorI = "black";
    if (info.includes(" Ok")) {
      sColorI = "green"; 
    } else {
      sColorI = "red"; 
    }

    let rowsRes = [];
    let ii = 0;
    rowsRes.push(
      <TableCell key={ii}>
        {this.props.value.name}
      </TableCell>
    );
    ii++;
    rowsRes.push(
      <TableCell key={ii} style={{ color: sColor}}>
        State: {sState}
      </TableCell>
    );
    ii++;
    rowsRes.push(
      <TableCell key={ii}>
        <Button onClick={i => this.handleClick(i,1)}>On</Button>
        <Button onClick={i => this.handleClick(i,0)}>Off</Button>
        <Button onClick={i => this.handleClickStatus(i)}>Check status</Button>
      </TableCell>   
    );
    ii++;
    rowsRes.push(   
      <TableCell key={ii} style={{ color: sColorI}}>
        {this.state.infoStr}
      </TableCell>   
    );  
    return (rowsRes);
  }
}

function ConfLocation(props) {  
  return (
    <TableCell colSpan={4} key={props.value.id} className="conf-loc" onClick={props.onClick}>
      <Typography variant="h5" gutterBottom>
        {props.value.name}
      </Typography> 
    </TableCell>
  );
}

class ConfLocations extends React.Component {

  renderDev(dev, i, j, nr) {
    //console.log("nr=" + nr);
    return (
      <TableRow key={i*1000+j}>
        <ConfDevice value={dev} key={i*1000+j} needRefresh={nr}></ConfDevice>
      </TableRow>
    );
  }  
  
  renderLoc(i, nr) {
    let rowsRes = [];
    rowsRes.push(
      <TableRow key={i+1}>
        <ConfLocation value={this.props.locations[i]} key={i}>
        </ConfLocation>
      </TableRow>
    );
    for (let j=0; j<this.props.locations[i].devices.length; j++) {
      rowsRes.push(
          this.renderDev(this.props.locations[i].devices[j], i+1, j, nr)
      );
    }
    return (rowsRes);
  }

  render() {
    //console.log("render locs ");
    let rowsRes = [];
    for (let i=0; i<this.props.locations.length; i++) {
      rowsRes.push(this.renderLoc(i, this.props.needRefresh));
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
    this.state = {
      curConfIdx: 0,
      needRefresh: 0
    };
  } 

  handleClick(i, st) {
    this.setState({
      curConfIdx: st,
      needRefresh: 0
    });
  }

  handleClickRefresh(i) {
    let nr = this.state.needRefresh + 1;
    this.setState({
      needRefresh: nr
    });
    //alert(window.location.href);
  }

  componentDidMount() {
    let s = window.location.href;
    let iFound = -1;
    for (let j=0; j<this.props.confs.length; j++) {  
      let curConf = this.props.confs[j];
      for (const al of curConf.checkHrefs) {
        if (s.includes(al.value)) iFound = j;        
      }      
    }
    if (iFound>=0) this.setState({curConfIdx: iFound});
  }

  render() {  
    let rowsRes = [];
    let curConf = null; 
    for (let j=0; j<this.props.confs.length; j++) {  
      rowsRes.push(<Button key={j} onClick={i => this.handleClick(i,j)}>{this.props.confs[j].confDesc}</Button>);
    }
    curConf = this.props.confs[this.state.curConfIdx];
    for (const al of curConf.aliases) {
      for (let i=0; i<curConf.locations.length; i++) {
        for (let ii=0; ii<curConf.locations[i].devices.length; ii++) {
          curConf.locations[i].devices[ii].commandOn=
            curConf.locations[i].devices[ii].commandOn.replace("["+al.name+"]",al.value);
          curConf.locations[i].devices[ii].commandOff=  
            curConf.locations[i].devices[ii].commandOff.replace("["+al.name+"]",al.value);
          curConf.locations[i].devices[ii].commandStatus=  
            curConf.locations[i].devices[ii].commandStatus.replace("["+al.name+"]",al.value);
        }  
      }
    }
    return (
      <>
      <div>
        Select config:
        {rowsRes}
      </div>
      <div>
        Selected: {curConf.confDesc}.
        <Button key={1000} onClick={i => this.handleClickRefresh(i)}>Refresh all</Button>
      </div> 
      <div> 
        <ConfLocations locations={curConf.locations} needRefresh={this.state.needRefresh}></ConfLocations>
      </div>
      </>
    );
  }

}

function App() {

  const classes = useStyles();
  const [value, setValue] = React.useState('cleverNest');

  return (
    <div className="App">
      <div>
        <img src={logo} alt={"logo"}/> 
        <Typography variant="h3" gutterBottom>
          Plotn Clever Nest app
        </Typography>
      </div>
      <div>
      <ConfChoose confs={conf}></ConfChoose>
      </div>
      
    </div>
  );
}

export default App;
