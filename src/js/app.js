import Chat from "./Chat";
const container = document.querySelector('.container');
const url = 'ws://192.168.31.48:7070/ws';
const chat = new Chat(container, url);

