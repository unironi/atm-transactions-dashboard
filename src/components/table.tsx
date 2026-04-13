/* eslint-disable @typescript-eslint/no-explicit-any */
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import Select from '@mui/material/Select';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAtmList, fetchAtmIdTransactions, fetchEmvAidList, parseDevtime } from '../services/atmService';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';

// table columns
const columns = [
  { field: 'date', headerName: 'Date', flex: 1 },
  { field: 'atmId', headerName: 'ATM ID', flex: 1 },
  { field: 'customerPan', headerName: 'Customer PAN', flex: 1 },
  { field: 'description', headerName: 'Description', flex: 2 },
  { field: 'code', headerName: 'Code', flex: 1 },
];

// date range will be formatted 16 digit value (first 8 for first date, last 8 for second date)
function formatDateRangeValue(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16); // strip non-digits

  const formatDate = (part: string) => {
    if (part.length <= 2) return part; // only month provided
    if (part.length <= 4) return `${part.slice(0, 2)}/${part.slice(2)}`; // only month and day
    return `${part.slice(0, 2)}/${part.slice(2, 4)}/${part.slice(4, 8)}`; // mm/dd/yyyy
  };

  const first = formatDate(digits.slice(0, 8));
  const second = formatDate(digits.slice(8));

  return second ? `${first} - ${second}` : first; // if there is no second date, then first date should still be valid search filter
}

// split date1 - date2
function parseDateRange(dateRange: string): { first: Date | null, second: Date | null } {
  const parts = dateRange.split(' - ');
  if (parts.length !== 2) return { first: null, second: null };

  const firstDate = new Date(parts[0]);
  const secondDate = new Date(parts[1]);

  return {
    first: isNaN(firstDate.getTime()) ? null : firstDate,
    second: isNaN(secondDate.getTime()) ? null : secondDate,
  };
}

export default function TransactionTable() {

  const [transactionData, setTransactionData] = useState<any[]>([]);
  const [aid, setAid] = useState("All");
  const [aidList, setAidList] = useState<string[]>([]);
  const [dateInput, setDateInput] = useState<string>("");
  const [dateInputEntered, setDateInputEntered] = useState<string>("");
  const [serial, setSerial] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const allRows = tableRows(transactionData);

  // filtering fields for table display
  function tableRows(data: any[]) {
    return data.map((t, i) => ({
      id: i,
      date: parseDevtime(String(t.devTime)).toLocaleDateString(),
      atmId: t.atm?.txt,
      customerPan: t.pan ?? '****',
      description: t.hst?.descr || t.ttp?.descr || t.state?.descr || '',
      code: '',
      aid: t.app?.txt,
      ref: t.ref,
    }));
  }

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
        setLoading(false);

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

  // handle changes to date input


  function handleDateInputKeyDown(e: any) {
    if (e.key == "Enter") {
      e.preventDefault();
      setDateInputEntered(dateInput);
    }
  }

  // using callback to resolve laggy input
  const handleDateInputChange = useCallback((e: any) => {
    const formatted = formatDateRangeValue(e.target.value);
    setDateInput(formatted);
  }, []);

  // function handleDateInputChange(e: any) {
  //   const formatted = formatDateRangeValue(e.target.value);
  //   setDateInput(formatted);
  // }

  // handle selected aid changes
  function handleAidChange(e: any) {
    const selectedAid = e.target.value as string;
    setAid(selectedAid);
  }

  // handle input in transaction serial searchbar
  function handleTransactionSerial(e: any) {
    if (e.key == "Enter") {
      e.preventDefault();
      const selectedSerial = e.target.value as string;
      setSerial(selectedSerial);
    }
  }

  const { first, second } = parseDateRange(dateInputEntered); // first and second dates

  const visibleRows = useMemo(() => { // filtered table rows
    let rows = (aid === "All") ? allRows : allRows.filter((row) => row.aid === aid);
    
    rows = serial? rows.filter((row) => row.ref == serial) : rows; // if serial is am empty string then return rows
    
    if (first && second) { // date filtering
     rows = rows.filter((row) => new Date(row.date) >= first && new Date(row.date) <= second);
    } else if (first) {
      rows = rows.filter((row) => new Date(row.date) == first);
    }
    
    return rows;
  }, [allRows, aid, serial, first, second]); 
  
  return (
    <>
    <Box sx={{ minWidth: 120, marginBottom: 4, marginTop: 4, display: "flex", flexDirection: "row", gap: 2 }}>
      {/* (pro feature) <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateRangePicker />
      </LocalizationProvider> */} 
      <FormControl sx={{ flex: 1 }}>
        <TextField
          id="simple-custom-date-field"
          label="Date"
          variant="outlined"
          placeholder="MM/DD/YYYY - MM/DD/YYYY"
          value={dateInput}
          helperText="(e.g. 01/01/2023 - 04/30/2023)"
          onKeyDown={handleDateInputKeyDown}
          onChange={handleDateInputChange}
        />
      </FormControl>
      <FormControl sx={{ flex: 1 }}>
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
      <FormControl sx={{ flex: 1 }}>
        <TextField
          id="transaction-serial-input"
          label="Transaction Serial Number"
          variant="outlined"
          helperText="4 digit number"
          onKeyDown={handleTransactionSerial}
        />
      </FormControl>
      
    </Box>
    
    
    <Box sx={{ height: 600, width: 1,  border: "none"}}>
      <DataGrid // DataGridPro allows multiple filters but this is a pro feature
        disableColumnSelector
        columns={columns}
        rows={visibleRows}
        showToolbar
        loading = {loading}
      />
    </Box>
    </>
    
  );
}
