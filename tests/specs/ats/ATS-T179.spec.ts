// tests/specs/ats/ATS-T179.spec.ts
import { test } from '@tests/governance';
import { PersonSearchFlow } from '@src/flows/ats/person-search.flow';
import { ensureAuth } from '@src/utils/auth-helper.util';

test.describe('ATS-T179: Person Search - Save/Edit/Delete Search Template', () => {
    test('ATS-T179: Person Search - Save/Edit/Delete Search Template',
        async ({ baseTest, authPage, testData }) => {
            const { page, dispose } = await ensureAuth(baseTest, authPage, 'admin', 'ats');
            
            const personSearchFlow = new PersonSearchFlow(page);

            await personSearchFlow.navigateToPersonSearch();

            await personSearchFlow.configureSearch({
                filters: testData.filters,
                columns: testData.columns,
                groupBy: testData.groupBy,
                sortBy: testData.sortBy,
            });

            await personSearchFlow.runSearch();

            await personSearchFlow.saveSearchTemplate({
                title: testData.searchTemplateTitle,
                description: testData.searchTemplateDescription,
                useTemplate: true,
                editDelete: true,
            });

            await personSearchFlow.verifySearchTemplateInDropdown(testData.searchTemplateTitle);

            await personSearchFlow.saveOutputTemplate({
                title: testData.outputTemplateTitle,
                useTemplate: true,
                editDelete: true,
            });

            await personSearchFlow.verifyOutputTemplateInDropdown(testData.outputTemplateTitle);

            await personSearchFlow.manageSearchTemplates();

            await personSearchFlow.searchTemplateInManageModal(testData.searchTemplateTitle);

            await personSearchFlow.verifyTemplateExists(testData.searchTemplateTitle);

            await personSearchFlow.editSearchTemplate(testData.searchTemplateTitle, {
                title: testData.updatedSearchTemplateTitle,
            });

            await personSearchFlow.manageSearchTemplates();

            await personSearchFlow.searchTemplateInManageModal(testData.updatedSearchTemplateTitle);

            await personSearchFlow.verifyTemplateExists(testData.updatedSearchTemplateTitle);

            await personSearchFlow.deleteSearchTemplate(testData.updatedSearchTemplateTitle);

            await personSearchFlow.verifyTemplateDeleted(testData.updatedSearchTemplateTitle);

            await personSearchFlow.closeManageTemplatesModal();
        }
    );
});
