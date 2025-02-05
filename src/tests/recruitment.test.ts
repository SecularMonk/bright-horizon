import { queryJobsAPI, queryMembersAPI } from '../api/recruitment';
import { wrapEndpoint } from '../api/lib';

describe('API', () => {
   describe('API wrapper', () => {
      it('should throw an error on successive retries', async () => {
         await expect(wrapEndpoint('fakeEndpoint.json')()).rejects.toThrow();
      });
   });

   describe('members API', () => {
      it('should return data', async () => {
         const result = await queryMembersAPI();
         expect(result?.length).toBeGreaterThan(0);
      });
      it('should contain correct data', async () => {
         const result = await queryMembersAPI();

         const expectedResult = expect.objectContaining({
            name: expect.any(String),
            bio: expect.any(String),
         });
         expect(result).toEqual(expect.arrayContaining([expectedResult]));
      });
   });

   describe('jobs API', () => {
      it('should return data', async () => {
         const result = await queryJobsAPI();
         expect(result?.length).toBeGreaterThan(0);
      });
      it('should contain correct data', async () => {
         const result = await queryJobsAPI();

         const expectedResult = expect.objectContaining({
            title: expect.any(String),
            location: expect.any(String),
         });
         expect(result).toEqual(expect.arrayContaining([expectedResult]));
      });
   });
});
