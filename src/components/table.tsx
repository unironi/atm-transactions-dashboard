import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { DataGridPro } from '@mui/x-data-grid-pro/DataGridPro';
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

  useEffect(() => {
    async function fetchData() {
      try {
        const atmlist = await fetchAtmList();

        const limit = 2000; // setting an approximate limit so we dont load 46k transactions while testing
        let collected = 0;
        const newTransactions: any[] = [];

        // looping through atm list to find transactions on each atm
        for (const atm of atmlist) {
          if (collected >= limit) break;

          const atmTransactions = (await fetchAtmIdTransactions(atm.id)).txn ?? [];

          if (atmTransactions.length > 0) {
            const numTransactions = Math.min(limit - collected, atmTransactions.length);
            newTransactions.push(...atmTransactions.slice(0, numTransactions));
            collected += numTransactions;
          }
        }

        setTransactionData(newTransactions);

      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  // filtering fields for table display
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
    <>
    
    <Box sx={{ height: 600, width: 1 }}>
      <DataGrid // DataGridPro allows multiple filters but this is a pro feature
        disableColumnSelector
        columns={columns}
        rows={rows}
        showToolbar
      />
    </Box>
    </>
    
  );
}
