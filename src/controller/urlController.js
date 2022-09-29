const urlModel=require('../controller/urlController')
const validateUrl=require('valid-url')
const shortId=require("shortid")

const creatUrl=async function(req,res){
    let data=req.body
    if(Object.keys(data).length==0){
        return res.status(400).send({status:false,message:"Body should not be empty"})
    }
   else if(!data.longUrl){
    return res.status(400).send({status:false,message:"longUrl is mandatory"})
   }
   else if(!validateUrl(data.longUrl)){
    return res.status(400).send({status:false,message:"valid URL must be present"})
   }
   else if(!data.shortUrl){
    return res.status(400).send({status:false,message:"shortUrl must be present"})
   }
   else if(!shortId(data.shortid)){
      return res.status(400).send({status:false,message:"shortId must be valid"})
}
else{
    res.status(400).send({status:true,message:"must provide data"})
}
longUrl=shorturl

 let createUrl=await urlModel.create(data)
 res.status(201).send({status:true,message:createUrl})
}
//if("((http|https)://)(www.)?[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)"){}


// const getUrl=async function(req.res){
//     let 
//     let getData= await urlModel.find()
// }