// import * as React from 'react';
// import Box from '@mui/material/Box';
// import Drawer from '@mui/material/Drawer';
// import Button from '@mui/material/Button';
// import List from '@mui/material/List';
// import Divider from '@mui/material/Divider';
// import ListItem from '@mui/material/ListItem';
// import ListItemButton from '@mui/material/ListItemButton';
// import ListItemIcon from '@mui/material/ListItemIcon';
// import ListItemText from '@mui/material/ListItemText';
// import PaymentsIcon from '@mui/icons-material/Payments';
// import SettingsIcon from '@mui/icons-material/Settings';

// export default function TemporaryDrawer() {
//   const [open, setOpen] = React.useState(false);

//   const toggleDrawer = (newOpen: boolean) => () => {
//     setOpen(newOpen);
//   };

//   const DrawerList = (
//     <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
//       <List>
//         <ListItem disablePadding>
//             <ListItemButton>
//               <ListItemIcon>
//                 <PaymentsIcon />
//               </ListItemIcon>
//               <ListItemText primary="Transactions" />
//             </ListItemButton>
//         </ListItem>
//         <ListItem disablePadding>
//             <ListItemButton>
//               <ListItemIcon>
//                 <SettingsIcon />
//               </ListItemIcon>
//               <ListItemText primary="Settings" />
//             </ListItemButton>
//         </ListItem>
//         {['User Management', 'ATM Management', 'My account'].map((text) => (
//             <ListItem key={text} disablePadding>
//                 <ListItemButton>
//                 <ListItemText primary={text} />
//                 </ListItemButton>
//             </ListItem>
//         ))} 
//       </List>
//     </Box>
//   );

//   return (
//     <div>
//       <Button onClick={toggleDrawer(true)}>Open drawer</Button>
//       <Drawer open={open} onClose={toggleDrawer(false)}>
//         {DrawerList}
//       </Drawer>
//     </div>
//   );
// }

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import PaymentsIcon from '@mui/icons-material/Payments';
import SettingsIcon from '@mui/icons-material/Settings';
import { Link as RouterLink } from "react-router-dom";


const drawerWidth = 240;

const tabs = [
  { text: "Transactions", path: "/" },
  { text: "Settings", path: "/settings" },
  { text: "User Management", path: "/user-management" },
  { text: "ATM Management", path: "/atm-management" },
  { text: "My account", path: "/my-account" },
];


export default function SideBar() {
    return (
        <Box sx={{ display: "flex" }}>
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box"
                    }
                }}
                variant="permanent"
                anchor="left"
            >
                <List>
                    {tabs.map(
                        (tab, index) => (
                            <ListItem key={tab.path} disablePadding>
                                <ListItemButton component={RouterLink} to={tab.path}>
                                    <ListItemIcon>
                                        {index === 0 ? <PaymentsIcon /> : ''}
                                        {index === 1 ? <SettingsIcon /> : ''}
                                    </ListItemIcon>
                                    <ListItemText primary={tab.text} />
                                </ListItemButton>
                            </ListItem>
                        )
                    )}
                </List>
            </Drawer>
        </Box>
    );
}
