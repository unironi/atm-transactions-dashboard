import type { AtmTransactionsResponse } from "../types/atm";

export async function fetchAtmList() {
    try {
        const result = await fetch('https://dev.smartjournal.net:443/um/test/api/jr/txn/atmlist/v1');
        if (!result.ok) {
            throw new Error(`HTTP error: ${result.status}`);
        }
        const json = await result.json();
        // console.log(json)
        return json ?? []; // json object itself is aray containing atm objects
    } catch (error) {
        console.log('fetchAtmList error:', error);
        throw error;
    }
}

// loop through fetched atm list and call this function on each atm id to obtain all transactions from that atm
// if returned object is { truncated: false }, then atm does not have any transactions
export async function fetchAtmIdTransactions(id: number): Promise<AtmTransactionsResponse> {
    const input = {
        atmId: id,
        date0: 1,
        date1: 2147483647,
    };

    try {
        const result = await fetch('https://dev.smartjournal.net:443/um/test/api/jr/txn/v1', {
            method: 'POST',
            body: JSON.stringify(input),
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
        });

        if (!result.ok) {
            throw new Error(`HTTP error: ${result.status}`);
        }

        const json = await result.json() as AtmTransactionsResponse; // contains truncated bool field and txn array field
        // console.log(json)
        return json; // if no .txn field in object, no transactions
    } catch (error) {
        console.log('fetchAtmIDTransactions error:', error);
        throw error;
    }
}
