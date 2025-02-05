import {
   findDistinctMatchesWithWeights,
   generateJobScores,
   MatchWithWeight,
   JobScore,
} from '../recommendations/match';
import { JobsResponse } from '../api/recruitment';
// @ts-ignore
import Fuse from 'fuse.js';
jest.mock('fuse.js');

describe('Job matching', () => {
   jest.mock('fuse.js');

   describe('findDistinctMatchesWithWeights', () => {
      it('should return distinct matches sorted by score', () => {
         // Create a mock for Fuse's search function
         const mockFuse = {
            search: jest.fn((query) => {
               const mockResults: Record<string, any[]> = {
                  apple: [{ item: 'apple', score: 0.1 }],
                  banana: [{ item: 'banana', score: 0.2 }],
                  orange: [{ item: 'orange', score: 0.3 }],
                  grape: [{ item: 'grape', score: 0.4 }],
               };
               return mockResults[query] || [];
            }),
         } as unknown as Fuse<string>;

         const targets = ['apple', 'banana', 'orange', 'grape'];

         const result = findDistinctMatchesWithWeights(targets, mockFuse);

         expect(result).toEqual([
            ['apple', 0.1],
            ['banana', 0.2],
            ['orange', 0.3],
            ['grape', 0.4],
         ]);

         // Ensure search was called with each target
         targets.forEach((target) => {
            expect(mockFuse.search).toHaveBeenCalledWith(target);
         });
      });
   });

   describe('generateJobScores', () => {
      it('should return jobs with combined scores, sorted by totalScore descending', () => {
         const jobs: JobsResponse = [
            { title: 'Software Engineer', location: 'New York' },
            { title: 'Product Manager', location: 'San Francisco' },
            { title: 'Data Scientist', location: 'Remote' },
         ];

         const jobMatches: MatchWithWeight[] = [
            ['Software Engineer', 0.8],
            ['Product Manager', 0.5],
         ];

         const locationMatches: MatchWithWeight[] = [
            ['New York', 0.2],
            ['San Francisco', 0.4],
         ];

         const result = generateJobScores(jobs, jobMatches, locationMatches);

         expect(result).toEqual([
            {
               title: 'Software Engineer',
               location: 'New York',
               totalScore: 1.0,
            },
            {
               title: 'Product Manager',
               location: 'San Francisco',
               totalScore: 0.9,
            },
         ]);

         expect(result[0].totalScore).toBeGreaterThan(result[1].totalScore);
      });

      it('should filter out jobs with a total score of 0', () => {
         const jobs: JobsResponse = [
            { title: 'Software Engineer', location: 'New York' },
            { title: 'Marketing Specialist', location: 'London' },
         ];

         const jobMatches: MatchWithWeight[] = [['Software Engineer', 0.7]];
         const locationMatches: MatchWithWeight[] = [['New York', 0.3]];

         const result = generateJobScores(jobs, jobMatches, locationMatches);

         expect(result).toEqual([
            {
               title: 'Software Engineer',
               location: 'New York',
               totalScore: 1.0,
            },
         ]);
      });

      it('should handle missing matches gracefully', () => {
         const jobs: JobsResponse = [
            { title: 'Software Engineer', location: 'New York' },
            { title: 'Data Analyst', location: 'Los Angeles' },
         ];

         const jobMatches: MatchWithWeight[] = [['Software Engineer', 0.6]];
         const locationMatches: MatchWithWeight[] = [['New York', 0.2]];

         const result = generateJobScores(jobs, jobMatches, locationMatches);

         expect(result).toEqual([
            {
               title: 'Software Engineer',
               location: 'New York',
               totalScore: 0.8,
            },
         ]);

         expect(result).not.toContainEqual(
            expect.objectContaining({ title: 'Data Analyst' })
         );
      });

      it('should return an empty array if no jobs have a nonzero score', () => {
         const jobs: JobsResponse = [
            { title: 'Software Engineer', location: 'New York' },
         ];

         const jobMatches: MatchWithWeight[] = [];
         const locationMatches: MatchWithWeight[] = [];

         const result = generateJobScores(jobs, jobMatches, locationMatches);

         expect(result).toEqual([]);
      });

      it('should correctly handle ties by preserving the original order', () => {
         const jobs: JobsResponse = [
            { title: 'Software Engineer', location: 'New York' },
            { title: 'Data Scientist', location: 'Remote' },
         ];

         const jobMatches: MatchWithWeight[] = [
            ['Software Engineer', 0.7],
            ['Data Scientist', 0.7],
         ];

         const locationMatches: MatchWithWeight[] = [];

         const result = generateJobScores(jobs, jobMatches, locationMatches);

         expect(result).toEqual([
            {
               title: 'Software Engineer',
               location: 'New York',
               totalScore: 0.7,
            },
            { title: 'Data Scientist', location: 'Remote', totalScore: 0.7 },
         ]);
      });
   });
});
