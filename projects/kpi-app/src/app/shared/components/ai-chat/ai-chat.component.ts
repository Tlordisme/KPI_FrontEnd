import { Component, ViewChild, ElementRef, AfterViewChecked  } from '@angular/core';
import { AiService } from '../../../core/services/ai/ai.service';

@Component({
  selector: 'app-ai-chat',
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.scss'],
})
export class AiChatComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  isOpen = false;
  isLoading = false;
  userInput = '';
  messages: { from: 'user' | 'ai'; text: string }[] = [];

  constructor(private aiService: AiService) {} 

  toggleChat() {
    this.isOpen = !this.isOpen;

    if (!this.isOpen) {
      // reset khi đóng
      this.messages = [];
      this.userInput = '';
    }
  }

  sendMessage() {
    const question = this.userInput.trim();
    if (!question) return;

    // push tin nhắn user
    this.messages.push({ from: 'user', text: question });
    this.userInput = '';
    this.isLoading = true;

    // gọi API chat
    this.aiService.chat(question).subscribe({
      next: (res) => {
        this.messages.push({ from: 'ai', text: res.text });
         this.isLoading = false; 
      },
      error: (err) => {
        this.messages.push({
          from: 'ai',
          text: 'Lỗi: không kết nối được server',
        });
        this.isLoading = false; 
      },
    });
  }

  // Xử lý Enter / Shift+Enter
  handleEnter(event: any) {
    if (event.shiftKey) return; // cho phép xuống dòng
    event.preventDefault();     // chặn Enter mặc định
    this.sendMessage();
  }

  // Auto resize textarea
  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
    // Auto scroll xuống cuối khi có tin nhắn mới
  ngAfterViewChecked() {
    this.scrollToBottom();
  }
    private scrollToBottom(): void {
    if (this.messagesContainer) {
      try {
        this.messagesContainer.nativeElement.scrollTo({
          top: this.messagesContainer.nativeElement.scrollHeight,
          behavior: 'smooth', // scroll mượt
        });
      } catch (err) {}
    }
  }
}
