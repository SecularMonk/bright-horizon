import { queryJobsAPI, queryMembersAPI } from './api/recruitment';
import { generateMatches } from './recommendations/match';

console.log('Hello, world!');

async function main() {
   const [members, jobs] = await Promise.all([
      queryMembersAPI(),
      queryJobsAPI(),
   ]);

   generateMatches(jobs, members);
}

main();
