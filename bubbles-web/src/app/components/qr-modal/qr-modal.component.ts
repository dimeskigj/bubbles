import { Component, inject } from '@angular/core';
import { Data } from '@angular/router';
import { DialogService, DialogRef } from '@ngneat/dialog';
import { QrCodeComponent } from 'ng-qrcode';

@Component({
  selector: 'app-qr-modal',
  imports: [QrCodeComponent],
  templateUrl: './qr-modal.component.html',
  styleUrl: './qr-modal.component.css',
})
export class QrModalComponent {
  ref: DialogRef<Data, boolean> = inject(DialogRef);

  get url(): string {
    return this.ref.data?.['url'] ?? '';
  }
}
