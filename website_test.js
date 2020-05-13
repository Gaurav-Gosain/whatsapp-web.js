const fs = require('fs');
var request = require('request');
const { Client, Location } = require('./index');
const MessageMedia = require('./src/structures/MessageMedia');
let product_id = "";
let product_name = "";
let description = "";
let cost = 0;
let product_image = "";
var a = "";
var array;
var j = "firstName: 'vfsdf',lastName: 'sdfsdf',companyName: 'sdfsdf',logoUrl: 'sdfsdf',bannerUrl: 'sdfsdfsdf',email: 'sdfsdf@fssdfsfd.com',description: 'sdfsdfsdf',template: 'Colo_Shop'";
const SESSION_FILE_PATH = './session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) 
{
    sessionCfg = require(SESSION_FILE_PATH);
}

const client = new Client({ puppeteer: { headless: false }, session: sessionCfg });
client.initialize();
client.on('qr', (qr) => 
{
    console.log('QR RECEIVED', qr);
});

client.on('authenticated', (session) => 
{
    console.log('AUTHENTICATED', session);
    sessionCfg=session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) 
        {
            console.error(err);
        }
    });
});
client.on('auth_failure', msg => 
{
    console.error('AUTHENTICATION FAILURE', msg);
});
client.on('ready', () => 
{
    console.log('READY');
});
a = "product id,product name,description,cost,product image url";
client.on('message', async msg => 
{
    console.log('MESSAGE RECEIVED', msg);
    if (msg.body == 'new row') 
    {
        msg.reply("Enter the following commands:");
        client.sendMessage(msg.from, 'product id: *INFORMATION GOES HERE*');
        client.sendMessage(msg.from, 'product name: *INFORMATION GOES HERE*')
        client.sendMessage(msg.from, 'description: *INFORMATION GOES HERE*')
        client.sendMessage(msg.from, 'cost: *INFORMATION GOES HERE*')
        client.sendMessage(msg.from, 'product image: *ATTACH IMAGE HERE*')
        client.sendMessage(msg.from, '!done when all information is entered')
        fs.writeFileSync('./test.csv', a);
        product_id = "";
        product_name = "";
        description = "";
        cost = 0;
        product_image = "";
    }
    else if (msg.body.startsWith('product id:')) 
    {
        product_id = msg.body.slice(11);
        console.log("".concat("Product ID = ", product_id));
    }
    else if (msg.body.startsWith('product name:')) 
    {
        product_name = msg.body.slice(13);
        console.log("".concat("Product Name = ", product_name));
    }
    else if (msg.body.startsWith("description:"))
    {
        description = msg.body.slice(12);
        console.log("".concat("Description = ", product_name));
    }
    else if (msg.body.startsWith('cost:')) 
    {
        cost = Number(msg.body.slice(5));
        console.log("".concat("Cost = ", product_name));
    }
    else if (msg.body == 'product image:' && msg.hasMedia)
    {
        product_image = await msg.downloadMedia();
        // const attachmentData = new MessageMedia('image/png',fs.readFileSync(memePath,'base64'),'meme.png');
        console.log(product_image);
    }
    else if(msg.body == "!done")
    {
        var s = "";
        var comma = "," ;
        s = "\n".concat(product_id,comma,product_name,comma,description,comma,cost,comma,"data:image/jpeg;base64 ",product_image["data"]); 
        console.log(a)
        a = a.concat(s)
        console.log(a)
        // fs.writeFileSync('./test.csv', a);
    }
 
    else if(msg.body == "!info")
    {
        client.sendMessage(msg.from,"For entering details enter details using the following syntax :");
        client.sendMessage(msg.from,"!details firstName,lastName,companyName,logoUrl,bannerUrl,email,description");
    }
    else if(msg.body.startsWith("!details"))
    {
        var message = msg.body.slice(6);
        array = message.split(",");
    }
    else if(msg.body == "!finished")
    {
        j = {firstName: "",
        lastName: "",
        companyName: "",
        logoUrl: "",
        bannerUrl: "",
        email: "",
        description: "",
        template: "Colo_Shop",
        csv: "" };

        j["firstName"] = array[0];
        j["lastName"] = array[1];
        j["companyName"] = array[2];
        j["logoUrl"] = array[3];
        j["bannerUrl"] = array[4];
        j["email"] = array[5];
        j["description"] = array[6];
        j["csv"] = a ;
        j = JSON.stringify(j);
        console.log(j)
        request({
            url: "http://localhost:8004/generate",
            method: "POST",
            headers: {
                "content-type": "application/json",  // <--Very important!!!
            },
            body: j
        }, function (error, response, body){
            client.sendMessage(msg.from, "https://localhost:8004" + "/pages/" + JSON.parse(response.body).directory);
        });
        // var website_link = "https://localhost:8004" + "/pages/" + data.directory
    }

});

client.on('disconnected', (reason) => 
{
    console.log('Client was logged out', reason);
});

