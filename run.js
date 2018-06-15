let request = require("request");
let openUrl = require("openurl");
const cheerio = require('cheerio');
let requestP = require('request-promise');
let fs = require('fs');
let proxies = require('./proxies');
let credentials = require('./credentials/proxyCredentials');
let $;

//Shuffle the proxies
proxies = shuffleArray(proxies);

//The id you need to change to get upvotes 

let spId = 21544;
//some random things to put in the header

let someFunnyHeader = 'Studyportals Engineers 4 life';
let githubUrl = 'https://github.com/studyportals/TechOpenAirHacky';
//some variables of Tech open Air

let dt50Url = 'http://toa.berlin/dt50/#';
let dt50PostUrl = 'http://toa.berlin/wp-admin/admin-ajax.php';

//the amout of votes you want te be ahead of your contesters. 
const treshhold = 200;

//how many proxyservers do you want?
//const amountOfProxies = proxies.length;
const amountOfProxies = 3;

loopThroughProxies();

function loopThroughProxies(){

    for(let i = 0; i < amountOfProxies; i++){

        getWebsiteContent(dt50Url, buildProxyUrl(proxies[i]));
    }
}

function buildProxyUrl(proxyUrl){

    return 'http://' + credentials.username + ":" + credentials.password + "@" + proxyUrl + ":80";
}

//get all contents of the website
function getWebsiteContent(url, proxyUrl) {

    console.log('start hacking', proxyUrl);
    return request({
        proxy: proxyUrl,
        uri: url,
    }, function (error, response, body) {

        handleWebsiteBody(body, proxyUrl);
    });
}

function writeToFile(content, proxyUrl){

    proxyUrl = proxyUrl.replace('http://', '');
    proxyUrl = proxyUrl.replace('.', '-');
    proxyUrl = proxyUrl.replace(':', '-');

    fs.writeFile(`htmldump/${proxyUrl}-test.html`, content, function(err) {
        if(err) {
            return console.log(err);
        }

        console.log('Write to file!')
    }); 
}

function isTheRealDeal(htmlBody){

    if(!htmlBody){
        return false;
    }

    if(htmlBody === '429 Too Many Requests'){

        return false;
    }

    return true;
}

function handleWebsiteBody(htmlBody, proxyUrl) {

    if(!isTheRealDeal(htmlBody)){

        console.log('NOPE');
        writeToFile(htmlBody , proxyUrl);
        return;
    }

    $ = cheerio.load(htmlBody);
    //find the sp container
    let studyportalsLabel = $(`input[data-ulike-id='${spId}']`);

    //find the sp nonce
    let spNonce = studyportalsLabel.attr('data-ulike-nonce');

    //get sp score
    let spScore = getScore(studyportalsLabel.closest('.dt50-block-votes'));

    //do we have voted?
    if (!haveWeVoted(studyportalsLabel)) {

        // Vote if we have not voted.
        const HighestContestersScore = highestContestersScore(studyportalsLabel);
        
        console.log('score: ',spScore, HighestContestersScore);

        if (doWeNeedToVote(spScore, HighestContestersScore)) {

            console.log("let's try to vote!");
            // Vote we need votes!
            doVote(spNonce, proxyUrl);
        } else {

            // We are epic
            console.log('We have more than enough votes!');
        }
    }
    else {

        // Sorry can't vote...
        console.log('We already have voted!');
    }
}

function doVote(nonce, proxyUrl) {

    return request({
        proxy: proxyUrl,
        method: 'POST',
        headers: {
            'user-agent': someFunnyHeader,
            'Content-Type': 'multipart/form-data',
            'DontLookHeader': githubUrl
        },
        uri: dt50PostUrl,
        form: {
            action: 'wp_ulike_process',
            id: spId,
            nonce: nonce,
            status: 3,
            type: 'likeThis'
        }
    }, function (error, response, body) {

        if (!error) {

            console.log(JSON.parse(body).data.message);
            return;
        }

        console.log(error);
    });
}

function getScore(container) {

    return parseInt(container.text().replace('+', ''));
}

function highestContestersScore(spContainer) {

    let result = 0;
    const parent = findDt50ParentContainer(spContainer);

    const blocks = findAllBlocks(parent);

    let competitionEntries = getGroupsById(blocks);
    competitionEntries = competitionEntries.filter((entry) => {

        return entry.id != spId;
    })
    const highest = Math.max.apply(Math, competitionEntries.map((compeditor) => { return compeditor.score; }))
    return highest;
}

function getGroupsById(blocks) {

    const entries = [];
    for (let i = 0; i < blocks.length; i++) {

        const block = $(blocks[i]);
        let id = block.attr('id');

        if (!id) {

            continue;
        }

        id = parseInt(id.replace('wp-ulike-post-', ''));

        const score = getScore(block.find('.count-box'));

        entries.push({ id, score });
    }
    return entries;
}

function findDt50ParentContainer(spContainer) {

    return spContainer.closest('.dt50-container');
}

function findAllBlocks(parent) {

    return parent.find("[id^='wp-ulike-post-']");
}

function haveWeVoted(studyportalsContainer) {

    return studyportalsContainer.attr('checked') === 'checked' ? true : false;
}

function doWeNeedToVote(spVotes, topCompeditorVotes) {

    return (spVotes - topCompeditorVotes) < treshhold;
}

// fully random by github guy,, or girl.. i dont know choose one
function shuffleArray(arrayToShuffle){

    arrayToShuffle = arrayToShuffle
        .map(a => [Math.random(), a])
        .sort((a, b) => a[0] - b[0])
        .map(a => a[1]);

    return arrayToShuffle;
}