import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject, Observable } from 'rxjs';

interface Message {
  senderId: string;
  senderName: string;
  recipientId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private stompClient: Client;
  private messageSubject = new Subject<Message>();
  private isConnected = false;
  private messageBuffer: Message[] = [];
  private subscriptionBuffer: string[] = [];

  constructor() {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8089/SmartCruit/ws-chat'),
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`
      },
      reconnectDelay: 5000,
      debug: (msg: string) => console.log(`[STOMP] ${msg}`),
      onConnect: () => this.handleConnectionEstablished()
    });
    
    this.stompClient.activate();
  }

  private handleConnectionEstablished(): void {
    console.log('✅ WebSocket connected');
    this.isConnected = true;

    // Restore pending subscriptions
    this.subscriptionBuffer.forEach(userId => this.subscribeToUser(userId));
    this.subscriptionBuffer = [];

    // Send queued messages
    this.messageBuffer.forEach(message => this.publishMessage(message));
    this.messageBuffer = [];
  }

  subscribeToMessages(userId: string): void {
    if (this.isConnected) {
      this.subscribeToUser(userId);
    } else {
      console.warn('⏳ WebSocket not connected. Subscription queued.');
      this.subscriptionBuffer.push(userId);
    }
  }

  private subscribeToUser(userId: string): void {
    this.stompClient.subscribe(`/topic/messages/${userId}`, (msg: IMessage) => {
      const parsedMessage: Message = JSON.parse(msg.body);
      this.messageSubject.next(parsedMessage);
    });
  }

  sendMessage(message: Message): void {
    if (this.isConnected) {
      this.publishMessage(message);
    } else {
      console.warn('⏳ WebSocket not connected. Message queued.');
      this.messageBuffer.push(message);
    }
  }

  private publishMessage(message: Message): void {
    this.stompClient.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(message)
    });
  }

  getMessages(): Observable<Message> {
    return this.messageSubject.asObservable();
  }
}
