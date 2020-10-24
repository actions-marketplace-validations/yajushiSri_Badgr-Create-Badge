const { getInput, setOutput, setFailed } = require('@actions/core');
const GitHub = require('@actions/github');
const request = require('request');
const rp = require('request-promise');

const getInputBool = (name, defaultValue = false) => {
    const param = getInput(name);
    if (param === 'true' || param === '1') {
        return true
    } else if (param === 'false' || param === '0') {
        return false
    } else return defaultValue
};

async function main() {
    // retrieve input data
    const token = getInput('github-token', { required: true });
    const sha = getInput('sha');
    const repo = getInput('repo');
    const username = getInput('username');
    const password = getInput('password');

    const octokit = GitHub.getOctokit(token);

    // get current pull request number
    const getPRnumber = await octokit.repos.listPullRequestsAssociatedWithCommit({
        owner: repo.split("/")[0],
        repo: repo.split("/")[1],
        commit_sha: sha,
    });
    const pr_number = getPRnumber.data[0].number;
    console.log("RESPONSE getPRnumber ", getPRnumber);
    console.log("pr_number: ", pr_number);
    // get pull request data 
    const { data: pullRequest } = await octokit.pulls.get({
        owner: repo.split("/")[0],
        repo: repo.split("/")[1],
        pull_number: pr_number
    });
    const githubUsername = pullRequest.user.login;
    console.log("RESPONSE pullRequest ", pullRequest);
    console.log("githubUsername: ", githubUsername);
    const labelsArray = new Array();  
    for (i in pullRequest.labels){
        labelsArray.push(pullRequest.labels[i].name);
    }
    // get user data 
    const { data: userData } = await octokit.users.getByUsername({
        username: githubUsername,
      });
    const fullName = userData.name;
    const userEmail = userData.email;
    const pr_url = pullRequest.html_url;
    console.log("RESPONSE userData ", userData);
    console.log("fullName: ", fullName);
    console.log("userEmail ", userEmail);
    console.log("pr_url: ", pr_url);
    var options = {
        method: 'POST',
        uri: 'https://api.eu.badgr.io/o/token',
        form: {
            username: username, 
            password: password
        },
        headers: {
            'Content-Type' : 'application/json'
        }
    };
     
    accessToken = await rp(options)
        .then(function (body) {  
            var response = JSON.parse(body);
            accessToken = response.access_token;  
            return accessToken;
        })
        .catch(function (err) { 
            console.log(err)
        });

    console.log("ACCESS TOKEN: ", accessToken);

    var options = {
        method: 'GET',
        uri: 'https://api.eu.badgr.io/v2/badgeclasses',
        headers: {
            'Content-Type' : 'application/json',
            'Authorization' : 'Bearer ' + accessToken
        }
    };

    badgeDetails = await rp(options)
        .then(function (body) {
            var responseAllBadges = JSON.parse(body);
            for(var i=0; i<labelsArray.length; i++){
                for(var j=0; j<responseAllBadges.result.length; j++){
                    var badge = responseAllBadges.result[j].name.toLowerCase();
                    var label = labelsArray[i].replace('"', '').replace('"', '').toLowerCase();
                    if(badge.includes(label)){
                        console.log(responseAllBadges.result[j]);
                        return responseAllBadges.result[j];
                    }
                }        
            }            
        });
    console.log("RESPONSE badgeDetails ", badgeDetails);
    console.log("RESPONSE badgeDetails typeof ", typeof badgeDetails);
    console.log("RESPONSE badgeDetails entity id ", badgeDetails.entityId);

    var options = {
        method: 'POST',
        uri: 'https://api.eu.badgr.io/v2/badgeclasses/' + badgeDetails.entityId.toString() + '/assertions',
        headers: {
            'Content-Type' : 'application/json',
            'Authorization' : 'Bearer ' + accessToken
        },
        json: true,
        body: {
            recipient: {
                identity: userEmail,
                hashed: true,
                type: "email",
                plaintextIdentity: fullName
            },
            issuedOn: new Date().toISOString(),
            evidence: [
                {
                    url: pr_url,
                    narrative: badgeDetails.criteriaNarrative
                }
            ],
            notify: true,
            extensions: {
                "extensions:recipientProfile": {
                  "@context": "https://openbadgespec.org/extensions/recipientProfile/context.json",
                  "type": [
                    "Extension",
                    "extensions:RecipientProfile"
                  ],
                  name: fullName
                }
              }
        }
    };

    await rp(options)
    .then(function (body) {  
        console.log("ASSERT BADGE: ", body);
    })
    .catch(function (err) { 
        console.log(err)
    });
}

main().catch(error => setFailed(error.message));