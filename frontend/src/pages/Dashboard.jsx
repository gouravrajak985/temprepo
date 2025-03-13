import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Users, Mail, AlertTriangle } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <Link
          to="/campaigns/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create Campaign
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Mail className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Campaigns
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.totalCampaigns}
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
                <BarChart2 className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Campaigns
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.activeCampaigns}
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
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Recipients
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.totalRecipients}
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
                <AlertTriangle className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Failed Deliveries
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.failedDeliveries}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Campaigns
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="bg-white">
            <ul role="list" className="divide-y divide-gray-200">
              {recentCampaigns.map((campaign) => (
                <li key={campaign._id}>
                  <Link
                    to={`/campaigns/${campaign._id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-blue-600 truncate">
                          {campaign.name}
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span className={`
                            px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${campaign.status === 'completed' ? 'bg-green-100 text-green-800' :
                              campaign.status === 'failed' ? 'bg-red-100 text-red-800' :
                              campaign.status === 'sending' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'}
                          `}>
                            {campaign.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Recipients: {campaign.analytics?.totalRecipients || 0}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Sent: {campaign.analytics?.sent || 0} |
                            Opened: {campaign.analytics?.opened || 0} |
                            Clicked: {campaign.analytics?.clicked || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
              {recentCampaigns.length === 0 && !loading && (
                <li className="px-4 py-5 text-center text-sm text-gray-500">
                  No campaigns yet. Create your first campaign to get started!
                </li>
              )}
              {loading && (
                <li className="px-4 py-5 text-center text-sm text-gray-500">
                  Loading campaigns...
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;