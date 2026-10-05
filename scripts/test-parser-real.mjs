import { fetchAndParseForm } from '../src/services/formParser.ts';

async function test() {
  console.log('Testing formParser on https://forms.gle/cyEzZ6PBuYSPd1cz8 ...');
  const result = await fetchAndParseForm('https://forms.gle/cyEzZ6PBuYSPd1cz8');
  console.log('Parsed Title:', result.title);
  console.log('Total Pages:', result.totalPages);
  console.log('Total Questions:', result.totalQuestions);
  console.log('Required Questions:', result.requiredQuestionsCount);
  console.log('First Page Title:', result.pages[0].title);
  console.log('Last Page Title:', result.pages[result.totalPages - 1].title);
  console.log('Sample Question 1:', JSON.stringify(result.pages[0].questions[0], null, 2));

  if (result.totalPages !== 35) {
    throw new Error(`Expected 35 pages, got ${result.totalPages}`);
  }
  console.log('All 35 pages verified successfully!');
}

test().catch(console.error);
