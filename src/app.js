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


const getRoute = (url) => {
  const result = new URL('/get', 'https://allorigins.hexlet.app');
  result.searchParams.set('url', url);
  result.searchParams.set('disableCache', 'true');
  return axios.get(result.toString());
};

const updateRssState = (link, watchState) => getRoute(link)
  .then((data) => parse(data.data.contents))
  .then((data) => {
    const { feedTitle, feedDescription, newPosts } = data;
    const feedId = _.uniqueId();
    watchState.content.feedsItem.unshift({
      feedTitle, feedDescription, link, feedId,
    });
    newPosts.forEach((item) => {
      item.postId = _.uniqueId();
    });
    const posts = [...newPosts, ...watchState.content.postsItem];
    watchState.content.postsItem = posts;
    watchState.form.error = '';
  })



const updatePosts = (watchState) => {
  const getNewPosts = () => {
    const promises = watchState.content.feedsItem.map((item) => getRoute(item.link)
      .then((response) => {
        const { newPosts } = parse(response.data.contents);
        newPosts.forEach((post) => {
          if (watchState.content.postsItem
            .every((postsItem) => postsItem.postTitle !== post.postTitle)) {
            const newPost = post;
            newPost.postId = _.uniqueId();
            watchState.content.postsItem.unshift(post);
            // console.log('New posts added:', watchState.content.postsItem)
          }
        });
      })
      .catch((error) => {
        watchState.form.error = error.message;
      }));

    Promise.all(promises)
      .finally(() => setTimeout(update, 5000));
  };
  getNewPosts();
};

export default () => {
  const state = {
    form: {
      field: {
        url: '',
      },
      processState: '',
      error: {},
    },
    content: {
      feedsItem: [],
      postsItem: [],
    },
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    submit: document.querySelector('button[type="submit"]'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
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

        const urls = watchState.content.feedsItem.map((feed) => feed.link);
        const schema = yup.string()
          .url()
          .notOneOf(urls);

        const successAdd = () => {
          watchState.form.field.url = '';
          watchState.form.processState = 'sending';
          watchState.form.error = {};
        };

        schema.validate(value)
          .then((url) => {
            successAdd(url);
            return updateRssState(url, watchState)
          })
          .then(() => {
            watchState.form.processState = 'success';
          })
          .catch((e) => {
            watchState.form.field.url = value;
            watchState.form.error = e.message;
            return _.keyBy(e.inner, 'path');
          });
      });
      updatePosts(watchState);
    });
};
