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
        const value = formData.get('url');
        watchState.form.field.url = value.trim();
        
        const urls = state.form.allUrls.map(({url}) => url);
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
            return parse(url);
          })
          .then(({feed, posts}) => {
            watchState.form.parsed = {feed, posts};
          })
          .catch((e) => {
            watchState.form.error = e.message;
            return _.keyBy(e.inner, 'path');
          })
      })
    });
}
