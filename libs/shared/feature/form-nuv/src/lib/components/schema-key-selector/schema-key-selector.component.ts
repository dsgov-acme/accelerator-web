import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnChanges, Renderer2, SimpleChanges } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SchemaTreeDefinitionModel, TreeNode, WorkApiRoutesService } from '@dsg/shared/data-access/work-api';
import { NuverialIconComponent } from '@dsg/shared/ui/nuverial';
import { UntilDestroy } from '@ngneat/until-destroy';
import { tap } from 'rxjs';
import { BaseFormlyFieldProperties, FormioBaseCustomComponent } from '../base';
import { SchemaKeySelectorModalComponent } from '../schema-key-selector-modal';

interface SchemaKeySelectorFieldProperties extends BaseFormlyFieldProperties {
  buttonLabel?: string;
  allowedSchemaTypes?: string[]; // Empty array means all types are allowed.
}

@UntilDestroy()
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NuverialIconComponent],
  selector: 'dsg-schema-key-selector',
  standalone: true,
  styleUrls: ['./schema-key-selector.component.scss'],
  templateUrl: './schema-key-selector.component.html',
})
export class SchemaKeySelectorComponent extends FormioBaseCustomComponent<string, SchemaKeySelectorFieldProperties> implements OnChanges {
  public selectedSchemaKey = '';
  public dialogRef?: MatDialogRef<SchemaKeySelectorModalComponent>;

  // This observable is just to load the schema tree from API so it's stored in the service
  public loadSchemaTree$ = this._workApiRoutesService.schemaTree$;

  public get label(): string {
    return this.props.buttonLabel ?? 'MAP SCHEMA ATTRIBUTE';
  }

  constructor(
    private readonly _dialog: MatDialog,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _workApiRoutesService: WorkApiRoutesService,
    private readonly _renderer: Renderer2, // @Inject(DOCUMENT) private readonly document: Document,
  ) {
    super();
  }

  // Case sensitive, not a search
  public checkAndSetExistingSchemaKey(key: string, root: TreeNode) {
    const steps = key.split('.');

    let currentNode = root;
    for (const step of steps) {
      // Continue down the tree if a child matches the key
      const matchingChild = currentNode.children.find((child: TreeNode) => child.key === step);
      if (matchingChild) {
        currentNode = matchingChild;
      } else {
        // Key doesnt exist
        this.updateValue('');

        return;
      }
    }

    this.selectedSchemaKey = key;
    this.updateValue(this.selectedSchemaKey);
  }

  public clearSelectedSchemaKey(): void {
    this.selectedSchemaKey = '';
    this.updateValue(this.selectedSchemaKey);
  }

  public openModal(): void {
    const builderDialog = document.querySelector('.formio-dialog');
    if (builderDialog) this._renderer.setStyle(builderDialog, 'display', 'none');

    this.dialogRef = this._dialog.open(SchemaKeySelectorModalComponent, {
      autoFocus: false,
      data: {
        allowedSchemaTypes: this.props.allowedSchemaTypes,
      },
    });

    this.dialogRef
      .afterClosed()
      .pipe(
        tap(response => {
          if (response) {
            this.selectedSchemaKey = response;
            this.updateValue(this.selectedSchemaKey);
            this._changeDetectorRef.markForCheck();
          }

          if (builderDialog) this._renderer.removeStyle(builderDialog, 'display');
        }),
      )
      .subscribe();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const value = changes['value']?.currentValue;
    if (value) {
      this.loadSchemaTree$
        .pipe(
          tap((schemaTree: SchemaTreeDefinitionModel) => {
            if (schemaTree) {
              const root = SchemaTreeDefinitionModel.toTree(schemaTree);
              this.checkAndSetExistingSchemaKey(value, root);
              this._changeDetectorRef.markForCheck();
            }
          }),
        )
        .subscribe();
    }
  }
}
