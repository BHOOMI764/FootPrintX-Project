'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquare, Send, Twitter, Upload, X, TrendingUp, Hash, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import apiClient from '@/lib/apiClient';
import AuthGuard from '@/components/AuthGuard';
import axios from 'axios';

function ComplaintsPageContent() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [tweetText, setTweetText] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [taggedUsers, setTaggedUsers] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trendingHashtags, setTrendingHashtags] = useState<any[]>([]);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [scheduledTime, setScheduledTime] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [recentTweets, setRecentTweets] = useState<any[]>([]);
  const [tweetCharacterCount, setTweetCharacterCount] = useState(0);

  useEffect(() => {
    fetchTrendingHashtags();
    fetchRecentTweets();
  }, []);

  useEffect(() => {
    const hashtagText = selectedHashtags.join(' ');
    const totalLength = tweetText.length + hashtagText.length + taggedUsers.length;
    setTweetCharacterCount(totalLength);
  }, [tweetText, selectedHashtags, taggedUsers]);

  const fetchTrendingHashtags = async () => {
    try {
      const response = await apiClient.get('/api/twitter/trending-hashtags');
      setTrendingHashtags(response.data);
    } catch (error) {
      console.error('Error fetching trending hashtags:', error);
    }
  };

  const fetchRecentTweets = async () => {
    try {
      const response = await apiClient.get('/api/twitter/environmental-mentions');
      setRecentTweets(response.data);
    } catch (error) {
      console.error('Error fetching recent tweets:', error);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setImage(acceptedFiles[0]);
      toast.info('Image selected. Note: Image upload to backend not implemented yet.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      toast.error('Please fill in Title and Description');
      return;
    }

    setIsSubmitting(true);

    const complaintData = {
        subject: `${selectedDepartment ? `[${selectedDepartment}] ` : ''}${subject}`,
        message: message
    };

    try {
        const response = await apiClient.post('/api/complain', complaintData);
        console.log('Complaint submitted:', response.data);
        toast.success('Complaint submitted successfully!');

        if (tweetText) {
          await postTweet();
        }

        setSubject('');
        setMessage('');
        setTweetText('');
        setSelectedDepartment('');
        setTaggedUsers('');
        setImage(null);

    } catch (error) {
        let errorMessage = "Failed to submit complaint.";
        if (axios.isAxiosError(error)) {
            console.error('Axios error details:', error.response?.data || error.message);
            errorMessage = error.response?.data?.msg || error.message || errorMessage;
        } else {
            console.error('Non-Axios error:', error);
        }
        toast.error(errorMessage);
    } finally {
        setIsSubmitting(false);
    }
  };

  const postTweet = async () => {
    try {
      const hashtags = selectedHashtags.join(' ');
      const tweetContent = `${tweetText} ${taggedUsers} ${hashtags}`;
      
      const response = await apiClient.post('/api/twitter/tweet', {
        tweetText: tweetContent,
        hashtags: hashtags,
        images: image ? [image] : []
      });

      toast.success('Tweet posted successfully!');
      console.log('Tweet posted:', response.data);
    } catch (error) {
      console.error('Error posting tweet:', error);
      toast.error('Failed to post tweet. Please try again.');
    }
  };

  const scheduleTweet = async () => {
    if (!scheduledTime) {
      toast.error('Please select a scheduled time');
      return;
    }

    setIsScheduling(true);
    try {
      const hashtags = selectedHashtags.join(' ');
      const tweetContent = `${tweetText} ${taggedUsers} ${hashtags}`;
      
      const response = await apiClient.post('/api/twitter/schedule-tweet', {
        tweetText: tweetContent,
        scheduledTime: scheduledTime,
        hashtags: hashtags
      });

      toast.success('Tweet scheduled successfully!');
      console.log('Tweet scheduled:', response.data);
    } catch (error) {
      console.error('Error scheduling tweet:', error);
      toast.error('Failed to schedule tweet. Please try again.');
    } finally {
      setIsScheduling(false);
    }
  };

  const toggleHashtag = (hashtag: string) => {
    setSelectedHashtags(prev => 
      prev.includes(hashtag) 
        ? prev.filter(h => h !== hashtag)
        : [...prev, hashtag]
    );
  };

  const removeImage = () => {
    setImage(null);
    toast.success('Image selection removed');
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Submit a Complaint</h1>
        <p className="mt-2 text-muted-foreground">
          Share your concerns and tweet about environmental issues.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="department">Department (Optional)</Label>
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Environmental">Environmental Control</SelectItem>
                  <SelectItem value="Waste">Waste Management</SelectItem>
                  <SelectItem value="Energy">Energy Department</SelectItem>
                  <SelectItem value="Transport">Transportation</SelectItem>
                  <SelectItem value="Water">Water Resources</SelectItem>
                  <SelectItem value="Wildlife">Wildlife</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title / Subject</Label>
              <Input
                id="title"
                placeholder="Brief summary of your complaint"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description / Message</Label>
              <Textarea
                id="description"
                placeholder="Provide details about your complaint"
                className="min-h-[100px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <h4 className="text-md font-semibold pt-4 border-t">Optional: Tweet Details</h4>
            <div className="space-y-2">
              <Label htmlFor="tweet">Tweet Content</Label>
              <Textarea
                id="tweet"
                placeholder="What would you like to tweet about this issue?"
                className="min-h-[80px]"
                value={tweetText}
                onChange={(e) => setTweetText(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tag Users (@mentions)</Label>
              <Input
                id="tags"
                placeholder="@username1 @username2"
                value={taggedUsers}
                onChange={(e) => setTaggedUsers(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label>Upload Photo (Optional - Not Saved to Backend)</Label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                  ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'}
                  ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input {...getInputProps()} disabled={isSubmitting} />
                {image ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{image.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        if (isSubmitting) return;
                        e.stopPropagation();
                        removeImage();
                      }}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop an image here, or click to select
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
              <Twitter className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <MessageSquare className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold">What happens next?</h3>
              <p className="text-sm text-muted-foreground">
                Our response process explained
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600/10 text-green-600">
                1
              </div>
              <div>
                <h4 className="font-semibold">Submission Received</h4>
                <p className="text-sm text-muted-foreground">Your complaint is recorded in our system.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600/10 text-green-600">
                2
              </div>
              <div>
                <h4 className="font-semibold">Admin Review</h4>
                <p className="text-sm text-muted-foreground">An administrator will review your submission.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600/10 text-green-600">
                3
              </div>
              <div>
                <h4 className="font-semibold">Action / Resolution</h4>
                <p className="text-sm text-muted-foreground">Appropriate action will be taken based on the review.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function ComplaintsPage() {
    return (
        <AuthGuard>
            <ComplaintsPageContent />
        </AuthGuard>
    );
}