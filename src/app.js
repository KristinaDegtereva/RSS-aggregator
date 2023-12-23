import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import _ from 'lodash';
import onChange from 'on-change';
import initView from './view.js';
import i18next from 'i18next';
import resources from './locales/index.js';

export default () => {
  const state = {
    form: {
      field: {
        url: '',
      },
      allUrls: [],
      processState: '',
      error: {},
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
        submit: document.querySelector('button[type="submit"]')
      };

      const watchState = onChange(state, initView(elements, i18n));

      elements.form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const value = formData.get('url');
        watchState.form.field.url = value.trim();

        const schema = yup.string()
          .url()
          .notOneOf(state.form.allUrls);

        schema.validate(value)
          .then(() => {
            watchState.form.allUrls.push(watchState.form.field.url);
            watchState.form.field.url = '';
            watchState.form.processState = 'sending';
            watchState.form.error = {};
          })
          .catch((e) => {
            watchState.form.error = e.message;
            return _.keyBy(e.inner, 'path');
          })
      })
    });
}
