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

      const schema = yup.string()
      .url('Ссылка должна быть валидным URL')
      .notOneOf(state.form.allUrls, 'RSS уже существует');
      
      // const validate = (fields) => {
      //   try {
      //       schema.validateSync(fields, { abortEarly: false });
      //     return {};
      //   } catch (e) {
      //     return _.keyBy(e.inner, 'path');
      //   }
      // };

    const elements = {
        form: document.querySelector('.rss-form'),
        input: document.querySelector('#url-input'),
        feedback: document.querySelector('.feedback'),
        submit: document.querySelector('button[type="submit"]')
      };

   const watchState = onChange(state, initView(elements, schema));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('url');

    // const { value } = e.target;
    // console.log(value);
    watchState.form.field.url = value.trim();
  
    schema.validate(value)
        .then(() => {
          watchState.form.allUrls.push(watchState.form.field.url);
          // console.log(error);
          watchState.form.field.url = '';
          watchState.form.processState = 'sending';
          watchState.form.errors = {};
          console.log('All URLs after push:', watchState.form.allUrls);
        })
        .catch((error) => {
          watchState.form.errors = { error };
          console.log('Validation error:', error);
          return _.keyBy(error.inner, 'path');
        })
    // // const error = validate(value);
    // watchState.form.errors = { error };
    // console.log(error);

    // watchState.form.field.url = value;
    // const error = validate(watchState.form.field);
    // watchState.form.errors = { error };

  //   if (_.isEmpty(error)) {
  //     watchState.form.allUrls.push(watchState.form.field.url);
  //     // console.log(error);
  //     watchState.form.field.url = '';
  //     watchState.form.processState = 'sending';
  //   }
  })
  }
