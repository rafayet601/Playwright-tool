import { chromium } from 'playwright';

interface HNItem {
  title: string;
  link: string;
  points: number;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const items: HNItem[] = [];

  for (let pageNum = 1; pageNum <= 4; pageNum++) {
    await page.goto(`https://news.ycombinator.com/news?p=${pageNum}`);

    const posts = await page.$$('tr.athing');

    for (const post of posts) {
      const titleElem = await post.$('span.titleline > a');
      const title = (await titleElem?.innerText()) || '';
      const link = (await titleElem?.getAttribute('href')) || '';

      if (!title || !link) {
        const html = await post.innerHTML();
        console.warn('Selector failed for post row:', html);
      }

      const subtextHandle = await post.evaluateHandle(row => row.nextElementSibling);
      const scoreElem = await subtextHandle.asElement()?.$('span.score');
      const scoreText = await scoreElem?.innerText();
      const points = scoreText ? parseInt(scoreText.replace(' points', '')) : 0;

      items.push({ title, link, points });
    }
  }

  const top100 = items.sort((a, b) => b.points - a.points).slice(0, 100);
  console.log(top100);

  await browser.close();
})();
