import React from 'react';
import logo from './logo.svg';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import SvcUrlChoose from './components/SvcUrlChoose.js';

import './App.css';
import urls from './config/urls.json';
 
function App() {

  return (
    <div className="App">
      <div>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell align='right' width='45%'>
                <img src={logo} alt={"logo"}/> 
              </TableCell>    
              <TableCell align='left' width='55%'>
                <Typography variant="h5" gutterBottom>
                  Plotn Clever Nest app
                </Typography>
              </TableCell>  
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div>
      <SvcUrlChoose urls={urls}></SvcUrlChoose>
      </div>      
    </div>
  );
}

export default App;
