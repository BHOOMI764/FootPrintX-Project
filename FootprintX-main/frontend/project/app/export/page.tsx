'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Table, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import AuthGuard from '@/components/AuthGuard';
import apiClient from '@/lib/apiClient';

interface Calculation {
  id: number;
  inputData: any;
  result: number;
  score: number;
  createdAt: string;
}

interface ExportData {
  calculations: Calculation[];
  summary: {
    count: number;
    totalScore: number;
    averageScore: number;
    lastUpdated: string | null;
  };
}

function ExportContent() {
  const [data, setData] = useState<ExportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const limit = dateRange === 'all' ? 1000 : parseInt(dateRange);
        const response = await apiClient.get(`/api/calculate/history?limit=${limit}`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data for export');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const exportToCSV = () => {
    if (!data) return;

    setExporting(true);
    try {
      const csvContent = generateCSV(data);
      downloadFile(csvContent, 'carbon-footprint-data.csv', 'text/csv');
      toast.success('CSV file downloaded successfully!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV file');
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = () => {
    if (!data) return;

    setExporting(true);
    try {
      const pdfContent = generatePDF(data);
      downloadFile(pdfContent, 'carbon-footprint-report.pdf', 'application/pdf');
      toast.success('PDF report downloaded successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF file');
    } finally {
      setExporting(false);
    }
  };

  const generateCSV = (data: ExportData): string => {
    const headers = [
      'Date',
      'Transportation (km/day)',
      'Energy (kWh/month)',
      'Waste (kg/week)',
      'Shopping ($/month)',
      'Flights (hours/year)',
      'Total Emissions (kg CO2e)',
      'Score'
    ];

    const rows = data.calculations.map(calc => [
      new Date(calc.createdAt).toLocaleDateString(),
      calc.inputData.transportation_km_day || calc.inputData.internet_gb_month || 'N/A',
      calc.inputData.energy_kwh_month || calc.inputData.streaming_hours_month || 'N/A',
      calc.inputData.waste_kg_week || calc.inputData.cloud_storage_gb || 'N/A',
      calc.inputData.shopping_usd_month || calc.inputData.emails_sent_month || 'N/A',
      calc.inputData.flights_hours_year || calc.inputData.video_calls_hours_month || 'N/A',
      calc.result.toFixed(2),
      calc.score
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  };

  const generatePDF = (data: ExportData): string => {
    // Simple HTML-based PDF generation
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Carbon Footprint Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { background: #f5f5f5; padding: 20px; margin-bottom: 30px; border-radius: 8px; }
          .summary h3 { margin-top: 0; }
          .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
          .summary-item { text-align: center; }
          .summary-value { font-size: 24px; font-weight: bold; color: #16a34a; }
          .summary-label { color: #666; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌱 Carbon Footprint Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="summary">
          <h3>Summary</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value">${data.summary.count}</div>
              <div class="summary-label">Total Calculations</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${data.summary.totalScore.toLocaleString()}</div>
              <div class="summary-label">Total Score</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${data.summary.averageScore.toLocaleString()}</div>
              <div class="summary-label">Average Score</div>
            </div>
          </div>
        </div>

        <h3>Calculation History</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Emissions (kg CO₂e)</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            ${data.calculations.map(calc => `
              <tr>
                <td>${new Date(calc.createdAt).toLocaleDateString()}</td>
                <td>${calc.inputData.type === 'digital' ? 'Digital' : 'Physical'}</td>
                <td>${calc.result.toFixed(2)}</td>
                <td>${calc.score}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>This report was generated by FootprintX - Your Carbon Footprint Tracking Platform</p>
          <p>For more information, visit our dashboard at footprintx.com</p>
        </div>
      </body>
      </html>
    `;

    return htmlContent;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Export Your Data</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Download your carbon footprint data in CSV or PDF format for personal records, workplace reporting, or school projects.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Table className="h-5 w-5 text-blue-600" />
              Export Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="50">Last 50 Entries</SelectItem>
                  <SelectItem value="20">Last 20 Entries</SelectItem>
                  <SelectItem value="10">Last 10 Entries</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data Summary</label>
              <div className="text-sm text-muted-foreground">
                <p>• {data?.summary.count || 0} total calculations</p>
                <p>• {data?.summary.totalScore || 0} total score</p>
                <p>• {data?.summary.averageScore || 0} average score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-green-600" />
              Export Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={exportToCSV}
              disabled={exporting || !data}
              className="w-full"
              variant="outline"
            >
              <Table className="h-4 w-4 mr-2" />
              {exporting ? 'Exporting...' : 'Export as CSV'}
            </Button>

            <Button
              onClick={exportToPDF}
              disabled={exporting || !data}
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              {exporting ? 'Generating...' : 'Export as PDF'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Export Information */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Export Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">CSV Export</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Raw data in spreadsheet format</li>
                <li>• Includes all calculation details</li>
                <li>• Compatible with Excel, Google Sheets</li>
                <li>• Perfect for data analysis</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">PDF Export</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Formatted report with summary</li>
                <li>• Professional presentation</li>
                <li>• Ideal for sharing or printing</li>
                <li>• Great for reports and presentations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Preview */}
      {data && data.calculations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Emissions</th>
                    <th className="text-left p-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {data.calculations.slice(0, 5).map((calc) => (
                    <tr key={calc.id} className="border-b">
                      <td className="p-2">{new Date(calc.createdAt).toLocaleDateString()}</td>
                      <td className="p-2">{calc.inputData.type === 'digital' ? 'Digital' : 'Physical'}</td>
                      <td className="p-2">{calc.result.toFixed(2)} kg CO₂e</td>
                      <td className="p-2">{calc.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.calculations.length > 5 && (
                <p className="text-sm text-muted-foreground mt-2">
                  ... and {data.calculations.length - 5} more entries
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ExportPage() {
  return (
    <AuthGuard>
      <ExportContent />
    </AuthGuard>
  );
}
