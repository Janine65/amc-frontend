import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { AccountService } from '@app/service';
import { DialogService } from 'primeng/dynamicdialog';
import { AddEditComponent } from '../../users/add-edit/add-edit.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    providers: [DialogService]
})
export class ProfileComponent implements OnInit {
  private accountService = inject(AccountService);
  private router = inject(Router);
  private dialogService = inject(DialogService);


     ngOnInit(): void {
      const dialogRef = this.dialogService.open(AddEditComponent, {
        data: {
          user: this.accountService.userValue,
          withRole: false,
          withPwd: true
        },
        header: 'User ändern',
        width: '70%',
        height: '70%',
        resizable: true, 
        modal: true, 
        maximizable: true, 
        draggable: true
      });
      dialogRef.onClose.subscribe(() => {
        this.router.navigate(['/']);
      });      
     }
}
