import React from 'react';
import axios from 'axios';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const KEY_RANGE_UL = 110000;

class UsefulLinks extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        dataRows: [],
        loadError: ""
      };
    }
  
    async loadContent() {
      try {
        const res = await axios.get(this.props.svcUrl + "/usefullinks/byconf", {
          params: {
            ulLinkConf: this.props.byconf
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
      console.log("render useful links by conf = "+this.props.byconf);
      let rowsRes = [];
      if (this.state.loadError !== "") {
        rowsRes.push(<TableRow key={KEY_RANGE_UL}><TableCell key="1">Error: {this.state.loadError}</TableCell></TableRow>);
      } else {
        if (this.state.dataRows.data) {
          for (let i=0; i<this.state.dataRows.data.length; i++) {  
            rowsRes.push(
              <>
                &nbsp;[
                <a 
                  key={KEY_RANGE_UL + this.state.dataRows.data[i].lid}
                  href={this.state.dataRows.data[i].ulUrl}
                >
                {this.state.dataRows.data[i].ulDesc}
                </a>  
                ]&nbsp;          
              </>
            );
          }; 
        } else rowsRes.push(<TableRow key={KEY_RANGE_UL}><TableCell key="1">loading ...</TableCell></TableRow>);
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

  export default UsefulLinks;