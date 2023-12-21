const renderErrorsHandler = (alert, elements) => {
    // console.log(alert.error);
    const errorMessage = alert.error !== undefined
      ? alert.error.message
      : alert.error;
      // console.log('alert:', alert);
      // console.log('errorMessage:', errorMessage);
    if (errorMessage) {
      elements.input.classList.add('is-invalid');
      elements.feedback.classList.add('text-danger');
      elements.feedback.textContent = errorMessage;
    } else {
      console.log('Success case')
      elements.input.classList.remove('is-invalid');
      elements.feedback.textContent = 'RSS успешно загружен';
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');
      elements.form.reset();
      elements.form.focus();
    }
  };

const handleProcessState = (elements, process) => {
    switch (process) {  
      case 'sending':
        elements.form.reset();
        elements.form.focus();
        break;
  
    //   case 'error':
    //     elements.submit.disabled = false;
    //     break;

    //   case 'success':
    //     elements.form.reset();
    //     elements.form.focus();
    //     break;
  
      default:
        throw new Error(`Unknown process ${process}`);
    }
  };

const initView = (elements, schema) => (path, value) => {
  // console.log('initView called with path:', path, 'and value:', value);
    switch (path) {
      case 'form.processState':
        handleProcessState(elements, value);
        break;
  
      case 'form.errors':
        renderErrorsHandler(value, elements);
        break;
  
      default:
        break;
    }
}

export default initView;