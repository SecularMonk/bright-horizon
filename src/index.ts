import { queryJobsAPI, queryMembersAPI } from './api/recruitment';
import { logger } from './logging';
import { generateMatches } from './recommendations/match';

console.log('Hello, world!');

async function main() {
   logger.info('Beginning job search...');

   const [members, jobs] = await Promise.all([
      queryMembersAPI(),
      queryJobsAPI(),
   ]).catch((err) => {
      logger.error(`Failed to query job and member data ${err}`);
      throw err;
   });
   logger.info(`Successfully queries job and member data`);

   generateMatches(jobs, members);
   logger.info(`Successfully completed job match`);
}

main();
