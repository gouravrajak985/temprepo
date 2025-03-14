import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Users, Mail, AlertTriangle } from 'lucide-react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider
} from '@mui/material';
import useCampaignStore from '../store/campaignStore';

function Dashboard() {
  const { campaigns, fetchCampaigns, loading } = useCampaignStore();

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'sending').length,
    totalRecipients: campaigns.reduce((acc, c) => acc + (c.analytics?.totalRecipients || 0), 0),
    failedDeliveries: campaigns.reduce((acc, c) => acc + (c.analytics?.failed || 0), 0)
  };

  const recentCampaigns = campaigns
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'sending': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button
          component={Link}
          to="/campaigns/new"
          variant="contained"
          color="primary"
        >
          Create Campaign
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Mail sx={{ fontSize: 40, color: 'text.secondary', mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Campaigns
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalCampaigns}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BarChart2 sx={{ fontSize: 40, color: 'text.secondary', mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Active Campaigns
                  </Typography>
                  <Typography variant="h4">
                    {stats.activeCampaigns}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Users sx={{ fontSize: 40, color: 'text.secondary', mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Recipients
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalRecipients}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AlertTriangle sx={{ fontSize: 40, color: 'text.secondary', mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Failed Deliveries
                  </Typography>
                  <Typography variant="h4">
                    {stats.failedDeliveries}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Campaigns
              </Typography>
              <List>
                {recentCampaigns.map((campaign, index) => (
                  <Box key={campaign._id}>
                    <ListItem
                      component={Link}
                      to={`/campaigns/${campaign._id}`}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        textDecoration: 'none',
                        color: 'text.primary',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemText
                        primary={campaign.name}
                        secondary={`Recipients: ${campaign.analytics?.totalRecipients || 0}`}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          label={campaign.status}
                          color={getStatusColor(campaign.status)}
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          Sent: {campaign.analytics?.sent || 0} |
                          Opened: {campaign.analytics?.opened || 0} |
                          Clicked: {campaign.analytics?.clicked || 0}
                        </Typography>
                      </Box>
                    </ListItem>
                    {index < recentCampaigns.length - 1 && <Divider />}
                  </Box>
                ))}
                {recentCampaigns.length === 0 && !loading && (
                  <ListItem>
                    <ListItemText
                      primary="No campaigns yet"
                      secondary="Create your first campaign to get started!"
                    />
                  </ListItem>
                )}
                {loading && (
                  <ListItem>
                    <ListItemText primary="Loading campaigns..." />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;