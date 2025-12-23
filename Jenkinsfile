pipeline {
    agent { label 'nodegroup01' }

    options {
        timestamps()
        ansiColor('xterm')
        durabilityHint('PERFORMANCE_OPTIMIZED')
        buildDiscarder(logRotator(daysToKeepStr: '7', numToKeepStr: '10'))
    }

    parameters {
        string(name: 'ENV', defaultValue: 'qa')
        string(name: 'SHARDS', defaultValue: '4')
        string(name: 'TEAM_NAME', defaultValue: 'automation')
    }

    environment {
        IMAGE_NAME     = "playwright-automation-${params.TEAM_NAME.toLowerCase()}"
        CONTAINER_NAME = "playwright-automation-container-${params.TEAM_NAME.toLowerCase()}"
        REPORT_DIR     = "${WORKSPACE}/playwright-report"
        RESULTS_DIR    = "${WORKSPACE}/test-results"
        TEST_EXIT_CODE = "0"
    }

    stages {

        stage('Pre-build cleanup') {
            steps {
                sh """
                    mkdir -p "${REPORT_DIR}"
                    mkdir -p "${RESULTS_DIR}"
                """
            }
        }

        stage('Build Playwright Docker Image') {
            steps {
                script {
                    def pwVersion = sh(script: "bash scripts/extract-playwright-version.sh", returnStdout: true).trim()
                    echo "Building Docker image for Playwright ${pwVersion}"
                    sh """
                        docker build --build-arg PLAYWRIGHT_VERSION=${pwVersion} -t ${IMAGE_NAME} .
                    """
                }
            }
        }

        /*
         * Run tests:
         * - Use catchError(buildResult:'FAILURE', stageResult:'FAILURE') so the stage is marked FAILED (red)
         *   but the pipeline continues to the next stages (Publish Reports).
         */
        stage('Run Playwright Tests') {
            steps {
                script {
                    catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                        echo "Running Playwright tests in Docker (ENV=${params.ENV}, SHARDS=${params.SHARDS})"

                        // Run container and capture exit code (do not let this step abort the pipeline directly)
                        env.TEST_EXIT_CODE = sh(
                            returnStatus: true,
                            script: """
                                docker run \
                                    -e ENV=${params.ENV} \
                                    -e SHARDS=${params.SHARDS} \
                                    -e CI=true \
                                    --name ${CONTAINER_NAME} \
                                    -v ${REPORT_DIR}:/app/playwright-report \
                                    -v ${RESULTS_DIR}:/app/test-results \
                                    ${IMAGE_NAME}
                            """
                        ).toString().trim()

                        echo "Container exit code = ${env.TEST_EXIT_CODE}"

                        // If tests failed, throw inside catchError so this stage is marked FAILED but pipeline continues
                        if (env.TEST_EXIT_CODE != "0") {
                            error("Playwright tests failed (exit code ${env.TEST_EXIT_CODE})")
                        }
                    }
                }
            }
            post {
                always {
                    // ensure container cleanup
                    sh "docker rm -f ${CONTAINER_NAME} || true"
                }
            }
        }

        /*
         * Publish reports ALWAYS. We try to prevent JUnit from marking the build UNSTABLE:
         *  - Prefer using skipMarkingBuildUnstable (if JUnit plugin supports it)
         *  - Fallback to catchError to prevent stage failure if plugin does not support the flag
         */
        stage('Publish Reports') {
            steps {
                script {
                    echo "Publishing HTML report..."
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: REPORT_DIR,
                        reportFiles: 'index.html',
                        reportName: 'Playwright HTML Report'
                    ])

                    echo "Publishing JUnit results (without letting JUnit mark build UNSTABLE if possible)..."
                    try {
                        // preferred: ask junit to skip marking build unstable (requires recent junit plugin)
                        junit testResults: 'test-results/**/*.xml', allowEmptyResults: true, skipMarkingBuildUnstable: true
                    } catch (err) {
                        // fallback for older Jenkins: swallow junit exceptions so this stage stays green
                        echo "skipMarkingBuildUnstable not supported by this JUnit plugin version, falling back."
                        catchError(buildResult: 'SUCCESS', stageResult: 'SUCCESS') {
                            junit testResults: 'test-results/**/*.xml', allowEmptyResults: true
                        }
                    }

                    // Archive everything (traces, videos, screenshots, evidence)
                    archiveArtifacts artifacts: 'test-results/**/*.*', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'playwright-report/**/*.*', allowEmptyArchive: true
                }
            }
        }

        /*
         * Finalize: ensure build ends FAILED if tests failed. Because earlier catchError(buildResult:'FAILURE', ...)
         * should've already set build to FAILURE when tests failed, but we double-check here for clarity.
         */
        stage('Finalize Build Result') {
            steps {
                script {
                    if (env.TEST_EXIT_CODE != "0") {
                        // If the build isn't already marked FAILURE, mark and error to ensure final status is FAILURE.
                        currentBuild.result = 'FAILURE'
                        error("Playwright tests failed (exit code ${env.TEST_EXIT_CODE}) - marking build FAILURE.")
                    } else {
                        echo "All tests passed (exit code 0)."
                    }
                }
            }
        }
    }

    post {
        always {
            // workspace cleanup
            cleanWs()
        }
    }
}
