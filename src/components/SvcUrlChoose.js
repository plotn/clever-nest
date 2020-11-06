import React from 'react';
import Cookies from 'universal-cookie';
import Button from '@material-ui/core/Button';
import ConfChoose from './ConfChoose.js';

const cookies = new Cookies();
const KEY_RANGE_URLS = 80000;

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
      if (curUrl   == null) {
        let arrHints = this.props.urls[j].urlHint.split(";");
        let cUrl = null;
        arrHints.forEach(el => { 
              if ((el !== "") && (window.location.href.includes(el.trim()))) {
                cUrl = this.props.urls[j];
              }
        });
        curUrl = cUrl;
      }
    };
    for (let j=0; j<this.props.urls.length; j++) {  
      if (curUrl == null) curUrl = this.props.urls[j];
      let sColorI = 'darkgray';
      if (curUrl.urlId === this.props.urls[j].urlId) sColorI = 'green';
      rowsRes.push(
          <Button 
            style={{ color: sColorI}}
            key={KEY_RANGE_URLS + this.props.urls[j].urlId} 
            onClick={i => this.handleClick(i, this.props.urls[j].urlId)}>{this.props.urls[j].urlDesc}
          </Button>
        );
    }; 
    let desc = " (loading...) ";
    if (curUrl != null) {
      desc = "";
      rowsRes.push(
        <div key={KEY_RANGE_URLS}>
          <ConfChoose svcUrl={curUrl.urlAddr}></ConfChoose>
        </div>
      );
      // rowsRes.push(
      //   <div key={KEY_RANGE_URLS}>
      //   </div>
      // );

    } else {
      rowsRes.push(
        <div key={KEY_RANGE_URLS}>
          Choose proper service URL...
        </div>
      );
    }   
    return (
      <div>
        URL{desc}:
        {rowsRes}
      </div>
    );
  }
}

export default SvcUrlChoose;