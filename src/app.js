import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import _ from 'lodash';
import onChange from 'on-change';
import initView from './view.js';
import i18next from 'i18next';
import resources from './locales/index.js';
import parse from './parse.js';

export default () => {
  const state = {
    form: {
      field: {
        url: '',
      },
      allUrls: [],
      processState: '',
      error: {},
      parsed: {},
    },
  };

  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  yup.setLocale({
    mixed: {
      notOneOf: () => ({ key: 'dublicateError' }),
    },
    string: {
      url: () => ({ key: 'urlError' }),
    },
  });


  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    submit: document.querySelector('button[type="submit"]'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts')
  };

  const watchState = onChange(state, initView(elements, i18n));

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const value = (formData.get('url')).trim();
    watchState.form.field.url = value;

    const urls = state.form.allUrls.map(({ url }) => url);
    const schema = yup.string()
      .url()
      .notOneOf(urls);

    const validated = (url) => {
      watchState.form.allUrls.push({ url, feedId: _.uniqueId() });
      watchState.form.field.url = '';
      watchState.form.processState = 'sending';
      watchState.form.error = {};
    }

    schema.validate(value)
      .then((url) => {
        validated(url);
        fetch(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`)
          .then(response => {
            if (response.ok) return response.json()
            throw new Error('Network response was not ok.')
          })
          .then((data) => {
            // console.log(data.contents);
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.contents, 'text/xml');
            const feedTitle = doc.querySelector('title').textContent;
            const feedDescription = doc.querySelector('description').textContent;
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
            return {
              feed: {
                url,
                title: feedTitle,
                description: feedDescription,
              },
              posts,
            };
          })
      })
      .then((data) => {
        console.log(data);
      })
      .catch((e) => {
        watchState.form.error = e.message;
        return _.keyBy(e.inner, 'path');
      })
  })
};
