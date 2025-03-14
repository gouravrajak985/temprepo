import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Mail, BarChart2, LogOut } from 'lucide-react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  Avatar,
  Divider
} from '@mui/material';
import useAuthStore from '../store/authStore';

function Sidebar() {
  const location = useLocation();
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Campaigns', href: '/campaigns', icon: Mail },
    { name: 'Analytics', href: '/analytics', icon: BarChart2 },
  ];

  const drawerWidth = 280;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        display: { xs: 'none', lg: 'block' },
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Email Campaign
        </Typography>
      </Box>

      <List sx={{ px: 2 }}>
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <ListItem
              key={item.name}
              component={Link}
              to={item.href}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                bgcolor: isActive ? 'action.selected' : 'transparent',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'text.secondary' }}>
                <item.icon />
              </ListItemIcon>
              <ListItemText 
                primary={item.name}
                sx={{ color: isActive ? 'primary.main' : 'text.primary' }}
              />
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {user?.firstName?.[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle1">
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </Box>
        <Button
          fullWidth
          startIcon={<LogOut />}
          onClick={logout}
          variant="outlined"
          color="primary"
          sx={{ mt: 2 }}
        >
          Sign out
        </Button>
      </Box>
    </Drawer>
  );
}

export default Sidebar;