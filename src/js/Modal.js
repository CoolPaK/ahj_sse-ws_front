/* eslint-disable linebreak-style */
export default class Modal {
  constructor() {
    this.root = document.querySelector('#root');
    this.div = null;
    this.form = null;
    this.modalClose = null;
    this.modalOk = null;
    this.formInput = null;
  }

  openModal() {
    this.div = document.createElement('div');
    this.div.classList.add('modal__background');
    this.div.innerHTML = Modal.markup;
    this.root.append(this.div);
    this.form = this.root.querySelector('.form__group');
    this.modalClose = this.div.querySelector('.modal__close');
    this.modalOk = this.div.querySelector('.modal__ok');
    this.formInput = this.div.querySelector('.form__input');
  }

  deleteModal() {
    this.div.remove();
    this.form = null;
    this.modalClose = null;
    this.modalOk = null;
  }

  showError() {
    if (this.div.querySelector('.modal__error')) return;
    const error = document.createElement('span');
    error.classList.add('modal__error');
    error.textContent = 'Псевдоним уже занят, попробуйте другой';
    this.form.append(error);
    this.formInput.value = '';
  }

  static get markup() {
    return `
    <div class="modal__content">
      <h2 class="modal__header">Выберите псевдоним</h2>
      <div class="modal__body">
        <form class="form__group">
          <input class="form__input">
          <div class="modal__footer">
            <button type="button" class="modal__close">Закрыть</button>
            <button type="sumbit" class="modal__ok">Отправить</button>
          </div>
        </form>
    </div>
        `;
  }
}
