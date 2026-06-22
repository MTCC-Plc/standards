export interface SharePointToken {
    accessToken: string;
    expiresAt: string;
    tenantId: string;
    clientId: string;
    principalId: string;
    siteUrl: string;
    siteName: string;
    url: string;
}
export interface GraphToken {
    accessToken: string;
    driveId: string;
    siteId: string;
}
