const  { createClient } = require('redis');
const redis = require('redis');

const testData = {
    id: "0001",
    name: "ハヤヤッコ",  // 全角OK
    age: 8
};


const TEST_MAIL_INFO_DATA = {
    mail_id: "M0001",
    subject : "出金通知",
    attribute: {
        amount: 10000,
        place: "a001"
    }
};

const testRedis = async (key) => {
    const client = await createClient()
        .on('error', err => console.log('Redis Client Error', err))
        .connect()

    //console.log(client);

    await client.set(key, JSON.stringify(testData));
    const value = await client.get('key');
    const obj = JSON.parse(value);
    console.log(`\tdata: ${value}, name: ${obj.name}`);
    //await client.close();   // エラーとなる
    await client.quit();  // 古いバージョン
};


const testPubSub = async () => {
    const client = redis.createClient();
    redisClient = await client.on('error', err => console.log('Redis Client Error', err)).connect();

    const publisher = client.duplicate();
    await publisher.connect();
    const subscriber = client.duplicate();
    await subscriber.connect();

    // subscriber.on('message', (channel, message) => console.log('received')); --> This line is useless
    subscriber.subscribe('abc123', (channel, message) => console.log('received:', message, channel)); // --> Instead, you need to listen for messages here
    publisher.publish('abc123','lala');
};


/*
 * Subscriberの起動
 */
const mySubscriber = async (/*channel*/) => {

/*
    const redisClient = await createClient()
        .on('error', err => console.log('Redis Client Error', err))
        .connect()
*/
    const redisClient = await createClient({
        url: 'redis://localhost:6379'
    })
    .on('error', err => console.log('Redis Client Error', err))
    .connect()

    redisClient.subscribe('done01', (channel, message) => console.log('[done01]received:', message));
    redisClient.subscribe('done02', (channel, message) => console.log('[done02]received:', message, channel));

    console.log("subscriber started.");
};


/*
 * Subscriberの起動
 */
const mySubscriber02 = async (/*channel*/) => {

    const redisClient = await createClient()
        .on('error', err => console.log('Redis Client Error', err))
        .connect()
    
    redisClient.subscribe('done01', (channel, message) => console.log('[done01]mySubscriber02 received:', message, channel));

    console.log("subscriber02 started.");
};

const mailSubscriber = async(topic) => {

    const redisClient = await createClient()
        .on('error', err => console.log('Redis Client Error', err))
        .connect();

    redisClient.subscribe(topic, (channel, message) => {
        //console.log(channel);
        const mailData = JSON.parse(channel);
        console.log(`[subscribe] mail data: ${mailData.mail_id}, ${mailData.subject}, ${mailData.attribute.amount}, ${mailData.attribute.place}`);
    });
};


/*
 * Subscriberの起動
 */
const myPublish = async () => {
    const client = await createClient()
        .on('error', err => console.log('Redis Client Error', err))
        .connect()

    client.publish('done01', "ARK01");
    client.publish('done02', "ARK02");
    client.publish('done01', "ARK03");

//    console.log("publish done.", JSON.stringify(testData));

    client.publish('mail-info', JSON.stringify(TEST_MAIL_INFO_DATA));
    console.log("mail-info:", JSON.stringify(TEST_MAIL_INFO_DATA));

};

//mySubscriber();
//mySubscriber02();
mailSubscriber("mail-info");
setTimeout(myPublish, 2000);
//testRedis("test01");
//testRedis("test02");
//testPubSub();

// [Tips]
// リモートのRedisに接続する
//　createClient({
//    url: 'redis://alice:foobared@awesome.redis.server:6380'
//  });
//    → format redis[s]://[[username][:password]@][host][:port][/db-number]:

