import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { fetchAtmList, fetchAtmIdTransactions } from '../services/atmService';

export default function TransactionTable() {

  const columns = [
    { field: 'date', headerName: 'Date', flex: 1 },
    { field: 'atmId', headerName: 'ATM ID', flex: 1 },
    { field: 'customerPan', headerName: 'Customer PAN', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 2 },
    { field: 'code', headerName: 'Code', flex: 1 },
  ];

  const [transactionData, setTransactionData] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);

  // loop through atm list IDs
  // call getTransactionListWithPost using rq object
  // {
  //   "atmId": [i],
  //   "date0": 1,
  //   "date1": 2147483647
  // }
  // it will get all transactions with that atm id throughout all of time
  // for date column, we can access the atmlist object's "ts" field, object.ts (timestamp in milliseconds) https://www.epochconverter.com
  // for atm id, use object.id / txn[i].atm.id
  // for customerPAN, txn[i].pan
  // for description, txn[i].hst.descr, .ttp.descr, .state.descr, check if there's .err and .withdrawalError
  // dont know what code column is meant to be- some 6-7 digit code, date, or transaction num?

  useEffect(() => {
    async function fetchData() {
      try {
        const atmlist = await fetchAtmList();
        
        for (const atm of atmlist) {
          const atmTransactions = (await fetchAtmIdTransactions(atm.id)).txn ?? [];
          if (atmTransactions.length > 0) {
            console.log(atmTransactions)
            setTransactionData(prev => [...prev, ...atmTransactions]);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const filteredRows = transactionData.map((t, i) => ({
      id: i,
      date: t.devTime,
      atmId: t.atm?.id,
      customerPan: t.pan ?? '****',
      description: t.hst?.descr || t.ttp?.descr || t.state?.descr || '',
      code: '',
    }));
    setRows(filteredRows);
  }, [transactionData]);
  

  return (
    <Box sx={{ height: 600, width: 1 }}>
      <DataGrid
        disableColumnSelector
        columns={columns}
        rows={rows}
        showToolbar
      />
    </Box>
  );
}
