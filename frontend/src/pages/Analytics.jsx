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
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
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
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Opened',
        data: last7Days.map(date => campaignsByDate[date]?.opened || 0),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Clicked',
        data: last7Days.map(date => campaignsByDate[date]?.clicked || 0),
        borderColor: 'rgb(255, 206, 86)',
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
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
          'rgba(53, 162, 235, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
        borderColor: [
          'rgba(53, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Campaign Analytics</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  {openRate}%
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Open Rate
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {totalStats.opened} of {totalStats.sent} emails
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  {clickRate}%
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Click Rate
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {totalStats.clicked} of {totalStats.opened} opens
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                  {bounceRate}%
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Bounce Rate
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {totalStats.failed} of {totalStats.sent} emails
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                  {campaigns.length}
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Campaigns
                  </dt>
                  <dd className="text-sm text-gray-900">
                    Active: {campaigns.filter(c => c.status === 'sending').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Email Performance (Last 7 Days)
          </h3>
          <Line
            data={lineChartData}
            options={{
              responsive: true,
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

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Overall Campaign Performance
          </h3>
          <Pie
            data={pieChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
            }}
          />
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Campaign Performance
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="bg-gray-50 px-4 py-3 sm:px-6">
            <div className="grid grid-cols-6 text-sm font-medium text-gray-500">
              <div className="col-span-2">Campaign</div>
              <div>Sent</div>
              <div>Opened</div>
              <div>Clicked</div>
              <div>Failed</div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {campaigns.slice(0, 5).map((campaign) => (
              <div key={campaign._id} className="px-4 py-3 sm:px-6">
                <div className="grid grid-cols-6 text-sm text-gray-900">
                  <div className="col-span-2">{campaign.name}</div>
                  <div>{campaign.analytics.sent}</div>
                  <div>{campaign.analytics.opened}</div>
                  <div>{campaign.analytics.clicked}</div>
                  <div>{campaign.analytics.failed}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;