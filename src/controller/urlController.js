const urlModel=require("../model/urlModel")
const shortid = require('shortid');
const redis = require("redis");
const { promisify } = require("util");
// const axios = require("axios")
const validUrl = require('valid-url')
let a =/^www\.[a-z0-9-]+(?:\.[a-z0-9-]+)*\.+(\w)*/


const redisClient = redis.createClient(

    14213,
    "redis-14213.c262.us-east-1-3.ec2.cloud.redislabs.com",
    { no_ready_check: true }
  );
  redisClient.auth("sLGNEs5I3uy7TiCxYJg8S2ksD3X1sjRz", function (err) {

    if (err) throw err;
  });
  
  redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
  });
  
  
  //1. connect to the server
  //2. use the commands :
  
  //Connection setup for redis
  
  const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
  const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);
const isValid = function(value) {
    if (typeof value == "undefined" || value == null) return false;
    if (typeof value == "string" && value.trim().length > 0) return true;
    return false;
};

const shortenUrl = async(req,res)=>{
    try {
        let url=req.body
        if (!isValid(url.longUrl))
      return res.status(400).send({ status: false, message: "Please provide Url" });
      if(a.test(url.longUrl)){
        url.longUrl="http://"+url.longUrl
        console.log(url.longUrl)
      }
  
      if(!validUrl.isWebUri(url.longUrl))
      {
           return res.status(400).send({status:false,msg:"not a valid url"})
         }
        let presentUrl= await GET_ASYNC(url.longUrl)
        //console.log(presentUrl)
        if(presentUrl){
            return res.status(200).send({ status: true,message:"already created(cache)", data: JSON.parse(presentUrl) });
        }

        let existUrl=await urlModel.findOne({longUrl:url.longUrl})
       if(existUrl){
    await SET_ASYNC(url.longUrl,JSON.stringify(existUrl))
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
         await SET_ASYNC(url.longUrl,JSON.stringify(savedData))


            return res.status(201).send({ status: true, data: newData});
        
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
}


const getUrl= async(req,res)=>{
    try {
        let urlCode=req.params.urlCode
        let cacheUrl= await GET_ASYNC(urlCode)
       // console.log(cacheUrl+"//REDIS//")
        if(cacheUrl){
       return res.status(302).redirect(cacheUrl)
        }
        let foundUrl= await urlModel.findOne({urlCode})
      //  console.log(foundUrl+"//unSet//")
        if(!foundUrl){
       return res.status(400).send("no such urlCode exist");
        }
        await SET_ASYNC(urlCode,foundUrl.longUrl)
       return res.status(302).redirect(foundUrl.longUrl)
    } catch (err) {
        res.status(500).send({ error: err.message });
        
    }
}

module.exports={shortenUrl,getUrl}