import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../../Services/chat.service';
import { UserService } from '../../Services/user.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';


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
  selectedFileMessage: Message | null = null;
  public isTyping: boolean = false;
  public mutedConversations: Set<string> = new Set();


  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser?.userId) {
      console.error('❌ No logged-in user found');
      return;
    }
  
    this.currentUserId = currentUser.userId.toString();
  
    // Subscribe to WebSocket
    this.chatService.subscribeToMessages(this.currentUserId);
    this.subscription = this.chatService.getMessages().subscribe((message) => {
      if (
        message.senderId === this.recipientId ||
        message.recipientId === this.recipientId
      ) {
        this.messages.push(message);
      }
    });
  
    // First: load contacts
    this.loadConversationList().then(() => {
      // Then: get recipient ID from query params
      this.route.queryParams.subscribe((params) => {
        if (params['to']) {
          this.recipientId = params['to'];
  
          // ✅ Look up full name from loaded contacts
          const found = this.contacts.find(c => c.userId === this.recipientId);
          if (found) {
            this.selectedContact = found;
          } else {
            // Optional fallback
            this.selectedContact = {
              userId: this.recipientId,
              name: 'Unknown User'
            };
          }
  
          this.loadChatHistory();
        }
      });
    });
  }
  
  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  loadConversationList(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http
        .get<Contact[]>(`http://localhost:8089/SmartCruit/conversations/${this.currentUserId}`)
        .subscribe({
          next: (data) => {
            this.contacts = data ?? []; // fallback to empty array if nullish
            resolve();
          },
          error: (err) => {
            console.error('❌ Failed to load contacts:', err);
            this.contacts = [];
            reject(err);
          },
        });
    });
  }
  
  

  selectConversation(contact: Contact): void {
    this.recipientId = contact.userId;
    this.selectedContact = contact;
    this.loadChatHistory();
  }

  loadChatHistory(): void {
    this.http
      .get<Message[]>(`http://localhost:8089/SmartCruit/history/${this.currentUserId}/${this.recipientId}`)
      .subscribe({
        next: (data: any[]) => {
          this.messages = data.map((msg) => ({
            senderId: msg.senderId,
            senderName: msg.senderName,
            recipientId: msg.recipientId,
            content: msg.content,
            timestamp: msg.timestamp,
            type: msg.type || 'text',
          }));
        },
        error: (err) => console.error('❌ Failed to load chat history:', err),
      });
  }
  
  sendMessage(): void {
  if (this.selectedFileMessage) {
    // 🔁 Send selected file or image
    this.chatService.sendMessage(this.selectedFileMessage);
    this.messages.push({ ...this.selectedFileMessage });
    this.selectedFileMessage = null; // reset file selection
    return;
  }

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
  // 1. If it's the current user, get from localStorage
  if (userId === this.currentUserId) {
    const currentUser = this.userService.getCurrentUser();
    return currentUser?.profilePictureUrl || 'assets/FrontOffice/images/default.avif';
  }

  // 2. Check if user exists in contacts list
  const contact = this.contacts.find(c => c.userId === userId);
  return contact?.profilePictureUrl || 'assets/FrontOffice/images/default.avif';
}


  getUserAvatarFallback(userId: string): string {
    const contact = this.contacts.find(c => c.userId === userId);
  return contact?.profilePictureUrl || 'assets/FrontOffice/images/default.avif';
  }

  onFileSelected(event: any) {
  const file: File = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  fetch('http://localhost:8089/SmartCruit/upload', {
    method: 'POST',
    body: formData,
  })
    .then(res => res.json())
    .then(data => {
      if (data.url) {
        this.selectedFileMessage = {
          senderId: this.currentUserId,
          senderName: 'Me',
          recipientId: this.recipientId,
          content: data.url,
          timestamp: new Date().toISOString(),
          type: file.type.startsWith('image/') ? 'image' : 'file',
        };
      } else {
        console.error('❌ Upload failed:', data.error);
      }
    })
    .catch(err => {
      console.error('❌ Upload error:', err);
    });
}

  onViewProfile(): void {
    if (this.selectedContact) {
      window.open(`/profile/${this.selectedContact.userId}`, '_blank');
    }
  }

  onDeleteChat(): void {
    if (this.selectedContact) {
      this.contacts = this.contacts.filter(c => c.userId !== this.selectedContact!.userId);
      this.messages = [];
      this.selectedContact = null;
      this.recipientId = '';
    }
  }

  onMuteConversation(): void {
    if (this.selectedContact) {
      this.mutedConversations.add(this.selectedContact.userId);
      alert('Conversation muted (UI only).');
    }
  }

  isConversationMuted(): boolean {
    return this.selectedContact ? this.mutedConversations.has(this.selectedContact.userId) : false;
  }


}
