const mongoose = require("mongoose")
const resume = require("../models/resume")

const analyseresume = async(req,res)=>{
    try{
const allResume =  await resume.aggregate([
    {
        $match:{
                user: new mongoose.Types.ObjectId(req.user.userId)

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
res.status(200).json({
    success:true,
     result:allResume[0]/*||{
        totalresume:0,
         maximunscore:0,
            minimumscore:0,
            averagescore:0



    }*/

})
}
catch(error){
    message:error.message

}
}

module.exports = analyseresume
    
