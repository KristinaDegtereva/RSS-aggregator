import './styles.scss';
import 'bootstrap';
import keyBy from 'lodash/keyBy.js';
import * as yup from 'yup';
import axios from 'axios';
import onChange from 'on-change';


export default () => {

  const state = {
    urls: [],
  };

  const form = document.querySelector('.rss-form');
  const input = document.querySelector('#url-input');
  const feedback = document.querySelector('.feedback')

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const data = {
      url: formData.get('url')
    };

    const schema = yup.object().shape({
      url: yup.string()
      .url('Ссылка должна быть валидным URL')
      .notOneOf(state.urls, 'RSS уже существует')
    });

    schema.validate(data)
    .then((data) => {
      state.urls.push(data.url);
      form.reset();
      input.focus();
      feedback.textContent = '';
      input.classList.remove('is-invalid');
    })
    .catch((ValidationError) => {
    console.log(ValidationError.value)
    feedback.textContent = ValidationError.errors;
    input.classList.add('is-invalid');
  });
  })
}
