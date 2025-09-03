import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  // Use @Input() to receive the 'sidebarOpen' state from the parent component.
  @Input() sidebarOpen: boolean = false;

  // Use @Output() to emit an event when the parent component should toggle the sidebar.
  @Output() toggleSidebarEvent = new EventEmitter<void>();

  // A local property to control the dropdown menu's state.
  dropdownOpen: boolean = true;

  // Method to emit an event to the parent component, signaling it to toggle the sidebar.
  toggleSidebar(): void {
    this.toggleSidebarEvent.emit();
  }

  // Method to close the sidebar by emitting a toggle event.
  // This is used for closing the sidebar when a navigation item is clicked.
  closeSidebar(): void {
    if (this.sidebarOpen) {
      this.toggleSidebarEvent.emit();
    }
  }

  // Method to toggle the dropdown menu's open/close state.
  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }
}
