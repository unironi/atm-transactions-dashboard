# ATM Dashboard Assignment

Page that shows a table with transaction data pulled from ATM API, including search filters.

Live link: https://atm-transactions-dashboard.vercel.app

Note: takes a couple seconds for all transactions to load when you first load the page

Note 2: Fixing some bad practices - done, refactored code to get rid of needless states and useEffects slowing performance down, optimized with useMemo instead. also allows multiple search filters to take place simultaneously now.

To run locally, run `npm run dev` inside the root directory.

Tech stack:
- React
- Material UI
- TypeScript
- React Router
