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

// for EMV AID search, will need to fetch getAidList and filter out non-EMV types for dropdown
// when user selects an aid, will need to loop through transactions that contain app field
// and return the ones where app.text = selected aid or app.id = selected id

export async function fetchEmvAidList(): Promise<string[]> {
    try {
        const result = await fetch("https://dev.smartjournal.net:443/um/test/api/jr/txn/aidlist/v1");
        if (!result.ok) {
            throw new Error(`HTTP error: ${result.status}`);
        }
        const json = await result.json();
        if (Array.isArray(json) && json.length > 0) {
            const emvList = json.filter((i) => (i.type == "EMV"));
            const emvAidList: string[] = emvList.map(i => i.aid);
            return emvAidList;
        }
        return [];
    } catch (error) {
        console.log('fetchEmvAidList error:', error);
        throw error;
    }
}

// devtime has format YYYYMMDDHHMMSS. converting this to a date object to allow for easier comparisons
export function parseDevtime(devtime: string): Date {
    const year = Number(devtime.slice(0, 4));
    const month = Number(devtime.slice(4, 6));
    const day = Number(devtime.slice(6, 8));

    const date: Date = new Date(year, month, day);

    return date;
}
