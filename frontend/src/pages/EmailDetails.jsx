import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Mail, User, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useEmailStore from '../store/emailStore';

function EmailDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { singleEmails } = useEmailStore();
  const [email, setEmail] = useState(null);

  useEffect(() => {
    const foundEmail = singleEmails.find(e => e._id === id);
    if (foundEmail) {
      setEmail(foundEmail);
    }
  }, [id, singleEmails]);

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="mr-4"
          onClick={() => navigate('/emails')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Emails
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Email Details</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Recipient:</span>
                  <span className="text-sm font-medium">{email.recipient.email}</span>
                </div>
                {(email.recipient.firstName || email.recipient.lastName) && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <span className="text-sm font-medium">
                      {`${email.recipient.firstName || ''} ${email.recipient.lastName || ''}`.trim()}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Sent:</span>
                  <span className="text-sm font-medium">
                    {format(new Date(email.sentAt), 'PPp')}
                  </span>
                </div>
              </div>
              <div>
                {email.status === 'sent' ? (
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-1.5" />
                    Sent Successfully
                  </span>
                ) : (
                  <span className="flex items-center text-red-600">
                    <XCircle className="h-5 w-5 mr-1.5" />
                    Failed to Send
                  </span>
                )}
              </div>
            </div>

            {email.status === 'failed' && email.error && (
              <div className="pt-4">
                <h3 className="text-sm font-medium text-destructive mb-1">Error Details</h3>
                <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {email.error}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{email.subject}</h2>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: email.body }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default EmailDetails;