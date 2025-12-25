import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { ExcelUserService, ExcelUser, ExcelUploadResponse, EmailSendResponse } from '../../../services/excel-user.service';
import { FoireService, Foire } from '../../../services/foire.service';
import { EmailTemplateService } from '../../../services/email-template.service';
import { InvitationService } from '../../../services/invitation.service';

@Component({
  selector: 'app-excel-upload',
  templateUrl: './excel-upload.component.html',
  styleUrls: ['./excel-upload.component.scss']
})
export class ExcelUploadComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['select', 'nom', 'email', 'date', 'heure', 'code', 'foireName', 'actions'];
  dataSource: MatTableDataSource<ExcelUser>;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  selectedFile: File | null = null;
  selectedFoireId: number | null = null;
  foires: Foire[] = [];
  isLoading = false;
  isUploading = false;
  isSendingEmails = false;
  isDragging = false;
  uploadResponse: ExcelUploadResponse | null = null;
  
  allUsers: ExcelUser[] = [];
  pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  selection = new SelectionModel<ExcelUser>(true, []);
  
  templates: any[] = [];
  selectedTemplateId: number | null = null;
  showTemplateSelection = false;

  constructor(
    private excelUserService: ExcelUserService,
    private foireService: FoireService,
    private emailTemplateService: EmailTemplateService,
    private invitationService: InvitationService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource(this.allUsers);
  }

  ngOnInit(): void {
    console.log('ExcelUploadComponent initialized');
    this.loadFoires();
    this.loadTemplates();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadFoires(): void {
    console.log('Loading foires...');
    this.foireService.getAllFoires().subscribe({
      next: (data) => {
        console.log('Foires loaded successfully:', data);
        this.foires = data;
      },
      error: (error) => {
        console.error('Error loading foires:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        this.showSnackBar('Erreur lors du chargement des foires', 'error');
      }
    });
  }

  loadTemplates(): void {
    this.emailTemplateService.getActiveTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
      },
      error: (error) => {
        console.error('Error loading templates:', error);
      }
    });
  }

  loadExcelUsers(): void {
    if (!this.selectedFoireId) {
      this.allUsers = [];
      this.dataSource.data = [];
      this.selection.clear();
      return;
    }

    this.isLoading = true;
    console.log('Loading excel users for foireId:', this.selectedFoireId);
    
    this.excelUserService.getExcelUsersByFoireId(this.selectedFoireId).subscribe({
      next: (data) => {
        console.log('Excel users loaded successfully:', data);
        this.allUsers = data;
        this.dataSource.data = this.allUsers;
        this.selection.clear();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading excel users:', error);
        console.error('Error status:', error.status);
        this.allUsers = [];
        this.dataSource.data = [];
        this.selection.clear();
        this.isLoading = false;
        if (error.status !== 401 && error.status !== 403) {
          this.showSnackBar('Erreur lors du chargement des utilisateurs', 'error');
        }
      }
    });
  }

  onFoireChange(): void {
    this.loadExcelUsers();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileSelection(input.files[0]);
    }
  }

  handleFileSelection(file: File): void {
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      this.showSnackBar('Format de fichier invalide. Seuls les fichiers .xlsx et .xls sont acceptés.', 'error');
      return;
    }

    this.selectedFile = file;
    this.uploadResponse = null;
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.showSnackBar('Veuillez sélectionner un fichier', 'error');
      return;
    }

    if (!this.selectedFoireId) {
      this.showSnackBar('Veuillez sélectionner une foire', 'error');
      return;
    }

    this.isUploading = true;
    this.uploadResponse = null;

    this.excelUserService.uploadExcelFile(this.selectedFile, this.selectedFoireId).subscribe({
      next: (response: ExcelUploadResponse) => {
        this.uploadResponse = response;
        this.isUploading = false;

        if (response.success) {
          this.showSnackBar(response.message, 'success');
          this.selectedFile = null;
          this.loadExcelUsers();
        } else {
          this.showSnackBar(response.message, 'error');
        }
      },
      error: (error) => {
        console.error('Error uploading file:', error);
        this.showSnackBar('Erreur lors du téléchargement du fichier', 'error');
        this.isUploading = false;
      }
    });
  }

  clearFile(): void {
    this.selectedFile = null;
    this.uploadResponse = null;
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
  }

  checkboxLabel(row?: ExcelUser): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id}`;
  }

  openTemplateSelection(): void {
    if (this.selection.selected.length === 0) {
      this.showSnackBar('Veuillez sélectionner au moins un utilisateur', 'error');
      return;
    }
    this.showTemplateSelection = true;
  }

  cancelTemplateSelection(): void {
    this.showTemplateSelection = false;
    this.selectedTemplateId = null;
  }

  sendEmailsToSelected(): void {
    if (!this.selectedTemplateId) {
      this.showSnackBar('Veuillez sélectionner un template', 'error');
      return;
    }

    if (this.selection.selected.length === 0) {
      this.showSnackBar('Aucun utilisateur sélectionné', 'error');
      return;
    }

    const confirmMessage = `Envoyer des emails à ${this.selection.selected.length} utilisateur(s)?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    this.isSendingEmails = true;
    const userIds = this.selection.selected.map(user => user.id);

    const request = {
      templateId: this.selectedTemplateId,
      userIds: userIds
    };

    this.excelUserService.sendEmailsToSelected(request).subscribe({
      next: (response) => {
        this.isSendingEmails = false;
        this.showTemplateSelection = false;
        this.selectedTemplateId = null;
        this.selection.clear();
        this.showSnackBar(
          `Emails envoyés! ${response.successfulEmails} réussis, ${response.failedEmails} échoués`,
          'success'
        );
        this.loadExcelUsers();
      },
      error: (error) => {
        console.error('Error sending emails:', error);
        this.showSnackBar('Erreur lors de l\'envoi des emails', 'error');
        this.isSendingEmails = false;
      }
    });
  }

  deleteUser(id: number, nom: string): void {
    if (confirm(`Supprimer l'utilisateur ${nom}?`)) {
      this.excelUserService.deleteExcelUser(id).subscribe({
        next: () => {
          this.showSnackBar(`Utilisateur ${nom} supprimé`, 'success');
          this.loadExcelUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.showSnackBar('Erreur lors de la suppression', 'error');
        }
      });
    }
  }

  deleteAllForFoire(): void {
    if (!this.selectedFoireId) {
      this.showSnackBar('Veuillez sélectionner une foire', 'error');
      return;
    }

    const foireName = this.foires.find(f => f.id === this.selectedFoireId)?.name || 'cette foire';
    
    if (confirm(`Supprimer tous les utilisateurs de ${foireName}?`)) {
      this.excelUserService.deleteExcelUsersByFoireId(this.selectedFoireId).subscribe({
        next: () => {
          this.showSnackBar('Tous les utilisateurs ont été supprimés', 'success');
          this.loadExcelUsers();
        },
        error: (error) => {
          console.error('Error deleting users:', error);
          this.showSnackBar('Erreur lors de la suppression', 'error');
        }
      });
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getSelectedFoireName(): string {
    if (!this.selectedFoireId) return '';
    const foire = this.foires.find(f => f.id === this.selectedFoireId);
    return foire ? `${foire.name} - ${foire.city}` : '';
  }

  showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'snack-bar-success' : 'snack-bar-error'
    });
  }
}
