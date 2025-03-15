import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Upload, Mail, User, ArrowLeft, ReceiptCent } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import useCampaignStore from '../store/campaignStore';

const schema = yup.object().shape({
  name: yup.string().required('Campaign name is required'),
  subject: yup.string().required('Email subject is required'),
});

function CreateCampaign() {
  const navigate = useNavigate();
  const { createCampaign } = useCampaignStore();
  const [emailBody, setEmailBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipients, setRecipients] = useState([{ email: '', firstName: '', lastName: '' }]);
  const [inputMethod, setInputMethod] = useState('manual'); // 'manual' or 'csv'

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const addRecipient = () => {
    setRecipients([...recipients, { email: '', firstName: '', lastName: '' }]);
  };

  const removeRecipient = (index) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const updateRecipient = (index, field, value) => {
    const newRecipients = [...recipients];
    newRecipients[index] = { ...newRecipients[index], [field]: value };
    setRecipients(newRecipients);
  };

  const processRecipientsCsv = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const rows = text.split('\n').filter(row => row.trim());
        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
        const recipients = rows.slice(1).map(row => {
          const values = row.split(',').map(v => v.trim());
          const recipient = {};
          headers.forEach((header, i) => {
            recipient[header] = values[i];
          });
          return recipient;
        });
        resolve(recipients);
      };
      reader.readAsText(file);
    });
  };

  const validateRecipients = () => {
    if (recipients.length === 0) {
      toast.error('At least one recipient is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = recipients.filter(r => !emailRegex.test(r.email));
    
    if (invalidEmails.length > 0) {
      toast.error('Please enter valid email addresses for all recipients');
      return false;
    }

    return true;
  };

  const onSubmit = async (data) => {
    try {
      if (!validateRecipients()) return;
      
      setLoading(true);
      console.log(recipients);
      let finalRecipients = recipients;

      if (inputMethod === 'csv' && data.recipientsCsv?.[0]) {
        finalRecipients = await processRecipientsCsv(data.recipientsCsv[0]);
      }
    
      const formData = new FormData();
      console.log(data.name);
      formData.append('name', data.name);
      console.log(data.subject);
      formData.append('subject', data.subject);
      formData.append('body', emailBody);
      formData.append('recipients', JSON.stringify(finalRecipients));
      console.log(formData);

      const result = await createCampaign(formData);
      
      if (result.success) {
        toast.success('Campaign created successfully');
        navigate('/campaigns');
      } else {
        toast.error(result.error || 'Failed to create campaign');
      }
    } catch (error) {
      toast.error('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="mr-4"
          onClick={() => navigate('/campaigns')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create New Campaign</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                {...register('subject')}
              />
              {errors.subject && (
                <p className="text-sm text-destructive">{errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Email Body</Label>
              <ReactQuill
                value={emailBody}
                onChange={setEmailBody}
                className="h-64"
              />
            </div>

            <div className="space-y-4">
              <Label>Recipients Input Method</Label>
              <RadioGroup
                value={inputMethod}
                onValueChange={setInputMethod}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id="manual" />
                  <Label htmlFor="manual">Manual Input</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="csv" />
                  <Label htmlFor="csv">CSV Upload</Label>
                </div>
              </RadioGroup>

              {inputMethod === 'manual' ? (
                <div className="space-y-4">
                  {recipients.map((recipient, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="email"
                                value={recipient.email}
                                onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                                className="pl-10"
                                placeholder="email@example.com"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>First Name</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="text"
                                value={recipient.firstName}
                                onChange={(e) => updateRecipient(index, 'firstName', e.target.value)}
                                className="pl-10"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Last Name</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="text"
                                value={recipient.lastName}
                                onChange={(e) => updateRecipient(index, 'lastName', e.target.value)}
                                className="pl-10"
                              />
                            </div>
                          </div>
                        </div>
                        {recipients.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="mt-4 text-destructive hover:text-destructive/90"
                            onClick={() => removeRecipient(index)}
                          >
                            Remove Recipient
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addRecipient}
                  >
                    Add Recipient
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept=".csv"
                    {...register('recipientsCsv')}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-muted-foreground">
                    Upload a CSV file with columns: email, firstName, lastName
                  </p>
                </div>
              )}
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
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/campaigns')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Campaign'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateCampaign;