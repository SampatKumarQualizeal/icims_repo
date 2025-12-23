FROM mcr.microsoft.com/playwright:v1.56.1-jammy

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Install Playwright browsers
RUN npx playwright install --with-deps

# Add CI execution script
COPY scripts/ci-run.sh /app/ci-run.sh
RUN chmod +x /app/ci-run.sh

# CMD MUST return Playwright exit code
CMD ["/app/ci-run.sh"]
