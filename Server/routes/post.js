const express = require('express');
const router =express.Router()
const mongoose =require('mongoose')
const requireLogin = require('../middleware/requireLogin')
const Post =  mongoose.model("Post")

router.get('/allpost',requireLogin,(req,res)=>{
  Post.find()
  .populate("postedBy","_id name")
  .populate("comments.postedBy","_id name")
  .then(posts=>{
    res.json({posts})
  })
  .catch(err=>{
    console.log(err);
  })
})

router.post('/createpost',requireLogin,(req,res)=>{
  const{title,body,pic}=req.body
  if(!title || !body || !pic){
    return res.status(422).json({error:"Please add all the fields"})
  }

  req.user.password=undefined
  const post = new Post({
    title,
    body,
    photo:pic,
    postedBy :req.user
  });
  post.save().then(result=>{
    res.json({post:result})
  })
  .catch(err=>{
    console.log(err);
  })
})


 router.get('/mypost',requireLogin,(req,res)=>{
   Post.find({postedBy:req.user._id})
   .populate("postedBy","_id name")
   .then(mypost=>{
     res.json({mypost});
   })
   .catch(err=>{
     console.log(err);
     res.status(500).json({error:"Server error ."})
   })
 })

 router.put('/like', requireLogin, (req, res) => {
   const postId = req.body.postId;

   Post.findByIdAndUpdate(postId, {
     $push: { likes: req.user._id }
   }, { new: true })
     .then(result => {
       res.json(result);
     })
     .catch(err => {
       res.status(422).json({ error: err });
     });
 });


 router.put('/unlike', requireLogin, (req, res) => {
   const postId = req.body.postId;
   Post.findByIdAndUpdate(postId, {
     $pull: { likes: req.user._id }
   }, { new: true })
     .then(result => {
       res.json(result);
     })
     .catch(err => {
       res.status(422).json({ error: err });
     });
 });

 router.put('/comment', requireLogin, (req, res) => {
  const comment={
    text:req.body.text,
    postedBy:req.user._id
  }

   const postId = req.body.postId;

   Post.findByIdAndUpdate(postId, {
     $push: {comments: comment}
   }, { new: true })

   .populate("comments.postedBy","_id name")
   .populate("postedBy","_id name")
     .then(result => {
       res.json(result);
     })
     .catch(err => {
       res.status(422).json({ error: err });
     });
 });






module.exports=router
