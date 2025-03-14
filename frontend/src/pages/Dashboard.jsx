import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Users, Mail, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      case 'completed': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'sending': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button asChild>
          <Link to="/campaigns/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Mail className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Campaigns</p>
                <h2 className="text-3xl font-bold">{stats.totalCampaigns}</h2>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <BarChart2 className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                <h2 className="text-3xl font-bold">{stats.activeCampaigns}</h2>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Users className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Recipients</p>
                <h2 className="text-3xl font-bold">{stats.totalRecipients}</h2>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Deliveries</p>
                <h2 className="text-3xl font-bold">{stats.failedDeliveries}</h2>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {recentCampaigns.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No campaigns yet</h3>
              <p className="text-muted-foreground">Create your first campaign to get started</p>
              <Button asChild className="mt-4">
                <Link to="/campaigns/new">Create Campaign</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {recentCampaigns.map((campaign) => (
                <Link
                  key={campaign._id}
                  to={`/campaigns/${campaign._id}`}
                  className="block py-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{campaign.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Recipients: {campaign.analytics?.totalRecipients || 0}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                      <div className="text-sm text-muted-foreground">
                        Sent: {campaign.analytics?.sent || 0} |
                        Opened: {campaign.analytics?.opened || 0} |
                        Clicked: {campaign.analytics?.clicked || 0}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;