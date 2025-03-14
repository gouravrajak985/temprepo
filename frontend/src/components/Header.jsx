import { useState } from 'react';
import { Menu as MenuIcon, Bell, X } from 'lucide-react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme
} from '@mui/material';
import useAuthStore from '../store/authStore';

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useAuthStore(state => state.user);
  const theme = useTheme();

  return (
    <AppBar position="fixed" sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2, display: { lg: 'none' } }}
          onClick={() => setMobileMenuOpen(true)}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        <IconButton color="inherit">
          <Bell />
        </IconButton>

        <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ ml: 1 }}>
            {user?.firstName} {user?.lastName}
          </Typography>
        </Box>
      </Toolbar>

      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          display: { lg: 'none' },
          '& .MuiDrawer-paper': {
            width: 240,
            bgcolor: 'background.paper',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={() => setMobileMenuOpen(false)}>
            <X />
          </IconButton>
        </Box>
        <List>
          <ListItem>
            <ListItemText 
              primary={`${user?.firstName} ${user?.lastName}`}
              secondary={user?.email}
            />
          </ListItem>
        </List>
      </Drawer>
    </AppBar>
  );
}

export default Header;