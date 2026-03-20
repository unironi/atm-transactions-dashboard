import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import Select from '@mui/material/Select';
import { useEffect, useState } from 'react';
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

export default function TransactionTable() {

  const [transactionData, setTransactionData] = useState<any[]>([]);
  const [aid, setAid] = useState("All");
  const [aidList, setAidList] = useState<string[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [dateInput, setDateInput] = useState<string>("");
  const [firstDate, setFirstDate] = useState<Date | null>(null);
  const [secondDate, setSecondDate] = useState<Date | null>(null);
  const allRows = tableRows(transactionData);

  function formatDateRangeValue(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    const formatDate = (part: string) => {
      if (part.length <= 2) return part;
      if (part.length <= 4) return `${part.slice(0, 2)}/${part.slice(2)}`;
      return `${part.slice(0, 2)}/${part.slice(2, 4)}/${part.slice(4, 8)}`;
    };

    const first = formatDate(digits.slice(0, 8));
    const second = formatDate(digits.slice(8));

    return second ? `${first} - ${second}` : first;
  }

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

  function handleDateInput(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatDateRangeValue(e.target.value);
    setDateInput(formatted);

    const { first, second } = parseDateRange(formatted);
    setFirstDate(first);
    setSecondDate(second);
  }

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

  // update rows when emv chip aid is selected
  useEffect(() => {
    if (aid === "All") {
      setRows(allRows);
    } else {
      setRows(allRows.filter((row) => row.aid === aid));
    }
  }, [transactionData, aid]);

  // handle selected aid changes
  function handleAidChange(e: any) {
    const selectedAid = e.target.value as string;
    setAid(selectedAid);
  }

  // handle input in transaction serial searchbar
  function handleTransactionSerial(e: any) {
    if (e.key == "Enter") {
      e.preventDefault();
      const serial = e.target.value as string;
      if (serial) { // if the serial is not an empty string, then attempt to filter rows
        setRows(allRows.filter((row) => row.ref == serial));
      } else { // otherwise, show all rows
        setRows(allRows);
      }
    }
  }

  function handleDateChange(e: any) {
    if (e.key == "Enter") {
      e.preventDefault();
      if (firstDate && secondDate) {
        setRows(allRows.filter((row) => new Date(row.date) >= firstDate && new Date(row.date) <= secondDate))
      } else {
        setRows(allRows);
      }
    }
  }
  
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
          helperText="(e.g. 04/01/2024 - 04/30/2024)"
          onChange={handleDateInput}
          onKeyDown={handleDateChange}
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
    
    
    <Box sx={{ height: 600, width: 1,  }}>
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
