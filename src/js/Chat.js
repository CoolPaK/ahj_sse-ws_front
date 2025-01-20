/* eslint-disable linebreak-style */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
import Modal from './Modal';
import formatDate from './utils';

const BASE_URL = 'https://ahj-sse-ws-server-jnxt.onrender.com'; // Базовый URL для API

export default class Chat {
  constructor(container) {
    this.container = container;
    this.websocket = null;
    this.modal = new Modal();
    this.user = null;
    this.userId = null;
  }

  init() {
    this.modal.openModal();
    this.onEnterChatHandler();
  }

  bindToDOM() {
    const div = document.createElement('div');
    div.classList.add('container');
    div.innerHTML = Chat.markup;
    this.container.append(div);
  }

  static get markup() {
    return `
    <div class="chat__header">Добро пожаловать в чат</div>
    <button type="button" class="chat__connect">Выйти</button>
    <div class="chat__container">
      <div class="chat__userlist"></div>
      <div class="chat__area">
        <div class="chat__messages-container"></div>
        <form class="form">
          <input class="form__input" placeholder="type your messages here">
        </form>
      </div>
    </div>
    `;
  }

  createMessage(data) {
    let messageLocation = 'message__container-interlocutor';
    let { name } = data;
    const { message } = data;
    if (data.name === this.user) {
      name = 'You';
      messageLocation = 'message__container-yourself';
    }
    const div = document.createElement('div');
    const messagesContainer = this.container.querySelector(
      '.chat__messages-container',
    );
    div.classList.add('message__container', messageLocation);
    div.innerHTML = `<span class='message__header'>${name}, ${message.time}</span>
    <p class="message__body">${message.text}</p>`;
    messagesContainer.append(div);
  }

  subscribeOnEvents() {
    this.subscribeToFormMessage();
    this.subscribeToOutChat();
  }

  subscribeToFormMessage() {
    const formMessage = this.container.querySelector('.form');
    formMessage.addEventListener('submit', this.handleSendMessage.bind(this));
  }

  handleSendMessage(e) {
    e.preventDefault();
    this.sendMessage();
  }

  subscribeToOutChat() {
    const outChat = this.container.querySelector('.chat__connect');
    outChat.addEventListener('click', this.handleOutChat.bind(this));
  }

  handleOutChat() {
    if (this.user === null) return;
    const receivedMessage = {
      type: 'exit',
      user: { name: this.user },
    };
    this.websocket.send(JSON.stringify(receivedMessage));

    const root = document.querySelector('#root');
    root.textContent = '';
    this.websocket.close();
    this.user = null;
    this.userId = null;
    this.init();
  }

  websocketOnEvents() {
    this.websocket.addEventListener(
      'open',
      this.handleWebSocketOpen.bind(this),
    );
    this.websocket.addEventListener(
      'message',
      this.handleWebSocketMessage.bind(this),
    );
    this.websocket.addEventListener(
      'close',
      this.handleWebSocketClose.bind(this),
    );
  }

  handleWebSocketOpen(e) {
    console.log(e);
    console.log('ws open');
  }

  handleWebSocketMessage(e) {
    const data = JSON.parse(e.data);
    if (Array.isArray(data)) {
      this.handleUserList(data);
    } else if (typeof data === 'object') {
      this.handleIncomingMessage(data);
    }
  }

  handleUserList(data) {
    if (this.user === null) return;
    const list = this.container.querySelector('.chat__userlist');
    list.innerHTML = '';
    data.forEach((el) => {
      this.renderUser(el.name);
    });
    this.userId = data[data.length - 1].id;
  }

  handleIncomingMessage(data) {
    if (data.type === 'send') {
      this.createMessage(data);
    }
    if (data.type === 'exit') {
      console.log('Пользователь вышел:', data);
    }
  }

  handleWebSocketClose(e) {
    console.log(e);
    console.log('ws close');
  }

  onEnterChatHandler() {
    const { formInput, form, modalClose } = this.modal;
    form.addEventListener('submit', this.handleUserEntry.bind(this));
    modalClose.addEventListener('click', () => {
      this.modal.deleteModal();
    });
  }

  handleUserEntry(e) {
    e.preventDefault();
    const { formInput } = this.modal;
    if (formInput.value.trim()) {
      const data = { name: formInput.value };
      this.registerNewUser(data);
    }
  }

  registerNewUser(data) {
    fetch(`${BASE_URL}/new-user`, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((response) => {
      if (response.ok) {
        this.user = data.name;
        this.modal.deleteModal();
        this.bindToDOM();
        this.websocket = new WebSocket(`${BASE_URL}`);
        this.websocketOnEvents();
        this.subscribeOnEvents();
      } else if (response.status === 409 || response.status === 400) {
        this.modal.showError();
      }
      console.log(response);
    });
  }

  sendMessage() {
    const formInput = this.container.querySelector('.form__input');
    const payLoad = {
      type: 'send',
      message: { text: formInput.value, time: formatDate(new Date()) },
      name: this.user,
    };
    this.websocket.send(JSON.stringify(payLoad));
    formInput.value = '';
  }

  renderUser(name) {
    const userList = this.container.querySelector('.chat__userlist');
    const user = document.createElement('div');
    user.classList.add('chat__user');
    user.textContent = name;
    userList.append(user);
    if (name === this.user) {
      user.textContent = 'You';
      user.style.color = 'red';
    }
  }
}
