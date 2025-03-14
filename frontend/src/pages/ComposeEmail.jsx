import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Mail, User, Upload, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useEmailStore from '../store/emailStore';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  firstName: yup.string(),
  lastName: yup.string(),
  subject: yup.string().required('Subject is required'),
});

function ComposeEmail() {
  const navigate = useNavigate();
  const [emailBody, setEmailBody] = useState('');
  const [sending, setSending] = useState(false);
  const { sendSingleEmail } = useEmailStore();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    if (!emailBody.trim()) {
      return toast.error('Email body is required');
    }

    setSending(true);
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('firstName', data.firstName || '');
    formData.append('lastName', data.lastName || '');
    formData.append('subject', data.subject);
    formData.append('body', emailBody);

    const result = await sendSingleEmail(formData);
    setSending(false);

    if (result.success) {
      toast.success('Email sent successfully');
      navigate('/emails');
    } else {
      toast.error(result.error);
    }
  };

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
        <h1 className="text-3xl font-bold tracking-tight">Compose Email</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>New Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...register('email')}
                    className="pl-10"
                    placeholder="recipient@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>First Name (Optional)</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...register('firstName')}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Last Name (Optional)</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...register('lastName')}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                {...register('subject')}
              />
              {errors.subject && (
                <p className="text-sm text-destructive">{errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <ReactQuill
                value={emailBody}
                onChange={setEmailBody}
                className="h-64"
              />
            </div>

            <div className="space-y-2">
              <Label>Attachments</Label>
              <div className="mt-1 border-2 border-dashed rounded-lg p-6 bg-muted/50 cursor-not-allowed">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">
                      Attachment feature coming soon
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/emails')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={sending}
              >
                {sending ? 'Sending...' : 'Send Email'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

export default ComposeEmail;