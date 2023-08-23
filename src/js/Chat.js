import moment from "moment";
export default class Chat{
    constructor(container, url) {
        this.nickname = null;
        this.onlineMembers = [];
        this.messagesStory = [];
        this.parentElement = container;
        this.url = url;
        this.server();
        this.renderNickModal();
    }

    renderNickModal() {
        this.parentElement.innerHTML = ` <div class="nickname-modal">
       <form action="" class="nickname-modal__form">
         <label class="child">
             Выберите никнейм
             <input type="text" class="nickname-modal__input">
         </label>
         <button class="nickname-modal__button child">Продолжить</button>
       </form>
      </div>`;

        this.nicknameModalInput = document.querySelector('.nickname-modal__input');
        this.nicknameModalButton = document.querySelector('.nickname-modal__button');
        this.nicknameModalButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.onSubmit(this.nicknameModalInput.value);
        })
    }

    onSubmit(value) {
        if(value.trim() === ''){
            this.renderErrModal('Пожалуйста, введите никнейм!');
        }
        else{
            const data = {nickname: value};
            this.ws.send(JSON.stringify(data));
        }
    }

    server() {
        this.ws = new WebSocket(this.url);
        this.ws.binaryType = 'blob'; // arraybuffer
        this.ws.addEventListener('open', () => {
            console.log('соединение с сервером установлено');
            // After this we can send messages
        });
        this.ws.addEventListener('message', (evt) => {
           if (/^[\],:{}\s]*$/.test(evt.data.replace(/\\["\\\/bfnrtu]/g, '@').
            replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
            replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                //the json is ok
                const res = JSON.parse(evt.data);
               if(res.hasOwnProperty('chatMembers')){
                   this.onlineMembers = res.chatMembers;
                   this.renderMembersList();
               }
                else if(res.hasOwnProperty('status') && res.status === 'failed') {
                    console.log('error');
                    this.renderErrModal('Пользователь с таким никнеймом уже существует! Пожалуйста, выберите другой.');
                }
               else if(res.hasOwnProperty('status') && res.status === 'success') {
                   this.nickname = res.nickname;
                   this.parentElement.innerHTML = '';
                   this.renderChatUI();
               }
               else if(res.hasOwnProperty('messageText')) {
                   this.renderNewMessage(res);
               }
               else if(res.hasOwnProperty('allMessages')) {
                   this.messagesStory = res.allMessages;
               }
            }else{
                //the json is not ok
                console.log(evt.data);
            }

        });

        this.ws.addEventListener('close', (evt) => {
            console.log('соединение с сервером прервано', evt);
        });
        this.ws.addEventListener('error', () => {
            console.log('error');
        });

    }
    renderMembersList() {
        const chatMembers = document.querySelector('.chat-members');
        chatMembers.style.left = `-${chatMembers.offsetWidth}px`;
        const chatMembersList = chatMembers.querySelector('.chat-members__list');
        chatMembersList.innerHTML = '';
        this.onlineMembers.forEach((member) => {
            const li = document.createElement('li');
            li.classList.add('chat-member');
            if(member === this.nickname){
                li.innerText = 'You';
            }
            else {
                li.innerText = member;
            }
            chatMembersList.appendChild(li);
            chatMembers.style.left = `-${chatMembers.offsetWidth}px`;
        })
    }

    renderErrModal(content) {
       const modal = document.createElement('div');
       modal.classList.add('error-modal');
       const modalContent = document.createElement('p');
       modalContent.classList.add('error-modal__content');
       modalContent.innerText = content;
       const button = document.createElement('button');
       button.classList.add('error-modal__button');
       button.innerText = 'ОК';
       modal.appendChild(modalContent);
       modal.appendChild(button);

       this.parentElement.appendChild(modal);
       this.butt = document.querySelector('.error-modal__button');
       this.butt.addEventListener('click', (e)=>{
           e.preventDefault();
           modal.remove();
       })
    }

    renderChatUI() {
        this.parentElement.innerHTML = `<div class="chat-window">
        <div class="chat-members">
            <ul class="chat-members__list">
            </ul>
        </div>
        <ul class="messages-list">
          <li class="no-message">Пока нет сообщений</li>
        </ul>
        <form>
            <input type="text" class="chat-input" placeholder="Введите ваше сообщение">
            <button class="chat-submit-button" type="submit">Отправить</button>
            </form>
    </div>`;
        this.renderMembersList();
        if(this.messagesStory.length!== 0) {
            this.messagesStory.forEach((message) => {
                this.renderNewMessage(message);
            })
        }
        this.chatInput = document.querySelector('.chat-input');
        this.chatSubmit = document.querySelector('.chat-submit-button');
        this.chatSubmit.addEventListener('click', (e) => {
            e.preventDefault();
            this.onMessageSend(this.chatInput.value);
        })
    }

    onMessageSend(message) {
        const data = {message: message};
        this.ws.send(JSON.stringify(data));
        this.chatInput.value = '';
    }

    renderNewMessage(data) {
        const noMessage = document.querySelector('.no-message');
        if(noMessage) noMessage.remove();
        const container = document.querySelector('.messages-list');
        const message = document.createElement('li');
        message.classList.add('message');
        if(data.sender === this.nickname){
            message.classList.add('you');
        }
        const messageInfo = document.createElement('p');
        messageInfo.classList.add('message-info');
        messageInfo.innerText = `${data.sender}, ${moment().format('DD.MM.YYYY hh:mm A')}`;
        message.appendChild(messageInfo);
        const messageContent = document.createElement('p');
        messageContent.classList.add('message-content');
        messageContent.innerText = data.messageText;
        message.appendChild(messageContent);

        container.appendChild(message);
        container.scrollTo(0, container.scrollHeight);
    }

}