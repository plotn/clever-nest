import React from 'react';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import ConfDevice from './ConfDevice.js';

const KEY_RANGE_LOC_TR = 50000;
const KEY_RANGE_DEV = 60000;
const KEY_RANGE_DEV_TR = 70000;

class ConfLocation extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        dataRows: [],
        loadError: "",
        needRefresh: 0,
        groupCommand: 0 // 1 = status, 2 = on, 3 = off
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

    handleClick(grCommand) {
      this.setState({
        groupCommand: grCommand
      });
    }

    render() {
      //console.log("render loc "+this.props.loc.lid+" by conf = "+this.props.byconf);
      let rowsRes = [];
      if (this.state.loadError !== "") {
        rowsRes.push(<TableRow key={KEY_RANGE_LOC_TR}><TableCell key="1">Error: {this.state.loadError}</TableCell></TableRow>);
      } else {
        let sText = this.props.loc.lname;
        let sText2 = this.props.loc.lvalue;
        if (sText !== sText2) sText = sText + " - " + sText2;
        
        let rowsRes2 = [];
        if (this.state.dataRows.data) {
          for (let i=0; i<this.state.dataRows.data.length; i++) {
            rowsRes2.push(
                <ConfDevice key={KEY_RANGE_DEV + this.state.dataRows.data[i].did} 
                  device={this.state.dataRows.data[i]} 
                  byconf={this.props.byconf}
                  svcUrl={this.props.svcUrl} 
                  needRefresh={this.props.needRefresh}
                  token={this.props.token}
                  groupCommand={this.state.groupCommand}>
                </ConfDevice>              
            )
          };
        
          let sColor = "blue";
          if (this.state.dataRows.data.length>0)
            rowsRes.push( 
               <TableRow key={KEY_RANGE_LOC_TR + this.props.loc.lid}>
                 <TableCell>
                   <Grid container spacing={2}>
                   <Card variant="outlined">
                     <CardContent>
                       <Typography gutterBottom variant="h6" component="h2" style={{ color: sColor}}>
                         {sText}
                       </Typography>
                       <Typography>
                         <Button onClick={i => this.handleClick(1)}>
                         STATUS
                         </Button>             
                       </Typography>
                     </CardContent>
                     <CardActions>
                        <Button onClick={i => this.handleClick(2)}>All On</Button>
                        <Button onClick={i => this.handleClick(3)}>All Off</Button>
                     </CardActions>
                   </Card>
                   {rowsRes2}
                   </Grid>                 
                 </TableCell>                  
               </TableRow>  
            );
        } else rowsRes.push(<TableRow key={KEY_RANGE_DEV_TR}><TableCell key="1">loading ...</TableCell></TableRow>);
      }
      return rowsRes;
    }
  
  }
  
  export default ConfLocation;