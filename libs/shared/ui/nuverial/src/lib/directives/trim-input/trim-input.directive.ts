import { Directive, OnInit, Renderer2 } from '@angular/core';
import { NgControl } from '@angular/forms';
import { NuverialTextInputComponent } from '../../components';

@Directive({
  selector: '[nuverialTrimInput]',
  standalone: true,
})
export class NuverialTrimInputDirective implements OnInit {
  constructor(private readonly host: NuverialTextInputComponent, private readonly renderer: Renderer2, private readonly control: NgControl) {}

  public ngOnInit() {
    this.renderer.listen(this.host.inputElementRef.nativeElement, 'focusout', () => {
      this.trimInputValue();
    });
  }

  public trimInputValue() {
    const inputValue = this.host.inputElementRef.nativeElement.value;
    const trimmedValue = inputValue.trim();
    this.renderer.setProperty(this.host.inputElementRef.nativeElement, 'value', trimmedValue);
    if (this.control && this.control.control) {
      this.control.control.setValue(trimmedValue);
    }
  }
}
