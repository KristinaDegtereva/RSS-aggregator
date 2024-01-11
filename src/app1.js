import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import _ from 'lodash';
import onChange from 'on-change';
import initView from './view.js';
import i18next from 'i18next';
import resources from './locales/index.js';
import parse from './parse.js';
import axios from 'axios';


export default () => {
  const state = {
    form: {
      field: {
        url: '',
      },
      allUrls: [],
      processState: '',
      error: {},
      parsed:  {
        feed: {},
        posts: [],
      },
    },
  };

  const getRoute = (url) => {
    const result = new URL('/get', 'https://allorigins.hexlet.app');
    result.searchParams.set('url', url);
    result.searchParams.set('disableCache', 'true');
    return result.toString();
  };

  const fetchFeed = (link) => (axios.get(getRoute(link))
    .then(({ data }) => {
      const { contents } = data;
      if (!contents.includes('xml')) {
        const error = {
          errors: [{ key: 'rssError' }],
        };
        throw error;
      }
      return { url: link, contents };
    }));

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    submit: document.querySelector('button[type="submit"]'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts')
  };

  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  })
    .then(() => {
      yup.setLocale({
        mixed: {
          notOneOf: () => ({ key: 'dublicateError' }),
        },
        string: {
          url: () => ({ key: 'urlError' }),
        },
      });

      const watchState = onChange(state, initView(elements, i18n, state));

      elements.form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const value = (formData.get('url')).trim();
        watchState.form.field.url = value;

        const urls = state.form.allUrls.map(({ url }) => url);
        const schema = yup.string()
          .url()
          .notOneOf(urls);

        const successAdd = (url) => {
          watchState.form.allUrls.push({ url, feedId: _.uniqueId() });
          watchState.form.field.url = '';
          watchState.form.processState = 'sending';
          watchState.form.error = {};
        }

        schema.validate(value)
          .then((url) => {
            successAdd(url);
            return fetchFeed(url)
          })
          .then(({ url, contents }) => {
            const getParse = parse(contents, watchState, url);
            watchState.form.processState = 'success';
            return getParse;
          })
        .catch((e) => {
          watchState.form.error = e.message;
          return _.keyBy(e.inner, 'path');
        })
    })
})
};
