export function extractTestId(title: string): string {
  const match = title.match(/(ATS|CRM|CST|PORTAL|TXTE|CMS|OTHER)-T?\d+/i);

  if (!match) {
    throw new Error(
      `Unable to extract testId from test title: "${title}". ` +
      `Expected something like ATS-T113.`
    );
  }

  return match[0].toUpperCase();
}
