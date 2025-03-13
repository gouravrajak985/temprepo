import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Calendar, Users, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Email Campaigns</h1>
        <Link
          to="/campaigns/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create Campaign
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading campaigns...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-10">
          <Mail className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new campaign.
          </p>
          <div className="mt-6">
            <Link
              to="/campaigns/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Campaign
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <li key={campaign._id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Mail className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <Link
                          to={`/campaigns/${campaign._id}`}
                          className="text-lg font-medium text-blue-600 hover:text-blue-800"
                        >
                          {campaign.name}
                        </Link>
                        <p className="text-sm text-gray-500">{campaign.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`
                        px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${campaign.status === 'completed' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'failed' ? 'bg-red-100 text-red-800' :
                          campaign.status === 'sending' ? 'bg-blue-100 text-blue-800' :
                          campaign.status === 'scheduled' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'}
                      `}>
                        {campaign.status}
                      </span>
                      <button
                        onClick={() => handleDelete(campaign._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        {campaign.analytics.totalRecipients} recipients
                      </div>
                      {campaign.scheduledFor && (
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          Scheduled for {format(new Date(campaign.scheduledFor), 'PPp')}
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        Sent: {campaign.analytics.sent} |
                        Opened: {campaign.analytics.opened} |
                        Clicked: {campaign.analytics.clicked}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Campaigns;