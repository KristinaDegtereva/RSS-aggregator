import _ from 'lodash';

const renderErrorsHandler = (alert, elements, i18n) => {
  const errorMessage = alert !== undefined
    ? alert.key
    : alert
  if (errorMessage) {
    elements.input.classList.add('is-invalid');
    elements.feedback.classList.add('text-danger');
    elements.feedback.textContent = i18n.t(errorMessage);
  } else {
    elements.input.classList.remove('is-invalid');
    elements.feedback.textContent = i18n.t('successUrl');
    elements.feedback.classList.remove('text-danger');
    elements.feedback.classList.add('text-success');
    elements.form.reset();
    elements.form.focus();
  }
};

const successRenderPosts = (elements, state, i18n) => {
  const { parsed } = state.form;
  const { posts } = elements;

  const divCard = document.createElement('div');
  divCard.classList.add('card', 'border-0');

  const divCardBody = document.createElement('div');
  divCardBody.classList.add('card-body');

  const headerPostsCard = document.createElement('h2');
  headerPostsCard.classList.add('card-title', 'h4');
  headerPostsCard.textContent = i18n.t('posts');
  divCardBody.append(headerPostsCard);

  const ulCard = document.createElement('ul');
  ulCard.classList.add('list-group', 'border-0', 'rounded-0');


  const liCards = parsed.posts.map((post) => {
    const postCount = _.uniqueId();
    const liCard = document.createElement('li');
    liCard.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const { title, description, link, pubDate } = post;

    const a = document.createElement('a');
    a.setAttribute('href', link);
    a.setAttribute('class', 'fw-bold');
    a.setAttribute('target', '_blank');
    a.setAttribute('data-id', postCount);
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = title;

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm')
    button.setAttribute('data-id', postCount);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = i18n.t('viewing')

    liCard.append(a);
    liCard.append(button);

    return liCard
  })

  ulCard.append(...liCards);

  divCard.append(divCardBody);
  divCard.append(ulCard);
  posts.append(divCard);
}

const successRenderFeeds = (elements, state, i18n) => {
  const { parsed } = state.form;
  const { feeds } = elements;
  const divCard = document.createElement('div');
  divCard.classList.add('card', 'border-0');

  const divCardBody = document.createElement('div');
  divCardBody.classList.add('card-body');

  const headerFeedsCard = document.createElement('h2');
  headerFeedsCard.classList.add('card-title', 'h4');
  headerFeedsCard.textContent = i18n.t('feeds');

  divCardBody.append(headerFeedsCard);

  const ulCard = document.createElement('ul');
  ulCard.classList.add('list-group', 'border-0', 'rounded-0');

  const liCard = document.createElement('li');
  liCard.classList.add('list-group-item', 'border-0', 'border-end-0');

  const h3Li = document.createElement('h3');
  h3Li.classList.add('h6', 'm-0');
  h3Li.textContent = parsed.feed.title;

  const pLi = document.createElement('p');
  pLi.classList.add('m-0', 'small', 'text-black-50');
  pLi.textContent = parsed.feed.description;

  liCard.append(h3Li);
  liCard.append(pLi);

  ulCard.append(liCard);

  divCard.append(divCardBody);
  divCard.append(ulCard);
  feeds.append(divCard);
}


const handleProcessState = (elements, process, state, i18n) => {
  switch (process) {
    case 'sending':
      elements.form.reset();
      elements.form.focus();
      break;

    case 'success':
      elements.form.reset();
      elements.form.focus();
      successRenderFeeds(elements, state, i18n);
      successRenderPosts(elements, state, i18n);
      break

    default:
      throw new Error(`Unknown process ${process}`);
  }
};

const initView = (elements, i18n, state) => (path, value) => {
  switch (path) {
    case 'form.processState':
      handleProcessState(elements, value, state, i18n);
      break;

    case 'form.error':
      renderErrorsHandler(value, elements, i18n);
      break;

    default:
      break;
  }
}

export default initView;
