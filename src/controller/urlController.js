const urlModel=require("../model/urlModel")
const shortid = require('shortid');
const redis = require("redis");
const axios = require("axios")
let a =/^www\.[a-z0-9-]+(?:\.[a-z0-9-]+)*\.+(\w)*/

//===========================redis connection=========================//
 
  const redisClient = redis.createClient({
    url: "redis://default:sLGNEs5I3uy7TiCxYJg8S2ksD3X1sjRz@redis-14213.c262.us-east-1-3.ec2.cloud.redislabs.com:14213",
  });
  redisClient.connect();
  redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
  });

const isValid = function(value) {
    if (typeof value == "undefined" || value == null) return false;
    if (typeof value == "string" && value.trim().length > 0) return true;
    return false;
};


//=================================post api====================================//
const shortenUrl = async(req,res)=>{
    try {
        let url=req.body
        if (!isValid(url.longUrl))
      return res.status(400).send({ status: false, message: "Please provide Url" });
      if(a.test(url.longUrl)){
        url.longUrl="http://"+url.longUrl
      }
      let Link = false
      await axios.get(url.longUrl)
          .then((res) => { if (res.status == 200 || res.status == 201) Link = true; })
          .catch((error) => { Link = false })
      if (Link == false) return res.status(400).send({ status: false, message: "invalid url please enter valid url!!" });
        let presentUrl= await redisClient.get(url.longUrl)

     //console.log(presentUrl)
        if(presentUrl){
            return res.status(200).send({ status: true,message:"already created(cache)", data: JSON.parse(presentUrl) });
        }

        let existUrl=await urlModel.findOne({longUrl:url.longUrl})
       if(existUrl){
    await redisClient.set(url.longUrl,JSON.stringify(existUrl))
    return res.status(200).send({ status: true,message:"already created(DB)", data: existUrl });
       }
        let base="http://localhost:3000/"
        let urlCode=shortid.generate(url.longUrl).toLowerCase()

        let shortUrl= base+urlCode
    let newData={
        urlCode:urlCode,
       longUrl:url.longUrl,
       shortUrl:shortUrl

    }
         let savedData=await urlModel.create(newData)
         await redisClient.set(url.longUrl,JSON.stringify(savedData))


            return res.status(201).send({ status: true, data: newData});
        
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
}


const getUrl= async(req,res)=>{
    try {
        let urlCode=req.params.urlCode
        let cacheUrl= await redisClient.get(urlCode)
       // console.log(cacheUrl+"//REDIS//")
        if(cacheUrl){
       return res.status(302).redirect(cacheUrl)
        }
        let foundUrl= await urlModel.findOne({urlCode})
      //  console.log(foundUrl+"//unSet//")
        if(!foundUrl){
       return res.status(404).send("no such urlCode exist");
        }
        await redisClient.set(urlCode,foundUrl.longUrl)
       return res.status(302).redirect(foundUrl.longUrl)
    } catch (err) {
        res.status(500).send({ error: err.message });
        
    }
}

module.exports={shortenUrl,getUrl}


