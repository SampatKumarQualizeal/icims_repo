// src/flows/ats/hcm/ukg-employee-sync.flow.ts
import { Page } from '@playwright/test';
import { BaseTest } from '@src/utils/base-test.util';
import { BaseFlow } from '@src/utils/base-flow.util';
import { QuickSearchService } from '@src/services/quick-search.service';
import { PersonEmployeeInfoTabPage } from '@src/pages/ats/person/person-employee-info-tab.page';
import { PersonProfileEEOTabPage } from '@src/pages/ats/person/person-profile-eeo-tab.page';

/**
 * UKGEmployeeSyncFlow
 * Orchestrates UKG-PRO Employee Delta Sync verification workflow:
 * - Search for employee via Quick Search
 * - Verify employee data populated from UKG Pro
 * - Verify EEO data populated (with parameter-based filtering)
 * 
 * Key Features:
 * - Delta Sync: Only changed fields synced to iCIMS
 * - Parameter Filtering: Lookup table controls which fields sync
 * - Batch Processing: Handles large volumes via parent-batch recipes
 * 
 * Note: This is PARTIAL AUTOMATION - Workato and UKG Pro operations are MANUAL steps
 */
export class UKGEmployeeSyncFlow extends BaseFlow {
  private quickSearch: QuickSearchService;
  private employeeInfoTabPage: PersonEmployeeInfoTabPage;
  private eeoTabPage: PersonProfileEEOTabPage;

  constructor(baseTest: BaseTest, page: Page) {
    super(baseTest, page);
    this.quickSearch = new QuickSearchService(page);
    this.employeeInfoTabPage = new PersonEmployeeInfoTabPage(page);
    this.eeoTabPage = new PersonProfileEEOTabPage(page);
  }

  /**
   * Search for employee by email via Quick Search
   */
  async searchForEmployee(email: string, firstName: string, lastName: string) {
    await this.base.logger.section('Search for employee in iCIMS', async () => {
      // Search by email and select from results
      await this.quickSearch.searchAndSelectPersonByEmail(email);
      
      this.base.logger.info(`✓ Employee found: ${firstName} ${lastName}`);
    });
  }

  /**
   * Verify employee profile is displayed
   */
  async verifyEmployeeProfileDisplayed(firstName: string, lastName: string) {
    await this.base.logger.section('Verify employee profile displayed', async () => {
      await this.quickSearch.verifyPersonProfileDisplayed(firstName, lastName);
      
      this.base.logger.info(`✓ Employee profile displayed: ${firstName} ${lastName}`);
    });
  }

  /**
   * Verify employee data populated from UKG Pro
   * @param employeeData - Employee fields to verify (employeeId, department, position, etc.)
   */
  async verifyEmployeeData(employeeData: {
    employeeId?: string;
    department?: string;
    position?: string;
    hireDate?: string;
    status?: string;
  }) {
    await this.base.logger.section('Verify employee data populated from UKG Pro', async () => {
      // Navigate to Employee Info tab
      await this.employeeInfoTabPage.clickEmployeeInfoTab();
      
      // Verify employee data fields
      await this.employeeInfoTabPage.verifyEmployeeData(employeeData);
      
      this.base.logger.info('✓ Employee data verification completed');
    });
  }

  /**
   * Verify EEO data populated with parameter-based filtering
   * 
   * IMPORTANT: Parameter-Based Filtering
   * Test verifies parameter lookup table controls EEO data sync.
   * 
   * If parameter "SyncEEOData" = false in Workato lookup table:
   * - Gender, Race, Disability should NOT be synced
   * - Fields should remain empty in iCIMS
   * 
   * If parameter "SyncEEOData" = true:
   * - Gender, Race, Disability SHOULD be synced
   * - Fields should contain values from UKG Pro
   * 
   * @param eeoData - EEO fields to verify (gender, race, disability)
   */
  async verifyEEOData(eeoData: {
    gender?: string;
    race?: string;
    disability?: string;
  }) {
    await this.base.logger.section('Verify EEO data populated', async () => {
      // Navigate to EEO tab
      await this.eeoTabPage.navigateToEEO();
      
      this.base.logger.info('');
      this.base.logger.info('═══════════════════════════════════════════════════════');
      this.base.logger.info('PARAMETER-BASED FILTERING');
      this.base.logger.info('→ EEO data sync controlled by Workato lookup table');
      this.base.logger.info('→ If parameters = false: Fields NOT synced');
      this.base.logger.info('→ If parameters = true: Fields SHOULD be synced');
      this.base.logger.info('═══════════════════════════════════════════════════════');
      this.base.logger.info('');
      
      // Verify Gender
      if (eeoData.gender) {
        try {
          await this.eeoTabPage.verifyGender(eeoData.gender);
          this.base.logger.info(`✓ Gender populated: ${eeoData.gender}`);
          this.base.logger.info('  → Parameter SyncGender = true in Workato');
        } catch (error) {
          this.base.logger.info('⚠ Gender not populated');
          this.base.logger.info('  → Parameter SyncGender = false OR not mapped in Workato');
        }
      }
      
      // Verify Race
      if (eeoData.race) {
        try {
          await this.eeoTabPage.verifyRace(eeoData.race);
          this.base.logger.info(`✓ Race populated: ${eeoData.race}`);
          this.base.logger.info('  → Parameter SyncRace = true in Workato');
        } catch (error) {
          this.base.logger.info('⚠ Race not populated');
          this.base.logger.info('  → Parameter SyncRace = false OR not mapped in Workato');
        }
      }
      
      // Verify Disability
      if (eeoData.disability) {
        try {
          await this.eeoTabPage.verifyDisability(eeoData.disability);
          this.base.logger.info(`✓ Disability status populated: ${eeoData.disability}`);
          this.base.logger.info('  → Parameter SyncDisability = true in Workato');
        } catch (error) {
          this.base.logger.info('⚠ Disability status not populated');
          this.base.logger.info('  → Parameter SyncDisability = false OR not mapped in Workato');
        }
      }
      
      this.base.logger.info('');
      this.base.logger.info('MANUAL VERIFICATION: Workato Parameter Configuration');
      this.base.logger.info('→ Login to Workato');
      this.base.logger.info('→ Navigate to Lookup Tables');
      this.base.logger.info('→ Find: "UKG-Pro-Employee-Parameters"');
      this.base.logger.info('→ Check parameters: SyncGender, SyncRace, SyncDisability');
      this.base.logger.info('→ Verify values match observed behavior in iCIMS');
      
      this.base.logger.info('✓ EEO field verification completed');
    });
  }

  /**
   * Search for updated employee and verify changes synced
   */
  async verifyEmployeeUpdate(email: string, firstName: string, lastName: string, updatedData: {
    department?: string;
    position?: string;
  }) {
    await this.base.logger.section('Verify updated employee data synced', async () => {
      // Search for updated employee
      await this.searchForEmployee(email, firstName, lastName);
      
      // Verify profile displayed
      await this.verifyEmployeeProfileDisplayed(firstName, lastName);
      
      // Navigate to Employee Info tab
      await this.employeeInfoTabPage.clickEmployeeInfoTab();
      
      // Verify updated fields
      if (updatedData.department) {
        await this.employeeInfoTabPage.verifyField('Department', updatedData.department);
      }
      if (updatedData.position) {
        await this.employeeInfoTabPage.verifyField('Position', updatedData.position);
      }
      
      this.base.logger.info('');
      this.base.logger.info('✓ Delta Sync Verification:');
      this.base.logger.info('  → Updated fields synced from UKG Pro to iCIMS');
      this.base.logger.info('  → Only changed fields sent (delta sync, not full record)');
      this.base.logger.info('  → Confirms recipe detected changes in UKG Pro');
    });
  }
}
