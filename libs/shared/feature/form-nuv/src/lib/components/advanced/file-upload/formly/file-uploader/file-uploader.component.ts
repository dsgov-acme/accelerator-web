import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DocumentModel, checkIfDocumentShouldDisplayErrors } from '@dsg/shared/data-access/document-api';
import { FileStatus, NuverialFileUploadComponent, NuverialSnackBarService } from '@dsg/shared/ui/nuverial';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { EMPTY, Subject, catchError, filter, finalize, map, switchMap, take, takeUntil, tap } from 'rxjs';
import { FormlyBaseComponent } from '../../../../base';
import { FormStateMode } from '../../../../forms';
import { FileUploadFieldProperties } from '../../models/formly-file-upload.model';
import { DocumentFormService } from './../../../../../services/document-form.service';
import { FormTransactionService } from './../../../../../services/form-transaction.service';

interface FormControlEntry {
  documentId: string;
  filename: string;
}

@UntilDestroy()
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NuverialFileUploadComponent],
  selector: 'dsg-file-uploader',
  standalone: true,
  styleUrls: ['./file-uploader.component.scss'],
  templateUrl: './file-uploader.component.html',
})
export class FormlyFileUploaderComponent extends FormlyBaseComponent<FileUploadFieldProperties> implements OnInit {
  public loading = false;
  public fileStatus: Map<string, FileStatus> = new Map();
  public filePreview: Map<string, File> = new Map();

  public get documentList(): FormControlEntry[] {
    if (!this.formControl.value) return [];

    if (this.field.props.multiple && Array.isArray(this.formControl.value)) {
      return this.formControl.value;
    } else {
      return [this.formControl.value];
    }
  }

  constructor(
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _documentFormService: DocumentFormService,
    private readonly _formTransactionService: FormTransactionService,
    private readonly _nuverialSnackBarService: NuverialSnackBarService,
  ) {
    super();
  }

  private readonly _cancelUpload$ = new Subject<string>();

  private _initFilePreview(): void {
    if (this.mode !== FormStateMode.Edit) return;

    // Get all existing documents
    let documentList = [];
    if (Array.isArray(this.formControl.value)) {
      documentList = this.formControl.value;
    } else {
      documentList.push(this.formControl.value);
    }

    for (const document of documentList) {
      const documentId = document?.documentId;
      const fileName = document?.filename || '';

      if (!documentId) return;

      this.loading = true;

      this._documentFormService
        .getDocumentFileDataById$(documentId)
        .pipe(
          tap(blob => {
            this.loading = false;

            const initialProcessingStatus = {
              failed: false,
              processors: [],
            };

            const file = new File([blob], fileName, { type: blob.type }); // Unfortunately getDocumentFileDataById$ does not return the file name
            this.fileStatus.set(fileName, {
              isProcessing: true,
              isUploading: false,
              name: fileName,
              processingStatus: initialProcessingStatus,
              uploadProgress: 100,
            });
            this.filePreview.set(fileName, file);

            this.filePreview = structuredClone(this.filePreview);
            this.fileStatus = structuredClone(this.fileStatus);

            this._changeDetectorRef.markForCheck();
          }),
          switchMap(_ => {
            return this._documentFormService.getProcessingResultsById$(documentId);
          }),
          tap(processingResult => {
            const processingStatus = {
              failed: checkIfDocumentShouldDisplayErrors(processingResult) > 0,
              processors: processingResult,
            };

            this.fileStatus.set(fileName, { isProcessing: false, isUploading: false, name: fileName, processingStatus: processingStatus, uploadProgress: 100 });
            this.fileStatus = structuredClone(this.fileStatus);

            this._changeDetectorRef.markForCheck();
          }),
          catchError(_error => {
            this._nuverialSnackBarService.notifyApplicationError();

            return EMPTY;
          }),
          // We handle unsubscribe in 3 ways here because this is a polling observable and we want to complete if this cancels or we navigate away
          take(1),
          takeUntil(this._cancelUpload$),
          untilDestroyed(this),
        )
        .subscribe();
    }
  }

  public ngOnInit(): void {
    this._initFilePreview();
  }

  public onUploadDocument(file: File) {
    this._documentFormService
      .uploadDocument$(file)
      .pipe(
        tap(response => {
          let status = this.fileStatus.get(file.name);

          // Add the file to the fileStatus map if it doesn't exist
          if (!status) {
            const processingStatus = { failed: false, processors: [] };
            this.fileStatus.set(file.name, { isProcessing: false, isUploading: true, name: file.name, processingStatus, uploadProgress: 0 });
            this.filePreview.set(file.name, file);

            status = this.fileStatus.get(file.name);
            this._changeDetectorRef.markForCheck();
          }

          // Update the upload progress
          if (typeof response === 'number' && status) {
            const updatedfileStatus = { ...status, uploadProgress: response };
            this.fileStatus.set(file.name, updatedfileStatus);
            this.fileStatus = structuredClone(this.fileStatus);

            status = this.fileStatus.get(file.name);
            this._changeDetectorRef.markForCheck();
          }

          // Update the form control when upload finishes
          if (response instanceof DocumentModel) {
            let updatedFormValue = this.formControl?.value;

            // Update value depending on multiple or single
            if (this.field.props.multiple) {
              if (!updatedFormValue) updatedFormValue = [];

              updatedFormValue.push({
                documentId: response.documentId,
                filename: file.name,
              });
            } else {
              updatedFormValue = {
                ...updatedFormValue,
                documentId: response.documentId,
                filename: file.name,
              };
            }

            this.formControl?.setValue(updatedFormValue);

            // Update file processing and upload status
            if (status) {
              const updatedfileStatus = { ...status, isProcessing: true, isUploading: false };
              this.fileStatus.set(file.name, updatedfileStatus);
              this.fileStatus = structuredClone(this.fileStatus);

              this._changeDetectorRef.markForCheck();
            }
          }
        }),
        filter(response => response instanceof DocumentModel),
        map(response => response as DocumentModel),
        switchMap(document =>
          this._documentFormService.processDocument$(this._formTransactionService.transactionId, document.documentId, this.field.key?.toString() || ''),
        ),
        tap(processingResult => {
          const processingStatus = {
            failed: checkIfDocumentShouldDisplayErrors(processingResult) > 0,
            processors: processingResult,
          };

          const fileStatus = this.fileStatus.get(file.name);
          if (fileStatus) this.fileStatus.set(file.name, { ...fileStatus, processingStatus: processingStatus });
        }),
        catchError(_error => {
          this._nuverialSnackBarService.notifyApplicationError();
          this._changeDetectorRef.markForCheck();

          return EMPTY;
        }),
        finalize(() => {
          const fileStatus = this.fileStatus.get(file.name);

          if (fileStatus) {
            const updatedfileStatus = { ...fileStatus, isProcessing: false };
            this.fileStatus.set(file.name, updatedfileStatus);
            this.fileStatus = structuredClone(this.fileStatus);

            this._changeDetectorRef.markForCheck();
          }
        }),
        // We handle unsubscribe in 3 ways here because this is a polling observable and we want to complete if this cancels or we navigate away
        take(1),
        takeUntil(this._cancelUpload$.pipe(filter(name => name === file.name))),
        untilDestroyed(this),
      )
      .subscribe();
  }

  public removeDocument(name: string) {
    if (Array.isArray(this.formControl.value)) {
      const updatedValue = this.formControl.value.filter((file: FormControlEntry) => file.filename !== name);
      this.formControl.setValue(updatedValue);
    } else {
      this.formControl.setValue(undefined);
    }
  }

  public onRemoveDocument(name: string) {
    this.fileStatus.delete(name);
    this.filePreview.delete(name);
    this.fileStatus = structuredClone(this.fileStatus);
    this.removeDocument(name);
    this._cancelUpload$.next(name);
  }

  public openDocument(index: number) {
    const document = this.field.props.multiple ? this.formControl.value[index] : this.formControl.value;

    this._documentFormService.openDocument$(document.documentId).pipe(take(1)).subscribe();
  }

  public trackByFn(index: number): number {
    return index;
  }
}
