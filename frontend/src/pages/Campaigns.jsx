import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Calendar, Users, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import useCampaignStore from '../store/campaignStore';

function Campaigns() {
  const { campaigns, fetchCampaigns, deleteCampaign, loading } = useCampaignStore();

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      const result = await deleteCampaign(id);
      if (result.success) {
        toast.success('Campaign deleted successfully');
      } else {
        toast.error(result.error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'sending': return 'info';
      case 'scheduled': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Email Campaigns
        </Typography>
        <Button
          component={Link}
          to="/campaigns/new"
          variant="contained"
          startIcon={<Mail />}
        >
          Create Campaign
        </Button>
      </Box>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Mail sx={{ width: 48, height: 48, color: 'text.secondary', mx: 'auto', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No campaigns
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Get started by creating a new campaign.
            </Typography>
            <Button
              component={Link}
              to="/campaigns/new"
              variant="contained"
            >
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <List>
            {campaigns.map((campaign, index) => (
              <Box key={campaign._id}>
                <ListItem
                  sx={{
                    py: 2,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon>
                    <Mail sx={{ color: 'text.secondary' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Link
                        to={`/campaigns/${campaign._id}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <Typography variant="h6" color="primary">
                          {campaign.name}
                        </Typography>
                      </Link>
                    }
                    secondary={campaign.subject}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={campaign.status}
                      color={getStatusColor(campaign.status)}
                      size="small"
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Users size={16} />
                      <Typography variant="body2" color="text.secondary">
                        {campaign.analytics.totalRecipients}
                      </Typography>
                    </Box>
                    {campaign.scheduledFor && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Calendar size={16} />
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(campaign.scheduledFor), 'PPp')}
                        </Typography>
                      </Box>
                    )}
                    <IconButton
                      onClick={() => handleDelete(campaign._id)}
                      color="error"
                      size="small"
                    >
                      <Trash2 size={20} />
                    </IconButton>
                  </Box>
                </ListItem>
                {index < campaigns.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </Card>
      )}
    </Box>
  );
}

export default Campaigns;