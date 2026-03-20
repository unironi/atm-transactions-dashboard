import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import Select from '@mui/material/Select';
import { useEffect, useState } from 'react';
import { fetchAtmList, fetchAtmIdTransactions, fetchEmvAidList } from '../services/atmService';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

const columns = [
  { field: 'date', headerName: 'Date', flex: 1 },
  { field: 'atmId', headerName: 'ATM ID', flex: 1 },
  { field: 'customerPan', headerName: 'Customer PAN', flex: 1 },
  { field: 'description', headerName: 'Description', flex: 2 },
  { field: 'code', headerName: 'Code', flex: 1 },
];

export default function TransactionTable() {

  const [transactionData, setTransactionData] = useState<any[]>([]);
  const [aid, setAid] = useState("All");
  const [aidList, setAidList] = useState<string[]>([]);
  const [rows, setRows] = useState<any[]>([]);

  // filtering fields for table display
  function tableRows(data: any[]) {
    return data.map((t, i) => ({
      id: i,
      date: t.devTime,
      atmId: t.atm?.txt,
      customerPan: t.pan ?? '****',
      description: t.hst?.descr || t.ttp?.descr || t.state?.descr || '',
      code: '',
      aid: t.app?.txt,
    }));
  }

  useEffect(() => {
    const allRows = tableRows(transactionData);
    if (aid === "All") {
      setRows(allRows);
    } else {
      setRows(allRows.filter((row) => row.aid === aid));
    }
  }, [transactionData, aid]);
  // fetching transactions
  useEffect(() => {
    async function fetchData() {
      try {
        const atmlist = await fetchAtmList();

        const limit = 20000; // setting an approximate limit so we dont load 20k+ transactions while testing
        let collected = 0;
        const newTransactions: any[] = [];

        // looping through atm list to find transactions on each atm
        for (const atm of atmlist) {
          if (collected >= limit) break;

          const atmTransactions = (await fetchAtmIdTransactions(atm.id)).txn ?? [];
          // console.log(atmTransactions);
          if (atmTransactions.length > 0) {
            const numTransactions = Math.min(limit - collected, atmTransactions.length);
            newTransactions.push(...(atmTransactions.slice(0, numTransactions)));
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
  
  // fetching EMV AID list
  useEffect(() => {
    async function fetchAID() {
      try {
        const data = await fetchEmvAidList();
        setAidList(["All"].concat(...data));
      } catch (err) {
        console.error(err);
      }
    }
    fetchAID();
  }, []);


  function handleAidChange(e: any) {
    const selectedAid = e.target.value as string;
    setAid(selectedAid);
  }
  
  return (
    <>
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="aid-select-label">EMV Chip Aid</InputLabel>
        <Select
          labelId="aid-select-label"
          id="aid-select"
          value={aid}
          label="EMV Chip AID"
          onChange={handleAidChange}
        >
          {aidList.map((aid) => (
              <MenuItem value={aid}>{aid}</MenuItem>
            ))}
        </Select>
      </FormControl>
    </Box>
    
    
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
