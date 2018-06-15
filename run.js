let request = require("request");
let openUrl = require("openurl");
const cheerio = require('cheerio');
let $;

let dt50Url = 'https://toa.berlin/dt50/#';
let dt50PostUrl = 'https://toa.berlin/wp-admin/admin-ajax.php';
let spId = 21544;
let someFunnyHeader = 'Studyportals Engineers 4 life'
const treshhold = 50;

getWebsiteContent(dt50Url);

function getWebsiteContent(url) {

    return request({

        uri: url,
    }, function (error, response, body) {

        handleWebsiteBody(body);
    });
}

function handleWebsiteBody(htmlBody) {

    $ = cheerio.load(htmlBody);
    //find the sp container
    let studyportalsLabel = $(`input[data-ulike-id='${spId}']`);
    //find the sp nonce
    let spNonce = studyportalsLabel.attr('data-ulike-nonce');
    //get sp score
    let spScore = getScore(studyportalsLabel.closest('.dt50-block').find('.count-box'));
    //do we have voted?
    if (!haveWeVoted(studyportalsLabel)) {

        // Vote if we have not voted.
        const HighestContestersScore = highestContestersScore(studyportalsLabel);

        if (doWeNeedToVote(spScore, HighestContestersScore)) {

            // Vote we need votes!
            doVote(spNonce);
        }
        else {

            // We are epic
            console.log('We have more than enough votes!');
        }
    }
    else {

        // Sorry can't vote...
        console.log('We already have voted!');
    }
}


function doVote(nonce) {

    return request({
        method: 'POST',
        headers: {
            'user-agent': someFunnyHeader,
            'Content-Type': 'multipart/form-data'
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

// var studyportalsContainer = $(`input[data-ulike-id='${spId}']`);


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

        id = parseInt(id.replace('wp-ulike-post-',''));

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

    return (spVotes - topCompeditorVotes) > treshhold;
}