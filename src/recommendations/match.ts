/**
 * @fileoverview This file contains logic to match jobs to job seekers.
 * It uses fuzzy matching on to extract desired job titles and locations from user responses.
 * It then compares those responses to the available jobs and locations, and generates a score for each job.
 */

import 'dotenv/config';
import { JobsResponse, MembersResponse } from '../api/recruitment.js';
import nlp from 'compromise';
//@ts-ignore
import Fuse, { IFuseOptions } from 'fuse.js';

export type MatchWithWeight = [string, number];
export type JobScore = {
   totalScore: number;
   title: string;
   location: string;
};

export function generateMatches(jobs: JobsResponse, members: MembersResponse) {
   const fuseSettings: IFuseOptions<string> = {
      isCaseSensitive: false,
      includeScore: true,
   };

   const jobsFuse = new Fuse(
      jobs.map((job) => job.title).filter((job) => job),
      fuseSettings
   );

   const locationsFuse = new Fuse(
      jobs.map((job) => job.location).filter((job) => job),
      fuseSettings
   );

   const totalScores: JobScore[] = [];
   for (const member of members) {
      const doc = nlp(member.bio);
      const desiredJobs: string[] = doc.nouns().out('array');
      const desiredLocations: string[] = doc.places().out('array');

      const matchingJobs = findDistinctMatchesWithWeights(
         desiredJobs,
         jobsFuse
      );

      const matchingLocations = findDistinctMatchesWithWeights(
         desiredLocations,
         locationsFuse
      );

      const userScores = generateJobScores(
         jobs,
         matchingJobs,
         matchingLocations
      );
      displayScores(userScores, member.name);
      totalScores.push(...userScores);
   }
   return totalScores;
}

export function findDistinctMatchesWithWeights(
   targets: string[],
   fuse: Fuse<string>
): MatchWithWeight[] {
   const matches = targets
      .map((item) => fuse.search(item))
      .flat(2)
      .filter((item) => item !== undefined)
      .sort((a, b) => (a?.score ?? 0) - (b?.score ?? 0));

   return [...new Map(matches.map((match) => [match.item, match.score ?? 0]))];
}

export function generateJobScores(
   jobs: JobsResponse,
   jobMatches: MatchWithWeight[],
   locationMatches: MatchWithWeight[]
): JobScore[] {
   return jobs
      .map((job) => {
         const jobScore =
            jobMatches.find((match) => match[0] === job.title)?.[1] ?? 0;
         const locationScore =
            locationMatches.find((match) => match[0] === job.location)?.[1] ??
            0;
         if (jobScore + locationScore > 0) {
            return { ...job, totalScore: jobScore + locationScore };
         }
      })
      .filter((job) => job !== undefined)
      .sort((a, b) => b.totalScore - a.totalScore);
}

function displayScores(totalScores: JobScore[], member: string) {
   if (totalScores.length === 0) {
      return console.log(`Sorry ${member}, no jobs matched your search :(`);
   }
   const tabularFormat = totalScores.map((totalScore, index) => {
      return {
         Member: member,
         JobRank: index + 1,
         Title: totalScore.title,
         Location: totalScore.location,
      };
   });
   console.table(tabularFormat);
}
