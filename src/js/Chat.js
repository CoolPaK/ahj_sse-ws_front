/* eslint-disable linebreak-style */
import Modal from './Modal';
import formatDate from './utils';

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
    div.classList.add('message__container');
    div.classList.add(messageLocation);
    div.innerHTML = `<span class='message__header'>${name}, ${message.time}</span>
    <p class="message__body">${message.text}</p>
    `;
    messagesContainer.append(div);
  }

  subscribeOnEvents() {
    const formMessage = this.container.querySelector('.form');
    formMessage.addEventListener('submit', (e) => {
      e.preventDefault();
      this.sendMessage();
    });

    const outChat = this.container.querySelector('.chat__connect');
    outChat.addEventListener('click', () => {
      if (this.user === null) return;
      const receivedMessage = {
        type: 'exit',
        user: { name: this.user },
      };
      this.websocket.send(JSON.stringify(receivedMessage));

      const root = document.querySelector('#root');
      console.log(root);

      root.textContent = '';
      this.websocket.close();
      this.user = null;
      this.userId = null;
      this.init();
    });
  }

  websocketOnEvents() {
    this.websocket.addEventListener('open', (e) => {
      console.log(e);
      console.log('ws open');
    });

    this.websocket.addEventListener('message', (e) => {
      const data = JSON.parse(e.data);
      if (Object.getPrototypeOf(data).constructor === Array) {
        if (this.user === null) return;
        const list = this.container.querySelector('.chat__userlist');
        list.innerHTML = '';
        // eslint-disable-next-line array-callback-return
        data.map((el) => {
          this.renderUser(el.name);
        });
        this.userId = data[data.length - 1].id;
      }

      if (Object.getPrototypeOf(data).constructor === Object) {
        if (data.type === 'send') {
          this.createMessage(data);
        }
        if (data.type === 'exit') {
          console.log(e);
        }
      }
    });

    this.websocket.addEventListener('close', (e) => {
      console.log(e);
      console.log('ws close');
    });
  }

  onEnterChatHandler() {
    const { formInput, form, modalClose } = this.modal;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (formInput.value.trim()) {
        const data = { name: formInput.value };
        fetch('https://ahj-sse-ws-server-jnxt.onrender.com/new-user', {
          method: 'POST',
          body: JSON.stringify(data),
        }).then((responce) => {
          if (responce.ok === true && responce.status === 200) {
            this.user = formInput.value;
            this.modal.deleteModal();
            this.bindToDOM();
            this.websocket = new WebSocket('wss://ahj-sse-ws-server-jnxt.onrender.com');
            this.websocketOnEvents();
            this.subscribeOnEvents();
          }
          if (responce.status === 409 || responce.status === 400) {
            this.modal.showError();
          }
          console.log(responce);
        });
      }
    });
    modalClose.addEventListener('click', () => {
      this.modal.deleteModal();
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
