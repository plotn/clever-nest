import React from 'react';
import Cookies from 'universal-cookie';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import ConfLocations from './ConfLocations.js';
import UsefulLinks from './UsefulLinks.js';

const cookies = new Cookies();
const KEY_RANGE_CONF = 10000;

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
        errorDialogOpen: false,
        showUsefulLinks: false
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

    handleUsefulLinks(i) {
      let ul = this.state.showUsefulLinks;
      this.setState({ showUsefulLinks: !ul });        
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
      let confCount = 0;
      if (this.state.loadError !== "") {
        if (!((this.state.loadError.includes("no-auth")) || (this.state.loadError.includes("401"))))
          rowsRes.push(<div key={KEY_RANGE_CONF}>Error: {this.state.loadError}</div>);
        return (
          <div>
            <div>
              {rowsRes}
            </div>
            <TextField helperText="login" autoFocus
              defaultValue={this.state.login} onChange={event => this.changeLogin(event.target.value)}></TextField>&nbsp;
            <TextField helperText="password" type="password" onChange={event => this.changePassw(event.target.value)}
                onKeyPress={(ev) => {
                  if (ev.key === 'Enter') {
                    this.handleLogin(0);
                    ev.preventDefault();
                  }
                }}
              ></TextField>
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
      // } else {
      //   rowsRes.push(<div key={KEY_RANGE_CONF}>Error: {this.state.loadError}</div>);
      //   return (
      //     <div>
      //       {rowsRes}
      //     </div>
      //   );
      // }
      } else {
        if (this.state.dataRows.data) {
          for (let j=0; j<this.state.dataRows.data.length; j++) {  
            if (""+this.state.dataRows.data[j].cid === ""+this.state.curConfIdx) {
              curConf = this.state.dataRows.data[j];
            }
          };
          confCount = 0;
          for (let j=0; j<this.state.dataRows.data.length; j++) {  
            if (curConf == null) curConf = this.state.dataRows.data[j];
            confCount ++;
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
      let uls = "loading...";
      if (this.state.showUsefulLinks) {
        //console.log("show uls");
        uls = <UsefulLinks byconf={curConf.cid} svcUrl={this.props.svcUrl} 
          needRefresh={this.state.needRefresh} token={this.state.token}></UsefulLinks>;
      } else 
        uls = "";
      let rowsResC = [];
      if (confCount !== 1) rowsResC.push(
        <div key="1002">
          Config
          (selected:&nbsp; 
          <span style={{ color: sColor}}>
          {desc}
          </span>
          ):
          {rowsRes}
        </div>
      );   
      return (
        <React.Fragment>
          {rowsResC}
          <div>
            <Button key="1000" onClick={i => this.handleClickRefresh(i)}>Refresh all</Button>
            <Button key="1001" onClick={i => this.handleLogout(i)}>Logout</Button>
            <Button key="1002" onClick={i => this.handleUsefulLinks(i)}>Useful links</Button>
          </div> 
          <div>
            {uls}
            {locs} 
          </div>
        </React.Fragment>
      );
    }
  }
  
  export default ConfChoose;