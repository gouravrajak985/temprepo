import { useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import useCampaignStore from '../store/campaignStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Analytics() {
  const { campaigns, fetchCampaigns, loading } = useCampaignStore();

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Prepare data for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    return format(date, 'MMM dd');
  }).reverse();

  const campaignsByDate = campaigns.reduce((acc, campaign) => {
    const date = format(new Date(campaign.createdAt), 'MMM dd');
    if (!acc[date]) {
      acc[date] = {
        sent: 0,
        opened: 0,
        clicked: 0
      };
    }
    acc[date].sent += campaign.analytics.sent;
    acc[date].opened += campaign.analytics.opened;
    acc[date].clicked += campaign.analytics.clicked;
    return acc;
  }, {});

  const lineChartData = {
    labels: last7Days,
    datasets: [
      {
        label: 'Sent',
        data: last7Days.map(date => campaignsByDate[date]?.sent || 0),
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.5)',
      },
      {
        label: 'Opened',
        data: last7Days.map(date => campaignsByDate[date]?.opened || 0),
        borderColor: '#2e7d32',
        backgroundColor: 'rgba(46, 125, 50, 0.5)',
      },
      {
        label: 'Clicked',
        data: last7Days.map(date => campaignsByDate[date]?.clicked || 0),
        borderColor: '#ed6c02',
        backgroundColor: 'rgba(237, 108, 2, 0.5)',
      },
    ],
  };

  // Calculate total statistics
  const totalStats = campaigns.reduce(
    (acc, campaign) => {
      acc.sent += campaign.analytics.sent;
      acc.opened += campaign.analytics.opened;
      acc.clicked += campaign.analytics.clicked;
      acc.failed += campaign.analytics.failed;
      return acc;
    },
    { sent: 0, opened: 0, clicked: 0, failed: 0 }
  );

  const pieChartData = {
    labels: ['Sent', 'Opened', 'Clicked', 'Failed'],
    datasets: [
      {
        data: [
          totalStats.sent,
          totalStats.opened,
          totalStats.clicked,
          totalStats.failed,
        ],
        backgroundColor: [
          'rgba(25, 118, 210, 0.6)',
          'rgba(46, 125, 50, 0.6)',
          'rgba(237, 108, 2, 0.6)',
          'rgba(211, 47, 47, 0.6)',
        ],
        borderColor: [
          '#1976d2',
          '#2e7d32',
          '#ed6c02',
          '#d32f2f',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Calculate success rates
  const openRate = totalStats.sent ? ((totalStats.opened / totalStats.sent) * 100).toFixed(1) : 0;
  const clickRate = totalStats.opened ? ((totalStats.clicked / totalStats.opened) * 100).toFixed(1) : 0;
  const bounceRate = totalStats.sent ? ((totalStats.failed / totalStats.sent) * 100).toFixed(1) : 0;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Campaign Analytics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    mr: 2,
                  }}
                >
                  {openRate}%
                </Box>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Open Rate
                  </Typography>
                  <Typography variant="body1">
                    {totalStats.opened} of {totalStats.sent}
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
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'success.main',
                    color: 'success.contrastText',
                    mr: 2,
                  }}
                >
                  {clickRate}%
                </Box>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Click Rate
                  </Typography>
                  <Typography variant="body1">
                    {totalStats.clicked} of {totalStats.opened}
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
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'error.main',
                    color: 'error.contrastText',
                    mr: 2,
                  }}
                >
                  {bounceRate}%
                </Box>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Bounce Rate
                  </Typography>
                  <Typography variant="body1">
                    {totalStats.failed} of {totalStats.sent}
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
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'secondary.main',
                    color: 'secondary.contrastText',
                    mr: 2,
                  }}
                >
                  {campaigns.length}
                </Box>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Campaigns
                  </Typography>
                  <Typography variant="body1">
                    Active: {campaigns.filter(c => c.status === 'sending').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Email Performance (Last 7 Days)
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line
                  data={lineChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                        },
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overall Campaign Performance
              </Typography>
              <Box sx={{ height: 300 }}>
                <Pie
                  data={pieChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Campaign Performance
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Campaign</TableCell>
                      <TableCell align="right">Sent</TableCell>
                      <TableCell align="right">Opened</TableCell>
                      <TableCell align="right">Clicked</TableCell>
                      <TableCell align="right">Failed</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {campaigns.slice(0, 5).map((campaign) => (
                      <TableRow key={campaign._id}>
                        <TableCell component="th" scope="row">
                          {campaign.name}
                        </TableCell>
                        <TableCell align="right">{campaign.analytics.sent}</TableCell>
                        <TableCell align="right">{campaign.analytics.opened}</TableCell>
                        <TableCell align="right">{campaign.analytics.clicked}</TableCell>
                        <TableCell align="right">{campaign.analytics.failed}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Analytics;