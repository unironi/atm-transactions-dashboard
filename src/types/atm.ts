export interface Transaction {
    amount: number,
    amountP: number,
    amountR: number,
    amountW: number,
    atm: {
        id: number,
        txt: string,
    },
    devTime: number,
    err: boolean,
    hst: {
        descr: string,
        id: number,
        txt: string,
    },
    pan: string,
    ref: string,
    state: Array<{
        id: number,
        lt: number,
        txt: string,
        descr: string
    }>,
    ttp: {
        descr: string,
        id: number,
        txt: string,
    },
    withdrawalError: boolean
}

export interface AtmTransactionsResponse {
  truncated: boolean;
  txn?: Transaction[];
}