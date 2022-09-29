const express=require('express')
const router=require(express.Router())
const urlController=require('../controller/urlController')

router.post('/any',urlController)

module.exports=router

