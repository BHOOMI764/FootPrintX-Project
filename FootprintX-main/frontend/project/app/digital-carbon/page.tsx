'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { toast } from "sonner";
import apiClient from '@/lib/apiClient';
import { computeDigital } from '@/lib/formulas';
import AuthGuard from '@/components/AuthGuard';
import {
  Wifi,
  Cloud,
  Monitor,
  Smartphone,
  Server,
  Download,
  Upload,
  Factory,
  Video,
} from 'lucide-react';
// import axios from 'axios';

function DigitalCarbonPageContent() {
  const [internetUsage, setInternetUsage] = useState(0); // GB per month
  const [streamingHours, setStreamingHours] = useState(0); // Hours per month
  const [cloudStorage, setCloudStorage] = useState(0); // GB stored
  const [emailsSent, setEmailsSent] = useState(0); // Emails per month
  const [videoCalls, setVideoCalls] = useState(0); // Hours per month
  const [socialMedia, setSocialMedia] = useState(0); // Hours per month
  const [isSaving, setIsSaving] = useState(false);

  // Use centralized computation for digital footprint
  const digital = computeDigital({
    internetGBPerMonth: internetUsage,
    streamingHoursPerMonth: streamingHours,
    cloudStorageGB: cloudStorage,
    emailsPerMonth: emailsSent,
    videoCallHoursPerMonth: videoCalls,
    socialHoursPerMonth: socialMedia
  });

  const internetScore = digital.breakdown.internet;
  const streamingScore = digital.breakdown.streaming;
  const cloudScore = digital.breakdown.cloud;
  const emailScore = digital.breakdown.emails;
  const videoCallScore = digital.breakdown.videoCalls;
  const socialMediaScore = digital.breakdown.social;

  const totalDigitalEmissions = digital.totalMonthly;
  const scoreForLeaderboard = digital.annualScore;

  const handleSaveCalculation = async () => {
    setIsSaving(true);
    const calculationData = {
      inputData: {
        internet_gb_month: internetUsage,
        streaming_hours_month: streamingHours,
        cloud_storage_gb: cloudStorage,
        emails_sent_month: emailsSent,
        video_calls_hours_month: videoCalls,
        social_media_hours_month: socialMedia,
        type: 'digital'
      },
      result: totalDigitalEmissions,
      score: scoreForLeaderboard,
    };

    try {
      const response = await apiClient.post('/api/calculate', calculationData);
      console.log('Digital calculation saved:', response.data);
      toast.success("Digital carbon footprint saved successfully!")
    } catch (error: any) {
      let errorMessage = "Failed to save digital calculation.";
      if (error.response?.data) {
        console.error('Axios error details:', error.response?.data || error.message);
        errorMessage = error.response?.data?.msg || error.message || errorMessage;
      } else {
        console.error('Non-Axios error:', error);
      }
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Digital Carbon Footprint</h1>
        <p className="mt-2 text-muted-foreground">
          Track your digital environmental impact from internet usage, streaming, and cloud services.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <Wifi className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">Internet Usage</h3>
              <p className="text-sm text-muted-foreground">
                Monthly data consumption (GB)
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <Slider
              value={[internetUsage]}
              onValueChange={(value) => setInternetUsage(value[0])}
              max={1000}
              step={10}
              disabled={isSaving}
            />
            <div className="flex justify-between text-sm">
              <span>{internetUsage} GB/month</span>
              <span>{internetScore.toFixed(2)} kg CO₂e/month</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <Monitor className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">Streaming Services</h3>
              <p className="text-sm text-muted-foreground">
                Hours of video streaming per month
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <Slider
              value={[streamingHours]}
              onValueChange={(value) => setStreamingHours(value[0])}
              max={200}
              step={1}
              disabled={isSaving}
            />
            <div className="flex justify-between text-sm">
              <span>{streamingHours} hours/month</span>
              <span>{streamingScore.toFixed(2)} kg CO₂e/month</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <Cloud className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">Cloud Storage</h3>
              <p className="text-sm text-muted-foreground">
                Total cloud storage used (GB)
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <Slider
              value={[cloudStorage]}
              onValueChange={(value) => setCloudStorage(value[0])}
              max={1000}
              step={10}
              disabled={isSaving}
            />
            <div className="flex justify-between text-sm">
              <span>{cloudStorage} GB stored</span>
              <span>{cloudScore.toFixed(2)} kg CO₂e/month</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <Server className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">Email Usage</h3>
              <p className="text-sm text-muted-foreground">
                Emails sent per month
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <Slider
              value={[emailsSent]}
              onValueChange={(value) => setEmailsSent(value[0])}
              max={1000}
              step={10}
              disabled={isSaving}
            />
            <div className="flex justify-between text-sm">
              <span>{emailsSent} emails/month</span>
              <span>{emailScore.toFixed(3)} kg CO₂e/month</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <Video className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">Video Calls</h3>
              <p className="text-sm text-muted-foreground">
                Hours of video conferencing per month
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <Slider
              value={[videoCalls]}
              onValueChange={(value) => setVideoCalls(value[0])}
              max={100}
              step={1}
              disabled={isSaving}
            />
            <div className="flex justify-between text-sm">
              <span>{videoCalls} hours/month</span>
              <span>{videoCallScore.toFixed(2)} kg CO₂e/month</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <Smartphone className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">Social Media</h3>
              <p className="text-sm text-muted-foreground">
                Hours spent on social platforms per month
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <Slider
              value={[socialMedia]}
              onValueChange={(value) => setSocialMedia(value[0])}
              max={200}
              step={1}
              disabled={isSaving}
            />
            <div className="flex justify-between text-sm">
              <span>{socialMedia} hours/month</span>
              <span>{socialMediaScore.toFixed(2)} kg CO₂e/month</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-8 p-6">
        <div className="mb-6 flex items-center gap-4">
          <Factory className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold">Total Digital Carbon Footprint</h3>
            <p className="text-sm text-muted-foreground">
              Estimated monthly digital emissions
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <Progress value={Math.min((totalDigitalEmissions / 50) * 100, 100)} />
          <div className="flex justify-between text-sm">
            <span>Monthly Total</span>
            <span className="font-semibold">{totalDigitalEmissions.toFixed(2)} kg CO₂e</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>(Annual Score for Leaderboard)</span>
            <span className="font-semibold">{scoreForLeaderboard}</span>
          </div>
        </div>
        <Button
          className="mt-6 w-full"
          onClick={handleSaveCalculation}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Digital Calculation'}
        </Button>
      </Card>

      {/* Digital Carbon Tips */}
      <Card className="mt-8 p-6">
        <h3 className="text-lg font-semibold mb-4">💡 Digital Carbon Reduction Tips</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h4 className="font-medium">Streaming & Entertainment</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use lower video quality when possible</li>
              <li>• Download content for offline viewing</li>
              <li>• Choose audio-only options for music</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Cloud & Storage</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Regularly clean up unused files</li>
              <li>• Use local storage for frequently accessed files</li>
              <li>• Compress images before uploading</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Communication</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use audio-only calls when video is not needed</li>
              <li>• Send shorter, more concise emails</li>
              <li>• Avoid unnecessary email attachments</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">General Usage</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Close unused browser tabs</li>
              <li>• Use dark mode to reduce screen energy</li>
              <li>• Enable power-saving modes on devices</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function DigitalCarbonPage() {
  return (
    <AuthGuard>
      <DigitalCarbonPageContent />
    </AuthGuard>
  );
}
