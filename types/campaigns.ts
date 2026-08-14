export interface Campaign {
  id: string;
  gophishCampaignId: number | null;
  name: string;
  type: string;
  status: string;
  launchedAt: string | null;
  completedAt: string | null;
  results: CampaignResults;
  templateHtml?: string | null;
  landingPageHtml?: string | null;
  campaignResults: CampaignResult[];
  createdAt: string;
  updatedAt: string;
  _count: { campaignResults: number };
}

export interface CampaignResults {
  total: number;
  sent: number;
  opened: number;
  clicked: number;
  submittedData: number;
  reported: number;
  clickedDetails: Array<{
    email: string;
    firstName: string;
    lastName: string;
    clickedAt: string;
    ip: string;
  }>;
}

export interface CampaignResult {
  id: string;
  campaignId: string;
  gophishCampaignId: number;
  employeeEmail: string;
  eventType: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface LaunchCampaignPayload {
  name: string;
  employeeEmails: Array<{ email: string; firstName?: string; lastName?: string }>;
  templateHtml: string;
  landingPageHtml: string;
}
