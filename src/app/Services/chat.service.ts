import { Injectable } from '@angular/core';
import { Client, IMessage, Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';

interface Message {
  senderId: string;
  senderName: string;
  recipientId: string;
  content: string;
  timestamp: string; // <- changed from Date to string
  type: 'text' | 'image' | 'file';
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private stompClient: Client;
  private messageSubject = new Subject<Message>();
  private isConnected = false;
  private pendingMessages: Message[] = [];
  private pendingSubscriptions: string[] = [];

  constructor() {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8089/SmartCruit/ws-chat'),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('✅ Connected to WebSocket');
        this.isConnected = true;

        // Subscribe to all queued subscriptions
        this.pendingSubscriptions.forEach(userId => this._subscribe(userId));
        this.pendingSubscriptions = [];

        // Flush buffered messages
        this.pendingMessages.forEach(msg => this._send(msg));
        this.pendingMessages = [];
      },
      debug: (str) => console.log(str),
    });

    this.stompClient.activate();
  }

  subscribeToMessages(userId: string) {
    if (this.isConnected) {
      this._subscribe(userId);
    } else {
      console.warn('🕐 WebSocket not connected yet, queuing subscription...');
      this.pendingSubscriptions.push(userId);
    }
  }

  private _subscribe(userId: string) {
    this.stompClient.subscribe(`/topic/messages/${userId}`, (msg: IMessage) => {
      const parsed: Message = JSON.parse(msg.body);
      this.messageSubject.next(parsed);
    });
  }

  sendMessage(message: Message) {
    if (this.isConnected) {
      this._send(message);
    } else {
      console.warn('🕐 WebSocket not connected yet, queuing message...');
      this.pendingMessages.push(message);
    }
  }

  private _send(message: Message) {
    this.stompClient.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(message),
    });
  }

  getMessages() {
    return this.messageSubject.asObservable();
  }
}
