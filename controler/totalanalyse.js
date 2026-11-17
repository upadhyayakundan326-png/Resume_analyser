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



const allResume = await resume.aggregate([
    {
        $match: {
            user: currentUser
        }
    },
    {
        $group: {
            _id: null,
            totalresume: { $sum: 1 },
            maximunscore: { $max: "$score" },
            minimumscore: { $min: "$score" },
            averagescore: { $avg: "$score" }
        }
    }
]);

// Agar user ke paas resume nahi hai
const result = allResume[0] || {
    totalresume: 0,
    maximunscore: 0,
    minimumscore: 0,
    averagescore: 0
};

// Redis mein valid data save karo
await redisClient.setEx(
    cachkey,
    300,
    JSON.stringify(result)
);

return res.status(200).json({
    success: true,
    result: result,
    source: "mongo"
});

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
    
