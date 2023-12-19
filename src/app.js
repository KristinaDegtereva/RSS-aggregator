import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import axios from 'axios';
import onChange from 'on-change';


export default () => {
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
    });

    schema.validate(data)
  .then()
  .catch((ValidationError) => {
    feedback.textContent = ValidationError.errors;
    input.classList.add('is-invalid')
  });
  })
}
