async function inspect() {
  const url = 'https://forms.gle/cyEzZ6PBuYSPd1cz8';
  console.log('Fetching', url);
  const res = await fetch(url, { redirect: 'follow' });
  const html = await res.text();
  const match = html.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*(\[[\s\S]*?\]);\s*<\/script>/);
  if (!match) {
    console.log('FB_PUBLIC_LOAD_DATA_ not found');
    return;
  }
  const data = JSON.parse(match[1]);
  console.log('=== FORM METADATA ===');
  console.log('data[1][0] (desc/header):', data[1]?.[0]);
  console.log('data[1][8] (form title):', data[1]?.[8]);
  console.log('data[3] (title):', data[3]);
  console.log('data[1][2] (other field?):', data[1]?.[2]);

  const items = data[1]?.[1] || [];
  console.log('Total items:', items.length);

  const typeCounts = {};
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const type = it[3];
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  }
  console.log('Type counts:', typeCounts);

  // Group by pages (type 8)
  const pages = [];
  let currentPage = {
    pageNumber: 1,
    title: 'Page 1',
    description: '',
    items: []
  };

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const id = it[0];
    const title = it[1] || '';
    const description = it[2] || '';
    const type = it[3];
    const rawDetails = it[4];

    if (type === 8) {
      // Page break starts a new page!
      pages.push(currentPage);
      currentPage = {
        pageNumber: pages.length + 1,
        title: title || `Section ${pages.length + 1}`,
        description: description || (rawDetails?.[0]?.[1] || ''),
        items: []
      };
    } else {
      currentPage.items.push({
        id,
        title,
        description,
        type,
        rawDetails
      });
    }
  }
  pages.push(currentPage);

  console.log('Total pages parsed:', pages.length);
  pages.forEach((p, idx) => {
    console.log(`Page ${idx + 1}: "${p.title}" (${p.items.length} items) - desc: ${p.description.slice(0, 40)}`);
  });

  // Let's inspect sample items of each type
  console.log('\n=== SAMPLE QUESTIONS PER TYPE ===');
  const seenTypes = new Set();
  for (const page of pages) {
    for (const item of page.items) {
      if (!seenTypes.has(item.type)) {
        seenTypes.add(item.type);
        console.log(`\n--- Type ${item.type} Sample ---`);
        console.log('Title:', item.title);
        console.log('Raw details:', JSON.stringify(item.rawDetails, null, 2));
      }
    }
  }
}

inspect().catch(console.error);
