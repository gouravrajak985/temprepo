import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Mail, Users, Clock, Send, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import useCampaignStore from '../store/campaignStore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentCampaign, fetchCampaign, sendCampaign, loading } = useCampaignStore();
  const [sendingStatus, setSendingStatus] = useState(false);

  useEffect(() => {
    fetchCampaign(id);
  }, [id, fetchCampaign]);

  if (loading || !currentCampaign) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const handleSendCampaign = async () => {
    if (window.confirm('Are you sure you want to send this campaign now?')) {
      setSendingStatus(true);
      const result = await sendCampaign(id);
      setSendingStatus(false);

      if (result.success) {
        toast.success('Campaign is being sent');
      } else {
        toast.error(result.error);
      }
    }
  };

  const chartData = {
    labels: ['Total', 'Sent', 'Opened', 'Clicked', 'Failed'],
    datasets: [
      {
        label: 'Email Statistics',
        data: [
          currentCampaign.analytics.totalRecipients,
          currentCampaign.analytics.sent,
          currentCampaign.analytics.opened,
          currentCampaign.analytics.clicked,
          currentCampaign.analytics.failed
        ],
        backgroundColor: [
          'rgba(53, 162, 235, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
        borderColor: [
          'rgba(53, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Campaign Analytics',
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
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {currentCampaign.name}
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={() => navigate('/campaigns')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Campaigns
          </button>
          {currentCampaign.status === 'draft' && (
            <button
              type="button"
              onClick={handleSendCampaign}
              disabled={sendingStatus}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4 mr-2" />
              {sendingStatus ? 'Sending...' : 'Send Campaign'}
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Campaign Details
            </h3>
            <div className="mt-6 grid grid-cols-1 gap-4">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-500">Subject:</span>
                <span className="ml-2 text-sm text-gray-900">{currentCampaign.subject}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-500">Recipients:</span>
                <span className="ml-2 text-sm text-gray-900">
                  {currentCampaign.analytics.totalRecipients}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-500">Created:</span>
                <span className="ml-2 text-sm text-gray-900">
                  {format(new Date(currentCampaign.createdAt), 'PPp')}
                </span>
              </div>
              {currentCampaign.scheduledFor && (
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-500">Scheduled For:</span>
                  <span className="ml-2 text-sm text-gray-900">
                    {format(new Date(currentCampaign.scheduledFor), 'PPp')}
                  </span>
                </div>
              )}
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <span className={`
                  ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${currentCampaign.status === 'completed' ? 'bg-green-100 text-green-800' :
                    currentCampaign.status === 'failed' ? 'bg-red-100 text-red-800' :
                    currentCampaign.status === 'sending' ? 'bg-blue-100 text-blue-800' :
                    currentCampaign.status === 'scheduled' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'}
                `}>
                  {currentCampaign.status}
                </span>
              </div>
            </div>

            {currentCampaign.attachments && currentCampaign.attachments.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900">Attachments</h4>
                <ul className="mt-2 divide-y divide-gray-200">
                  {currentCampaign.attachments.map((attachment, index) => (
                    <li key={index} className="py-2 flex items-center justify-between">
                      <span className="text-sm text-gray-500">{attachment.filename}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Campaign Analytics
            </h3>
            <div className="mt-6">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Email Content
            </h3>
            <div className="mt-4 prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: currentCampaign.body }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CampaignDetails;