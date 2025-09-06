import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface EditField {
  key: string;           // property của object
  label: string;         // label hiển thị
  type: 'text' | 'number' | 'date' | 'textarea' | 'select'; // kiểu input
  readonly?: boolean;    // có cho sửa không
  options?: { value: any; label: string }[]; 
}

@Component({
  selector: 'app-form-edit',
  templateUrl: './form-edit.component.html',
  styleUrls: ['./form-edit.component.scss']
})
export class FormEditComponent {
  @Input() item: any = null;  // object cần edit
  @Input() fields: EditField[] = [];
  @Input() title: string = 'Edit Item';
  @Output() submitEvent = new EventEmitter<any>();
  @Output() cancelEvent = new EventEmitter<void>();

  onSubmit() {
    this.submitEvent.emit(this.item);
  }

  onCancel() {
    this.cancelEvent.emit();
  }

}
