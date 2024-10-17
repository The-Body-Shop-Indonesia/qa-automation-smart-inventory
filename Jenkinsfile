pipeline {
   agent any
   environment {
       tag = VersionNumber(versionNumberString: 'v${BUILD_DATE_FORMATTED, "yyMMdd"}${BUILDS_TODAY}')
       slackToken = "${SLACK_TOKEN}"
       // Global variable from jenkins
       imageRegistryHost = "${IMAGE_REGISTRY_HOST}"
       imageRegistry = "${IMAGE_REGISTRY}"
       jenkinsEnv = "${JENKINS_ENV}"
       branchName = "${GIT_BRANCH.split("/")[1]}"
       namespace = "${branchName}"
       appName = "qa-automation"
       registry = "docker-local/${appName}"
   }
   stages {
       stage('Build') {
           environment {
               registryCredential = 'tbsi-jfrog'
           }
           steps{
               script {
                   sh "curl -s -X POST https://hooks.slack.com/services/" + slackToken + " -H 'Content-Type: application/json' -d '{\"text\": \"⛏ Building image ${registry}:${tag}\n\n🌍 ENV: ${jenkinsEnv}\n📛 NS: ${namespace}\n♨ Repo: ${GIT_URL}\n🌿 Branch: ${branchName}\n💬 Commit: ${GIT_COMMIT}\"}'"
                   def appimage = docker.build registry + ":" + tag
                   sh "rm -Rf .env"
                   docker.withRegistry( imageRegistry, registryCredential ) {
                       sh "curl -s -X POST https://hooks.slack.com/services/" + slackToken + " -H 'Content-Type: application/json' -d '{\"text\": \"📌 Pushing image ${registry}:${tag}\n\n🌍 ENV: ${jenkinsEnv}\n📛 NS: ${namespace}\n♨ Repo: ${GIT_URL}\n🌿 Branch: ${branchName}\n💬 Commit: ${GIT_COMMIT}\"}'"
                       appimage.push()
                       appimage.push('latest')
                   }
               }
           }
       }
   }
 
   post {
        failure {
            sh "curl -s -X POST https://hooks.slack.com/services/" + slackToken + " -H 'Content-Type: application/json' -d '{\"text\": \"❌ Pipeline for image ${registry}:${tag} has failed, please check Jenkins UI for complete pipeline log\n\n🌍 ENV: ${jenkinsEnv}\n📛 NS: ${namespace}\n🌿 Branch: ${branchName}\n♨ Repo: ${GIT_URL}\"}'"   
        }
    }
}