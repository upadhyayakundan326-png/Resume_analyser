const mongoose = require("mongoose")
const resume = require("../models/resume")
const {redisClient}= require("../config/redis")



const analyseresume = async(req,res)=>{
    try{
        const currentUser =  new mongoose.Types.ObjectId(req.user.userId)
        
        const cachkey = `resume-analysis:${req.user.userId}`;

        const cachedData= await redisClient.get(cachkey)
        if(cachedData){
             console.log("Data Redis se aaya");

            return res.status(200).json({
                success: true,
                source: "redis",
                result: JSON.parse(cachedData)
            });
        }
        console.log("data cannot be find in redis ")


const allResume =  await resume.aggregate([
    {
        
        $match:{
                user: currentUser

        }
    },
    {
        $group:{
            _id:null,
            totalresume:{$sum:1},
            maximunscore:{$max:"$score"},
            minimumscore:{$min:"$score"},
            averagescore:{$avg:"$score"}

        }

    }

  
])
/*console.log("USER ID:", req.user.userId);
console.log("TYPE:", typeof req.user.userId);
console.log("RESULT:", allResume);*/

// set eky in redis 
await redisClient.setEx(
         cachkey,
         300,
         JSON.stringify(allResume[0])
)
res.status(200).json({
    success:true,
     result:allResume[0],
     source:"mongo"
     /*||{
     
        totalresume:0,
         maximunscore:0,
            minimumscore:0,
            averagescore:0



    }*/

})

    
    
}
catch(error){
     return res.status(500).json({
        success: false,
        message: error.message
    });

}
}

module.exports = analyseresume
    
