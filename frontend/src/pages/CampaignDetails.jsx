import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Mail, Users, Clock, Send, AlertTriangle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import useCampaignStore from '../store/campaignStore';

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'sending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button
            variant="ghost"
            className="mb-2"
            onClick={() => navigate('/campaigns')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{currentCampaign.name}</h1>
        </div>
        {currentCampaign.status === 'draft' && (
          <Button
            onClick={handleSendCampaign}
            disabled={sendingStatus}
          >
            <Send className="mr-2 h-4 w-4" />
            {sendingStatus ? 'Sending...' : 'Start Campaign'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Subject:</span>
              <span className="text-sm">{currentCampaign.subject}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Recipients:</span>
              <span className="text-sm">{currentCampaign.analytics.totalRecipients}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Created:</span>
              <span className="text-sm">
                {format(new Date(currentCampaign.createdAt), 'PPp')}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Status:</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(currentCampaign.status)}`}>
                {currentCampaign.status}
              </span>
            </div>

            {currentCampaign.attachments && currentCampaign.attachments.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Attachments</h4>
                <div className="space-y-2">
                  {currentCampaign.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 bg-muted rounded-md">
                      <span className="text-sm">{attachment.filename}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Email Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: currentCampaign.body }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CampaignDetails;