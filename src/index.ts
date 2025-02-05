import { queryJobsAPI, queryMembersAPI } from './api/recruitment';
import { generateMatches } from './recommendations/match';

console.log('Hello, world!');

async function main() {
   const members = await queryMembersAPI();
   console.log('members in main: ', members);

   const jobs = await queryJobsAPI();
   console.log('jobs in main: ', jobs);

   generateMatches(jobs, members);
}

main();
