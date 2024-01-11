export default (contents, watchState, url) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(contents, 'text/xml');
    const feedTitle = doc.querySelector('channel > title').textContent;
    const feedDescription = doc.querySelector('channel > description').textContent;
    const items = doc.querySelectorAll('item');
    const posts = [];
    items.forEach((item) => {
      const title = item.querySelector('title').textContent;
      const description = item.querySelector('description').textContent;
      const link = item.querySelector('link').textContent;
      const pubDate = item.querySelector('pubDate').textContent;
      posts.push({
        title,
        description,
        link,
        pubDate,
      });
    });
    const obj = {
      feed: {
        url,
        title: feedTitle,
        description: feedDescription,
      },
      posts,
    };
    watchState.form.parsed = obj;
    return obj;
  };
  