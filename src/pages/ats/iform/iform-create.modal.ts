// src/pages/ats/create-iform.modal.ts
import { Page } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Checkbox } from '@src/components/checkbox.component';
import { Dropdown } from '@src/components/dropdown.component';

export class IFormCreateModal extends BasePage {
  readonly formNameInput: Input;
  readonly publicCheckbox: Checkbox;
  readonly easySecurityCheckbox: Checkbox;
  readonly itemTypeDropdown: Dropdown;
  readonly createBtn: Button;

  constructor(page: Page) {
    const modalRoot = page.locator('#createForm'); // popup root
    super(page, modalRoot, 'Create iForm Modal');

    this.formNameInput = new Input(
      page,
      modalRoot.locator('input[name="form"]'),
      'iForm Name Input'
    );

    this.publicCheckbox = new Checkbox(
      page,
      modalRoot.locator('#public1'),
      'Public Checkbox'
    );

    this.easySecurityCheckbox = new Checkbox(
      page,
      modalRoot.locator('#easyEditMode1'),
      'Easy Security Checkbox'
    );

    this.itemTypeDropdown = new Dropdown(
      page,
      modalRoot.locator('select[name="itemtype"]'),
      'Item Type Dropdown'
    );

    this.createBtn = new Button(
      page,
      modalRoot.getByRole('button', { name: 'Create' }),
      'Create Submit Button'
    );
  }

  async expectOpen() {
    await this.section('Verify Create iForm modal open', async () => {
      await this.formNameInput.expectVisible();
    });
  }
 async createIForm(formName: string, isPublic: boolean = true, isEasy: boolean = true, formType: string = 'person') {
    await this.section(`Create iForm: ${formName}`, async () => {
       await this.formNameInput.fill(formName);
      
      if (isPublic) {
        await this.publicCheckbox.check();
      }
      
      if (isEasy) {
        await this.easySecurityCheckbox.check();
      }
      
      if (formType === 'person') {
        await this.itemTypeDropdown.select('Person');
      }
      
      await this.createBtn.click();
    });
  }
  
}
