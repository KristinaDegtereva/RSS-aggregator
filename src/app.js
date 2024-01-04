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
          fetch(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`)
            .then(response => {
              if (response.ok) return response.json()
              throw new Error('Network response was not ok.')
            })
            .then((data) => {
              parse(data, watchState, url);
            })
        })
        .catch((e) => {
          watchState.form.error = e.message;
          return _.keyBy(e.inner, 'path');
        })
    })
  })
};
