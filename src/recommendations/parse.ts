// import OpenAI from '../../node_modules/openai/index';
// import { z } from 'zod';
import 'dotenv/config';
import { JobsResponse, MembersResponse } from '../api/recruitment.js';
import nlp from 'compromise';
import Fuse from 'fuse.js';

export function generateMatches(jobs: JobsResponse, members: MembersResponse) {
   const jobsFuse = new Fuse(
      jobs.map((job) => job.title).filter((job) => job),
      { threshold: 0.3, isCaseSensitive: false }
   );

   const locationsFuse = new Fuse(
      jobs.map((job) => job.location).filter((job) => job),
      { threshold: 0.3, isCaseSensitive: false }
   );

   // const test = locationsFuse.search('Edinburgh');
   // console.log('test: ', test);

   for (const member of members) {
      const doc = nlp(member.bio);
      const jobs = doc.nouns().out('array');
      const jobResults = jobsFuse.search(jobs);
      const locations = doc.places().out('array');
      const locationResults = locations.map((location) =>
         locationsFuse.search(location)
      );
      console.log(
         `name: ${
            member.name
         }, jobs: ${jobResults}, locationsBefore: ${locations}, isArray: ${Array.isArray(
            locations
         )} locations: ${locationResults}`
      );
   }
}

export function extractRolesAndLocationsNLP(data: MembersResponse) {
   for (const entry of data) {
      const doc = nlp(entry.bio);
      console.log('locations: ', doc.places().out('array'));
      console.log('interests: ', doc.nouns().out('array'));
   }
}
