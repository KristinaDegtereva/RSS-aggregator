import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import _ from 'lodash';
import onChange from 'on-change';
import initView from './view.js';

  export default () => {
    const state = {
        form: {
          field: {
            url: '',
          },
          allUrls: [],
          processState: '',
          errors: {},
        },
      };

    const elements = {
        form: document.querySelector('.rss-form'),
        input: document.querySelector('#url-input'),
        feedback: document.querySelector('.feedback'),
        submit: document.querySelector('button[type="submit"]')
      };

   const watchState = onChange(state, initView(elements));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('url');
    watchState.form.field.url = value.trim();

    const schema = yup.string()
    .url('Ссылка должна быть валидным URL')
    .notOneOf(state.form.allUrls, 'RSS уже существует');
  
    schema.validate(value)
        .then(() => {
          watchState.form.allUrls.push(watchState.form.field.url);
          watchState.form.field.url = '';
          watchState.form.processState = 'sending';
          watchState.form.errors = {};
        })
        .catch((error) => {
          watchState.form.errors = { error };
          return _.keyBy(error.inner, 'path');
        })
  })
  }
