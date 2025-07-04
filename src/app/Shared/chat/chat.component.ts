import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../../Services/chat.service';
import { UserService } from '../../Services/user.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  senderId: string;
  senderName: string;
  recipientId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
}

interface Contact {
  userId: string;
  name: string;
  lastMessage?: string;
  lastTimestamp?: string;
  profilePictureUrl?: string; // ✅ Add this

}


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ChatComponent implements OnInit, OnDestroy {
  currentUserId: string = '';
  recipientId: string = '';
  selectedContact: Contact | null = null;
  contacts: Contact[] = [];
  messages: Message[] = [];
  newMessage = '';
  subscription: Subscription | undefined;

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser?.userId) {
      console.error('❌ No logged-in user found');
      return;
    }

    this.currentUserId = currentUser.userId.toString();

    // Subscribe to live incoming messages
    this.chatService.subscribeToMessages(this.currentUserId);
    this.subscription = this.chatService.getMessages().subscribe((message) => {
      if (
        message.senderId === this.recipientId ||
        message.recipientId === this.recipientId
      ) {
        this.messages.push(message);
      }
    });

    // Load chat UI based on route or default behavior
    this.route.queryParams.subscribe((params) => {
      if (params['to']) {
        this.recipientId = params['to'];
        this.selectedContact = { userId: this.recipientId, name: 'Employer' };
        this.loadChatHistory();
      }
    });

    // Load all previous conversation contacts
    this.loadConversationList();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  loadConversationList(): void {
    fetch(`http://localhost:8089/SmartCruit/conversations/${this.currentUserId}`)
      .then(res => res.json())
      .then((data: Contact[]) => {
        this.contacts = data;
      })
      .catch(err => console.error('❌ Failed to load contacts:', err));
  }

  selectConversation(contact: Contact): void {
    this.recipientId = contact.userId;
    this.selectedContact = contact;
    this.loadChatHistory();
  }

  loadChatHistory(): void {
    fetch(`http://localhost:8089/SmartCruit/history/${this.currentUserId}/${this.recipientId}`)
      .then(res => res.json())
      .then((data: any[]) => {
        this.messages = data.map(msg => ({
          senderId: msg.senderId,
          senderName: msg.senderId === this.currentUserId ? 'You' : 'Employer',
          recipientId: msg.recipientId,
          content: msg.content,
          timestamp: msg.timestamp,
          type: 'text',
        }));
      })
      .catch(err => console.error('❌ Failed to load chat history:', err));
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    const message: Message = {
      senderId: this.currentUserId,
      senderName: 'Me',
      recipientId: this.recipientId,
      content: this.newMessage,
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    this.messages.push({ ...message });
    this.chatService.sendMessage(message);
    this.newMessage = '';
  }

  getUserAvatar(userId: string): string {
    return `https://i.pravatar.cc/150?u=${userId}`;
  }

  getUserAvatarFallback(userId: string): string {
    return `https://i.pravatar.cc/150?u=${userId}`;
  }
  
}
