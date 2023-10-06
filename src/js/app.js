import Chat from "./Chat";
const container = document.querySelector('.container');
const url = 'ws://127.0.0.1:7070/ws';
const chat = new Chat(container, url);

