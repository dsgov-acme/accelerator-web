import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { NuverialButtonComponent } from '../button';
import { NuverialIconComponent } from '../icon';
import { INuverialSelectOption } from '../select/select.models';
/**
 * A Button with a selector dropdown component
 *
 * ## Usage
 *
 * ```
 *   <nuverial-selector-button-dropdown
 *   [menuItems]="selectOption"
 *   (buttonClickedEvent)="createNewTransaction($event)"
 *   buttonText="New Application">
 *   </nuverial-selector-button-dropdown>
 * ```
 * *
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatMenuModule, NuverialButtonComponent, NuverialIconComponent],
  selector: 'nuverial-selector-button-dropdown',
  standalone: true,
  styleUrls: ['./selector-button-dropdown.component.scss'],
  templateUrl: './selector-button-dropdown.component.html',
})
export class NuverialSelectorButtonDropdownComponent {
  /**
   * Input of a string, the text that will be displayed on the button
   */
  @Input() public buttonText!: string;
  /**
   * Input of INuverialSelectOption objects, the displayTextValue key will be displayed in a item inside the menu
   */
  @Input() public menuItems!: INuverialSelectOption[];
  /**
   * Click event on selecting a dropdown item which will emit the key of the selected item
   */
  @Output() public readonly buttonClickedEvent: EventEmitter<INuverialSelectOption> = new EventEmitter<INuverialSelectOption>();

  public selectItem(item: INuverialSelectOption): void {
    this.buttonClickedEvent.emit(item);
  }

  public trackByFn(index: number): number {
    return index;
  }
}
