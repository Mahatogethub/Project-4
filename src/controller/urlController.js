const urlModel=require("../model/urlModel")
const shortid = require('shortid');
const validUrl = /^([hH][tT][tT][pP]([sS])?:\/\/.)(www\.)?[-a-zA-Z0-9@:%.\+#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%\+.#?&//=_]*$)/g;;
//const regex=/^(?=.*[a-zA-Z].*)[a-zA-Z\d!@#-_$%&*]{8,}$/
const redis=require('redis')

const {promisify}=require('util')

const redisClient=redis.createClient(
    14701,
    "redis-14701.c82.us-east-1-2.ec2.cloud.redislabs.com",
    {no_ready_check:true},
);
redisClient.auth("1ovUIx6De4g2JsrCuGJowahLBlZdAvrs", function(err){
      if(err) throw err;
});

redisClient.on("connect",async function(){
     console.log("redis is connected");
})

const SET_ASYNC=promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC=promisify(redisClient.GET).bind(redisClient);

// const cachedLongUrl=async function (req,res){
//     let cachedData=await GET_ASYNC(`${req.params.longUrl}`)
//     if(cachedData) {
//         res.send(cachedData)
//       } else {
//         let profile = await urlModel.findById(req.params.longUrl);
//         await SET_ASYNC(`${req.params.longUrl}`, JSON.stringify(profile))
//         res.send({ data: profile });
//       }
// }

const isValid = function(value) {
    if (typeof value == "undefined" || value == null) return false;
    if (typeof value == "string" && value.trim().length > 0) return true;
    return false;
};

// const isValidRequest = function(object) {
//     return Object.keys(object).length > 0;
// };

const shortenUrl = async(req,res)=>{
    try {
        let longUrl=req.body.longUrl
        if (!isValid(longUrl))
      return res.status(400).send({ status: false, message: "Please provide Url" });
      if (!validUrl.test(longUrl))
      return res.status(400).send({ status: false, message: "Url is invalid" });
        let presentUrl= await urlModel.findOne({longUrl}).select({_id:0,createdAt:0,updatedAt:0,__v:0})
        if(presentUrl){
            return res.status(200).send({ status: true, data:  presentUrl});
        }
        let base="http://localhost:3000/"
        let urlCode=shortid.generate(longUrl)
       
        let shortUrl= base+urlCode
    let newData={
        urlCode:urlCode,
       longUrl:longUrl,
       shortUrl:shortUrl

    }
        let createdUrl= await urlModel.create(newData)

            return res.status(201).send({ status:true, data:  createdUrl});
        
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
}


const getUrl= async(req,res)=>{
    try {
        let urlCode=req.params.urlCode
        let cacheUrl= await GET_ASYNC(`${urlCode}`)
        console.log(cacheUrl+"//REDIS//")
        if(cacheUrl){
            return res.status(302).redirect(cacheUrl)
             }
        let foundUrl= await urlModel.findOne({urlCode})
        console.log(foundUrl)
        if(!foundUrl){
       return res.status(400).send("no such urlCode exist");
        }
        //res.status(200).send();
        await SET_ASYNC(`${urlCode}`,JSON.stringify(foundUrl.longUrl))
       return res.status(302).redirect(foundUrl.longUrl)
    } catch (err) {
        res.status(500).send({ error: err.message });
        
    }
}

module.exports={shortenUrl,getUrl}
