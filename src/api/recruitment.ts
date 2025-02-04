/**
 * @fileoverview This file contains methods for interacting with the Bright Network API
 * It exposes methods for specific endpoints
 */

import { wrapEndpoint } from './lib';

export type MembersResponse = {
   name: string;
   bio: string;
}[];

export type JobsResponse = {
   title: string;
   location: string;
}[];

export const queryMembersAPI = wrapEndpoint<MembersResponse>('members.json');
export const queryJobsAPI = wrapEndpoint<JobsResponse>('jobs.json');
