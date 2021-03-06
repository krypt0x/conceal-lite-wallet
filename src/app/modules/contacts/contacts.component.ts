// Angular
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { trigger, state, transition, query, style, stagger, animate } from '@angular/animations';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

// Services
import { HelperService } from './../../shared/services/helper.service';
import { DialogService } from '../../shared/services/dialog.service';
import { AuthService } from '../../shared/services/auth.service';
import { DataService } from '../../shared/services/data.service';

export interface Contacts {
  label: string;
  address: string;
	paymentid: string;
	entryID: number;
}

@Component({
	selector: 'app-contacts',
	templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({opacity:0}),
          animate(400, style({opacity:1}))
        ]),
        transition(':leave', [
          style({opacity:1}),
          animate(400, style({opacity:0}))
        ])
      ]
    ),
    trigger('stagger', [
      transition('* => *', [
        query('#cards', style({ opacity: 0, transform: 'translateX(-40px)' }), {optional: true}),
        query('#cards', stagger('300ms', [
          animate('600ms 1.2s ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
        ]), {optional: true}),
        query('#cards', [
          animate(1000, style('*'))
        ], {optional: true})
      ])
    ]),
    trigger('detailExpand', [
      state('collapsed', style({display: 'none'})),
      state('expanded', style({display: 'show', height: '60px'})),
      transition('expanded <=> collapsed', animate(1, style({opacity:0}))),
    ]),
  ]
})
export class ContactsComponent implements OnInit {

  // MatPaginator Output
  pageEvent: PageEvent;
  pageSize: Number = 5;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  displayedColumns: string[] = ['options', 'label', 'address', 'paymentid'];
	dataSource: MatTableDataSource<Contacts> = null;
  expandedElement: any;
	detailRow: boolean = false;
	isLoading: boolean = true;

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;

	constructor(
		private authService: AuthService,
		private helperService: HelperService,
		private dataService: DataService,
		private dialogService: DialogService,
		private changeDetectorRefs: ChangeDetectorRef
  ) {
		this.helperService.getContacts();
		setTimeout(() => {
			// Assign the data to the data source for the table to render
			this.dataSource = new MatTableDataSource(this.dataService.contacts);
			this.dataSource.paginator = this.paginator;
			this.dataSource.sort = this.sort;
			this.isLoading = false;
		}, 2000);
	}

	// Get Services
	getDialogService() {
		return this.dialogService;
	}
	getHelperService() {
		return this.helperService;
	}
	getDataService() {
		return this.dataService;
	}

	ngOnInit(): void {
		this.dataService.isLoggedIn = this.authService.loggedIn();
		this.helperService.getMarket();
		this.helperService.getWallets();
		this.helperService.checkFor2FA();
		this.refresh();
	}

	refresh() {
		this.isLoading = true;
		this.helperService.getContacts(true);
		setTimeout(() => {
			this.dataSource = new MatTableDataSource(this.dataService.contacts);
			this.dataSource.paginator = this.paginator;
			this.dataSource.sort = this.sort;
			this.changeDetectorRefs.detectChanges();
			this.isLoading = false;
		}, 3000);
	}

	delete(entryID) {
		this.isLoading = true;
		this.helperService.deleteContact(entryID);
		setTimeout(() => {
			this.helperService.getContacts(true);
		}, 2000);
		setTimeout(() => {
			this.dataSource = new MatTableDataSource(this.dataService.contacts);
			this.dataSource.paginator = this.paginator;
			this.dataSource.sort = this.sort;
			this.changeDetectorRefs.detectChanges();
			this.isLoading = false;
		}, 3000);
	}

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}