import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import _ from 'lodash';
// import axios from 'axios';
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

      const schema = (allUrls) => yup.object().shape({
        url: yup.string()
        .url('Ссылка должна быть валидным URL')
        .notOneOf(state.form.allUrls, 'RSS уже существует')
      });
      
      const validate = (fields) => {
        try {
          if (fields.url !== null && fields.url !== undefined) {
            schema.validateSync(fields, { abortEarly: false });
          }
          return {};
        } catch (e) {
          return _.keyBy(e.inner, 'path');
        }
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

    watchState.form.field.url = value;
    const error = validate(watchState.form.field);
    watchState.form.errors = { error };

    if (_.isEmpty(error)) {
      watchState.form.allUrls.push(watchState.form.field.url);
      watchState.form.field.url = '';
      watchState.form.processState = 'sending';
    }
  })
  }
