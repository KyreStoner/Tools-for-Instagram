let fs = require('fs');
let getUserInfo = require('./getUserInfo.js');
let sleep = require('./sleep.js');

async function getFollowers(ig, username, maxIterations = undefined){
    let filename = username.toString().toLowerCase() +"_followers.json"
    let filepath = "./output/" + filename;
    let pk = await ig.user.getIdByUsername(username);
    const feed = ig.feed.accountFollowers(pk);
    //Start JSON with [
    fs.writeFileSync(filepath, '[', function (err) {
        if (err) throw err;
        console.log("file was created");
    });
    
    let user_info = await getUserInfo(ig,username);
    let counter = 0;
    let sleep_after = 10000;
    let iterations = 0;
    do {
        try {
            let i = await feed.items();
            console.log(parseInt((counter/user_info.follower_count)*100) + "% " + counter + "/" + user_info.follower_count);
            Object.keys(i).map(function(objectKey, index) {
                var value = i[objectKey];
                //console.log(value);
                fs.appendFileSync(filepath ,JSON.stringify(value, undefined, '\t')+",\r\n", function (err){
                    if (err) throw err;
                });
                counter +=1;
                sleep_after -=1;
            });

            if(sleep_after <= 0) {
                iterations += 1;
                if(maxIterations != undefined && iterations >= maxIterations) {
                    
                    fs.appendFileSync(filepath ,'{"EOF": true}\n]', function (err){
                        if (err) throw err;
                    });
                    return console.log("Desired iterations completed, skipping the other followers\nFollowers saved to 'output' folder with name ".green + filename.green);
                }
                console.log("Wait a minute ..");
                await sleep(60);
                sleep_after = 10000;
                console.log ("continue");
            }
            

        } catch(e) {
            console.log(e);
        }
	
    } while(feed.moreAvailable == true);
    //End of JSON file
    fs.appendFileSync(filepath ,'{"EOF": true}\n]', function (err){
        if (err) throw err;
    });
    return console.log("Followers saved to 'output' folder with name followers.json".green);
}


module.exports = getFollowers;