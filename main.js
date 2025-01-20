(()=>{"use strict";class e{constructor(){this.root=document.querySelector("#root"),this.div=null,this.form=null,this.modalClose=null,this.modalOk=null,this.formInput=null}openModal(){this.div=document.createElement("div"),this.div.classList.add("modal__background"),this.div.innerHTML=e.markup,this.root.append(this.div),this.form=this.root.querySelector(".form__group"),this.modalClose=this.div.querySelector(".modal__close"),this.modalOk=this.div.querySelector(".modal__ok"),this.formInput=this.div.querySelector(".form__input")}deleteModal(){this.div.remove(),this.form=null,this.modalClose=null,this.modalOk=null}showError(){if(this.div.querySelector(".modal__error"))return;const e=document.createElement("span");e.classList.add("modal__error"),e.textContent="Псевдоним уже занят, попробуйте другой",this.form.append(e),this.formInput.value=""}static get markup(){return'\n    <div class="modal__content">\n      <h2 class="modal__header">Выберите псевдоним</h2>\n      <div class="modal__body">\n        <form class="form__group">\n          <input class="form__input">\n          <div class="modal__footer">\n            <button type="button" class="modal__close">Закрыть</button>\n            <button type="sumbit" class="modal__ok">Отправить</button>\n          </div>\n        </form>\n    </div>\n        '}}const t="https://ahj-sse-ws-server-jnxt.onrender.com";class s{constructor(t){this.container=t,this.websocket=null,this.modal=new e,this.user=null,this.userId=null}init(){this.modal.openModal(),this.onEnterChatHandler()}bindToDOM(){const e=document.createElement("div");e.classList.add("container"),e.innerHTML=s.markup,this.container.append(e)}static get markup(){return'\n    <div class="chat__header">Добро пожаловать в чат</div>\n    <button type="button" class="chat__connect">Выйти</button>\n    <div class="chat__container">\n      <div class="chat__userlist"></div>\n      <div class="chat__area">\n        <div class="chat__messages-container"></div>\n        <form class="form">\n          <input class="form__input" placeholder="type your messages here">\n        </form>\n      </div>\n    </div>\n    '}createMessage(e){let t="message__container-interlocutor",{name:s}=e;const{message:n}=e;e.name===this.user&&(s="You",t="message__container-yourself");const o=document.createElement("div"),i=this.container.querySelector(".chat__messages-container");o.classList.add("message__container",t),o.innerHTML=`<span class='message__header'>${s}, ${n.time}</span>\n    <p class="message__body">${n.text}</p>`,i.append(o)}subscribeOnEvents(){this.subscribeToFormMessage(),this.subscribeToOutChat()}subscribeToFormMessage(){this.container.querySelector(".form").addEventListener("submit",this.handleSendMessage.bind(this))}handleSendMessage(e){e.preventDefault(),this.sendMessage()}subscribeToOutChat(){this.container.querySelector(".chat__connect").addEventListener("click",this.handleOutChat.bind(this))}handleOutChat(){if(null===this.user)return;const e={type:"exit",user:{name:this.user}};this.websocket.send(JSON.stringify(e));document.querySelector("#root").textContent="",this.websocket.close(),this.user=null,this.userId=null,this.init()}websocketOnEvents(){this.websocket.addEventListener("open",this.handleWebSocketOpen.bind(this)),this.websocket.addEventListener("message",this.handleWebSocketMessage.bind(this)),this.websocket.addEventListener("close",this.handleWebSocketClose.bind(this))}handleWebSocketOpen(e){console.log(e),console.log("ws open")}handleWebSocketMessage(e){const t=JSON.parse(e.data);Array.isArray(t)?this.handleUserList(t):"object"==typeof t&&this.handleIncomingMessage(t)}handleUserList(e){if(null===this.user)return;this.container.querySelector(".chat__userlist").innerHTML="",e.forEach((e=>{this.renderUser(e.name)})),this.userId=e[e.length-1].id}handleIncomingMessage(e){"send"===e.type&&this.createMessage(e),"exit"===e.type&&console.log("Пользователь вышел:",e)}handleWebSocketClose(e){console.log(e),console.log("ws close")}onEnterChatHandler(){const{formInput:e,form:t,modalClose:s}=this.modal;t.addEventListener("submit",this.handleUserEntry.bind(this)),s.addEventListener("click",(()=>{this.modal.deleteModal()}))}handleUserEntry(e){e.preventDefault();const{formInput:t}=this.modal;if(t.value.trim()){const e={name:t.value};this.registerNewUser(e)}}registerNewUser(e){fetch(`${t}/new-user`,{method:"POST",body:JSON.stringify(e)}).then((s=>{s.ok?(this.user=e.name,this.modal.deleteModal(),this.bindToDOM(),this.websocket=new WebSocket(`${t}`),this.websocketOnEvents(),this.subscribeOnEvents()):409!==s.status&&400!==s.status||this.modal.showError(),console.log(s)}))}sendMessage(){const e=this.container.querySelector(".form__input"),t={type:"send",message:{text:e.value,time:(s=new Date,`${s.getHours().toString().padStart(2,"0")}:${s.getMinutes().toString().padStart(2,"0")} ${s.getDate().toString().padStart(2,"0")}.${(s.getMonth()+1).toString().padStart(2,"0")}.${s.getFullYear()}`)},name:this.user};var s;this.websocket.send(JSON.stringify(t)),e.value=""}renderUser(e){const t=this.container.querySelector(".chat__userlist"),s=document.createElement("div");s.classList.add("chat__user"),s.textContent=e,t.append(s),e===this.user&&(s.textContent="You",s.style.color="red")}}const n=document.getElementById("root");new s(n).init()})();