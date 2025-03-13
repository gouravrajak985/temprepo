import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Upload, X, Plus, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';
import useCampaignStore from '../store/campaignStore';

const schema = yup.object().shape({
  name: yup.string().required('Campaign name is required'),
  subject: yup.string().required('Email subject is required'),
  scheduledFor: yup.date().nullable().min(new Date(), 'Schedule date must be in the future'),
});

function CreateCampaign() {
  const navigate = useNavigate();
  const { createCampaign } = useCampaignStore();
  const [emailBody, setEmailBody] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recipients, setRecipients] = useState([{ email: '', firstName: '', lastName: '' }]);
  const [inputMethod, setInputMethod] = useState('manual'); // 'manual' or 'csv'

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

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
      let finalRecipients = recipients;

      if (inputMethod === 'csv' && data.recipientsCsv?.[0]) {
        finalRecipients = await processRecipientsCsv(data.recipientsCsv[0]);
      }

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('subject', data.subject);
      formData.append('body', emailBody);
      formData.append('scheduledFor', data.scheduledFor || '');
      formData.append('recipients', JSON.stringify(finalRecipients));
      
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const result = await createCampaign(formData);
      
      if (result.success) {
        toast.success('Campaign created successfully');
        navigate('/campaigns');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Create New Campaign
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Campaign Name
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Email Subject
                </label>
                <input
                  type="text"
                  {...register('subject')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="body" className="block text-sm font-medium text-gray-700">
                  Email Body
                </label>
                <div className="mt-1">
                  <ReactQuill
                    value={emailBody}
                    onChange={setEmailBody}
                    className="h-64"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipients Input Method
                </label>
                <div className="flex space-x-4 mb-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="manual"
                      checked={inputMethod === 'manual'}
                      onChange={(e) => setInputMethod(e.target.value)}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">Manual Input</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="csv"
                      checked={inputMethod === 'csv'}
                      onChange={(e) => setInputMethod(e.target.value)}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">CSV Upload</span>
                  </label>
                </div>

                {inputMethod === 'manual' ? (
                  <div className="space-y-4">
                    {recipients.map((recipient, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Email
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                type="email"
                                value={recipient.email}
                                onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="email@example.com"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              First Name
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                value={recipient.firstName}
                                onChange={(e) => updateRecipient(index, 'firstName', e.target.value)}
                                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              />
                            </div>
                          </div>
                          <div className="relative">
                            <label className="block text-sm font-medium text-gray-700">
                              Last Name
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                value={recipient.lastName}
                                onChange={(e) => updateRecipient(index, 'lastName', e.target.value)}
                                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              />
                            </div>
                            {recipients.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeRecipient(index)}
                                className="absolute top-0 right-0 text-red-600 hover:text-red-800"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addRecipient}
                      className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Recipient
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept=".csv"
                      {...register('recipientsCsv')}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Upload a CSV file with columns: email, firstName, lastName
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="scheduledFor" className="block text-sm font-medium text-gray-700">
                  Schedule Send (Optional)
                </label>
                <input
                  type="datetime-local"
                  {...register('scheduledFor')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                {errors.scheduledFor && (
                  <p className="mt-1 text-sm text-red-600">{errors.scheduledFor.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Attachments
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="attachments"
                        className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500"
                      >
                        <span>Upload files</span>
                        <input
                          id="attachments"
                          type="file"
                          multiple
                          onChange={handleAttachmentChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, XLS, XLSX up to 10MB each
                    </p>
                  </div>
                </div>
                {attachments.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {attachments.map((file, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md"
                      >
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/campaigns')}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateCampaign;