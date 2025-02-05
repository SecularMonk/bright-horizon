// import OpenAI from '../../node_modules/openai/index';
// import { z } from 'zod';
import 'dotenv/config';
import { JobsResponse, MembersResponse } from '../api/recruitment.js';
import nlp from 'compromise';
//@ts-ignore
import Fuse from 'fuse.js';

export function generateMatches(jobs: JobsResponse, members: MembersResponse) {
   const jobsFuse = new Fuse(
      jobs.map((job) => job.title).filter((job) => job),
      { isCaseSensitive: false, includeScore: true }
   );

   const locationsFuse = new Fuse(
      jobs.map((job) => job.location).filter((job) => job),
      { isCaseSensitive: false, includeScore: true }
   );

   for (const member of members) {
      const doc = nlp(member.bio);
      const desiredJobs: string[] = doc.nouns().out('array');
      const desiredLocations: string[] = doc.places().out('array');

      const matchingJobs = findDistinctMatchesWithWeights(desiredJobs, jobsFuse);

      const matchingLocations = findDistinctMatchesWithWeights(
         desiredLocations,
         locationsFuse
      );

      matchingJobs.forEach((result) =>
         console.log(`${member.name} job: ${result}`)
      );

      matchingLocations.forEach((result) =>
         console.log(`${member.name} location: ${result}`)
      );
   }
}

function findDistinctMatchesWithWeights(targets: string[], fuse: Fuse<string>) {
   const matches = targets
      .map((item) => fuse.search(item))
      .flat(2)
      .filter((item) => item !== undefined)
      .sort((a, b) => (a?.score ?? 0) - (b?.score ?? 0));

   return [...new Map(matches.map((match) => [match.item, match.score]))];
}
