/**
 * @fileoverview This file contains methods for interacting with the Bright Network API
 * It exposes methods for specific endpoints
 */

import { wrapEndpoint } from './config';

type MembersResponse = {
   name: string;
   bio: string;
}[];

type JobsResponse = {
   title: string;
   location: string;
}[];

export const queryMembersAPI = wrapEndpoint<MembersResponse>('members.json');
export const queryJobsAPI = wrapEndpoint<JobsResponse>('jobs.json');
