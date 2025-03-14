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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
      </div>
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
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
      {
        label: 'Opened',
        data: last7Days.map(date => campaignsByDate[date]?.opened || 0),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
      },
      {
        label: 'Clicked',
        data: last7Days.map(date => campaignsByDate[date]?.clicked || 0),
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
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
          'rgba(59, 130, 246, 0.6)',
          'rgba(34, 197, 94, 0.6)',
          'rgba(249, 115, 22, 0.6)',
          'rgba(239, 68, 68, 0.6)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(249, 115, 22)',
          'rgb(239, 68, 68)',
        ],
      },
    ],
  };

  // Calculate success rates
  const openRate = totalStats.sent ? ((totalStats.opened / totalStats.sent) * 100).toFixed(1) : 0;
  const clickRate = totalStats.opened ? ((totalStats.clicked / totalStats.opened) * 100).toFixed(1) : 0;
  const bounceRate = totalStats.sent ? ((totalStats.failed / totalStats.sent) * 100).toFixed(1) : 0;

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-6">Campaign Analytics</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                {openRate}%
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open Rate</p>
                <p className="text-lg font-semibold">
                  {totalStats.opened} of {totalStats.sent}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded bg-green-100 text-green-600 flex items-center justify-center">
                {clickRate}%
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Click Rate</p>
                <p className="text-lg font-semibold">
                  {totalStats.clicked} of {totalStats.opened}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded bg-red-100 text-red-600 flex items-center justify-center">
                {bounceRate}%
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bounce Rate</p>
                <p className="text-lg font-semibold">
                  {totalStats.failed} of {totalStats.sent}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded bg-gray-100 text-gray-600 flex items-center justify-center">
                {campaigns.length}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Campaigns</p>
                <p className="text-lg font-semibold">
                  Active: {campaigns.filter(c => c.status === 'sending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Performance (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overall Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
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
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted">
                <tr>
                  <th className="px-6 py-3">Campaign</th>
                  <th className="px-6 py-3 text-right">Sent</th>
                  <th className="px-6 py-3 text-right">Opened</th>
                  <th className="px-6 py-3 text-right">Clicked</th>
                  <th className="px-6 py-3 text-right">Failed</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.slice(0, 5).map((campaign) => (
                  <tr key={campaign._id} className="border-b">
                    <td className="px-6 py-4 font-medium">{campaign.name}</td>
                    <td className="px-6 py-4 text-right">{campaign.analytics.sent}</td>
                    <td className="px-6 py-4 text-right">{campaign.analytics.opened}</td>
                    <td className="px-6 py-4 text-right">{campaign.analytics.clicked}</td>
                    <td className="px-6 py-4 text-right">{campaign.analytics.failed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Analytics;